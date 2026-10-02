import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, QueryFilter, SortOrder, Types } from 'mongoose';
import { Paginated } from '../common/dto/pagination-query.dto';
import { NewsType } from '../common/enums/news-type.enum';
import {
  isCurrentRotaryYear,
  parseRotaryYearLabel,
  rotaryYearBounds,
  rotaryYearLabel,
} from '../common/utils/rotary-year';
import { slugify, withSlugSuffix } from '../common/utils/slug';
import { RotaryYear } from '../rotary-years/schemas/rotary-year.schema';
import { CreateNewsDto } from './dto/create-news.dto';
import { QueryAdminNewsDto } from './dto/query-admin-news.dto';
import { QueryPublicNewsDto } from './dto/query-public-news.dto';
import { UpdateNewsDto } from './dto/update-news.dto';
import { News } from './schemas/news.schema';

export type AdminNewsView = {
  id: string;
  title: string;
  slug: string;
  type: NewsType;
  date: Date;
  rotaryYear: { id: string; label: string };
  location: string | null;
  summary: string | null;
  content: string | null;
  isPublished: boolean;
  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

// Forme publique : ni état de publication, ni date technique.
export type PublicNewsView = {
  id: string;
  slug: string;
  title: string;
  type: NewsType;
  date: Date;
  rotaryYear: string;
  location?: string;
  summary?: string;
  content?: string;
};

// Une année Rotary qui a des actualités publiées, avec leur nombre.
export type NewsArchiveView = {
  rotaryYear: {
    id: string;
    startYear: number;
    label: string;
    startDate: Date;
    endDate: Date;
    isCurrent: boolean;
  };
  count: number;
};

type NewsDocument = News & { _id: Types.ObjectId };

// Désigne la route /news/archives : aucune actualité ne peut le porter.
const RESERVED_SLUG = 'archives';
const SLUG_ATTEMPTS = 5;
const CLEARABLE_FIELDS = ['location', 'summary', 'content'] as const;

const ADMIN_SORTS: Record<
  QueryAdminNewsDto['sort'],
  Record<string, SortOrder>
> = {
  '-date': { date: -1, _id: 1 },
  date: { date: 1, _id: 1 },
  title: { title: 1, _id: 1 },
  '-title': { title: -1, _id: 1 },
  createdAt: { createdAt: 1, _id: 1 },
  '-createdAt': { createdAt: -1, _id: 1 },
};

function invalid(field: string, message: string): BadRequestException {
  return new BadRequestException({
    message: 'Données invalides.',
    details: [{ field, message }],
  });
}

function isDuplicateKey(error: unknown): boolean {
  return (error as { code?: unknown }).code === 11000;
}

function toAdminView(news: NewsDocument, startYear: number): AdminNewsView {
  return {
    id: news._id.toString(),
    title: news.title,
    slug: news.slug,
    type: news.type,
    date: news.date,
    rotaryYear: {
      id: news.rotaryYear.toString(),
      label: rotaryYearLabel(startYear),
    },
    location: news.location ?? null,
    summary: news.summary ?? null,
    content: news.content ?? null,
    isPublished: news.isPublished,
    publishedAt: news.publishedAt ?? null,
    createdAt: news.createdAt,
    updatedAt: news.updatedAt,
  };
}

function toPublicView(news: NewsDocument, startYear: number): PublicNewsView {
  return {
    id: news._id.toString(),
    slug: news.slug,
    title: news.title,
    type: news.type,
    date: news.date,
    rotaryYear: rotaryYearLabel(startYear),
    ...(news.location ? { location: news.location } : {}),
    ...(news.summary ? { summary: news.summary } : {}),
    ...(news.content ? { content: news.content } : {}),
  };
}

function emptyPage<T>(page: number, limit: number): Paginated<T> {
  return { data: [], meta: { page, limit, total: 0, totalPages: 0 } };
}

@Injectable()
export class NewsService {
  constructor(
    @InjectModel(News.name) private readonly newsModel: Model<News>,
    @InjectModel(RotaryYear.name)
    private readonly rotaryYearModel: Model<RotaryYear>,
  ) {}

  // --- Administration ---

  async findAllForAdmin(
    query: QueryAdminNewsDto,
  ): Promise<Paginated<AdminNewsView>> {
    const { page, limit } = query;
    const filter = await this.buildFilter(query);
    if (!filter) {
      return emptyPage(page, limit);
    }
    if (query.published !== undefined) {
      filter.isPublished = query.published === 'true';
    }

    const [total, items] = await Promise.all([
      this.newsModel.countDocuments(filter).exec(),
      this.newsModel
        .find(filter)
        .sort(ADMIN_SORTS[query.sort])
        .skip((page - 1) * limit)
        .limit(limit)
        .lean()
        .exec(),
    ]);
    const startYears = await this.startYearsOf(items);

    return {
      data: items.flatMap((news) => {
        const startYear = startYears.get(news.rotaryYear.toString());
        return startYear === undefined ? [] : [toAdminView(news, startYear)];
      }),
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOneForAdmin(id: string): Promise<AdminNewsView> {
    const news = await this.newsModel.findById(id).lean().exec();
    if (!news) {
      throw new NotFoundException();
    }
    return this.toAdminViewOf(news);
  }

  async create(dto: CreateNewsDto): Promise<AdminNewsView> {
    const year = await this.existingYear(dto.rotaryYear);
    const isPublished = dto.isPublished ?? false;
    const fields = {
      title: dto.title,
      type: dto.type,
      date: new Date(dto.date),
      // L'année choisie est enregistrée telle quelle, sans regarder la date.
      rotaryYear: year._id,
      location: dto.location ?? undefined,
      summary: dto.summary ?? undefined,
      content: dto.content ?? undefined,
      isPublished,
    };
    // Une actualité créée publiée prend sa date de création comme date de
    // première publication : les deux dates sont le même instant.
    const publication = (): { createdAt?: Date; publishedAt?: Date } => {
      const now = new Date();
      return isPublished ? { createdAt: now, publishedAt: now } : {};
    };

    if (dto.slug !== undefined) {
      // Un slug choisi par l'administrateur n'est jamais modifié : il est
      // accepté tel quel ou refusé.
      this.assertSlugNotReserved(dto.slug);
      try {
        const news = await this.newsModel.create({
          ...fields,
          ...publication(),
          slug: dto.slug,
        });
        return toAdminView(news.toObject(), year.startYear);
      } catch (error) {
        if (isDuplicateKey(error)) {
          throw new ConflictException();
        }
        throw error;
      }
    }

    const base = slugify(dto.title);
    if (!base) {
      throw invalid(
        'slug',
        'Aucun slug ne peut être tiré de ce titre : fournissez-en un.',
      );
    }
    // Deux créations simultanées peuvent choisir le même slug ; l'index unique
    // refuse la seconde, qui recalcule et réessaie.
    for (let attempt = 0; attempt < SLUG_ATTEMPTS; attempt += 1) {
      try {
        const slug = await this.nextFreeSlug(base);
        const news = await this.newsModel.create({
          ...fields,
          ...publication(),
          slug,
        });
        return toAdminView(news.toObject(), year.startYear);
      } catch (error) {
        if (!isDuplicateKey(error)) {
          throw error;
        }
      }
    }
    throw new ConflictException();
  }

  async update(id: string, dto: UpdateNewsDto): Promise<AdminNewsView> {
    const news = await this.newsModel.findById(id).lean().exec();
    if (!news) {
      throw new NotFoundException();
    }

    const set: Record<string, unknown> = {};
    const unset: Record<string, ''> = {};

    if (dto.title !== undefined) {
      set.title = dto.title;
    }
    // Le slug ne change que s'il est envoyé : modifier le titre ne le régénère
    // pas.
    if (dto.slug !== undefined) {
      this.assertSlugNotReserved(dto.slug);
      set.slug = dto.slug;
    }
    if (dto.type !== undefined) {
      set.type = dto.type;
    }
    if (dto.date !== undefined) {
      set.date = new Date(dto.date);
    }
    if (dto.rotaryYear !== undefined) {
      set.rotaryYear = (await this.existingYear(dto.rotaryYear))._id;
    }
    // null efface la valeur ; un champ absent est inchangé.
    for (const field of CLEARABLE_FIELDS) {
      const value = dto[field];
      if (value === null) {
        unset[field] = '';
      } else if (value !== undefined) {
        set[field] = value;
      }
    }
    if (dto.isPublished !== undefined) {
      set.isPublished = dto.isPublished;
      // Posée à la première publication seulement, jamais réécrite.
      if (dto.isPublished && !news.publishedAt) {
        set.publishedAt = new Date();
      }
    }

    let updated: NewsDocument | null;
    try {
      updated = await this.newsModel
        .findByIdAndUpdate(
          id,
          {
            ...(Object.keys(set).length > 0 ? { $set: set } : {}),
            ...(Object.keys(unset).length > 0 ? { $unset: unset } : {}),
          },
          { new: true, runValidators: true },
        )
        .lean()
        .exec();
    } catch (error) {
      // Slug déjà porté par une autre actualité.
      if (isDuplicateKey(error)) {
        throw new ConflictException();
      }
      throw error;
    }
    if (!updated) {
      throw new NotFoundException();
    }
    return this.toAdminViewOf(updated);
  }

  async remove(id: string): Promise<void> {
    const deleted = await this.newsModel.findByIdAndDelete(id).exec();
    if (!deleted) {
      throw new NotFoundException();
    }
  }

  // --- Lecture publique : actualités publiées seulement ---

  async findPublished(
    query: QueryPublicNewsDto,
  ): Promise<Paginated<PublicNewsView>> {
    const { page, limit } = query;
    const filter = await this.buildFilter(query);
    if (!filter) {
      return emptyPage(page, limit);
    }
    filter.isPublished = true;

    const [total, items] = await Promise.all([
      this.newsModel.countDocuments(filter).exec(),
      this.newsModel
        .find(filter)
        // La plus récente d'abord ; l'identifiant rend la pagination stable.
        .sort({ date: -1, _id: 1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean()
        .exec(),
    ]);
    const startYears = await this.startYearsOf(items);

    return {
      data: items.flatMap((news) => {
        const startYear = startYears.get(news.rotaryYear.toString());
        return startYear === undefined ? [] : [toPublicView(news, startYear)];
      }),
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  // Un brouillon répond comme s'il n'existait pas.
  async findPublishedBySlug(slug: string): Promise<PublicNewsView> {
    const news = await this.newsModel
      .findOne({ slug, isPublished: true })
      .lean()
      .exec();
    const startYear = news
      ? (await this.startYearsOf([news])).get(news.rotaryYear.toString())
      : undefined;
    if (!news || startYear === undefined) {
      throw new NotFoundException();
    }
    return toPublicView(news, startYear);
  }

  // Les années Rotary qui ont au moins une actualité publiée, avec leur nombre,
  // de la plus récente à la plus ancienne. Les brouillons ne sont pas comptés.
  async findArchives(): Promise<NewsArchiveView[]> {
    const now = new Date();
    const counts = await this.newsModel
      .aggregate<{ _id: Types.ObjectId; count: number }>([
        { $match: { isPublished: true } },
        { $group: { _id: '$rotaryYear', count: { $sum: 1 } } },
      ])
      .exec();
    const countByYear = new Map(
      counts.map((entry) => [entry._id.toString(), entry.count]),
    );
    const years = await this.rotaryYearModel
      .find({ _id: { $in: counts.map((entry) => entry._id) } })
      .sort({ startYear: -1 })
      .lean()
      .exec();

    return years.map(({ _id, startYear }) => ({
      rotaryYear: {
        id: _id.toString(),
        startYear,
        label: rotaryYearLabel(startYear),
        ...rotaryYearBounds(startYear),
        isCurrent: isCurrentRotaryYear(startYear, now),
      },
      count: countByYear.get(_id.toString()) ?? 0,
    }));
  }

  // --- Aides ---

  // Filtre commun aux deux listes ; null quand l'année demandée n'existe pas.
  private async buildFilter(query: {
    q?: string;
    year?: string;
    type?: NewsType;
  }): Promise<QueryFilter<News> | null> {
    const filter: QueryFilter<News> = {};
    if (query.year !== undefined) {
      const year = await this.rotaryYearModel
        .findOne({ startYear: parseRotaryYearLabel(query.year) })
        .lean()
        .exec();
      if (!year) {
        return null;
      }
      filter.rotaryYear = year._id;
    }
    if (query.type !== undefined) {
      filter.type = query.type;
    }
    if (query.q !== undefined) {
      filter.$text = { $search: query.q };
    }
    return filter;
  }

  private async existingYear(
    id: string,
  ): Promise<RotaryYear & { _id: Types.ObjectId }> {
    const year = await this.rotaryYearModel.findById(id).lean().exec();
    if (!year) {
      throw invalid('rotaryYear', "Cette année Rotary n'existe pas.");
    }
    return year;
  }

  private assertSlugNotReserved(slug: string): void {
    if (slug === RESERVED_SLUG) {
      throw invalid('slug', 'Ce slug est réservé.');
    }
  }

  // La base si elle est libre, sinon le premier suffixe libre à partir de -2.
  private async nextFreeSlug(base: string): Promise<string> {
    const isTaken = async (slug: string): Promise<boolean> =>
      slug === RESERVED_SLUG ||
      (await this.newsModel.exists({ slug }).exec()) !== null;

    if (!(await isTaken(base))) {
      return base;
    }
    for (let suffix = 2; ; suffix += 1) {
      const candidate = withSlugSuffix(base, suffix);
      if (!(await isTaken(candidate))) {
        return candidate;
      }
    }
  }

  private async toAdminViewOf(news: NewsDocument): Promise<AdminNewsView> {
    const startYear = (await this.startYearsOf([news])).get(
      news.rotaryYear.toString(),
    );
    if (startYear === undefined) {
      throw new NotFoundException();
    }
    return toAdminView(news, startYear);
  }

  private async startYearsOf(
    items: NewsDocument[],
  ): Promise<Map<string, number>> {
    const years = await this.rotaryYearModel
      .find({ _id: { $in: items.map((news) => news.rotaryYear) } })
      .lean()
      .exec();
    return new Map(years.map((year) => [year._id.toString(), year.startYear]));
  }
}
