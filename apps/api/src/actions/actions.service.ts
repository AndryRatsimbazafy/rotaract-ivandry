import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, QueryFilter, SortOrder, Types } from 'mongoose';
import { Paginated } from '../common/dto/pagination-query.dto';
import { FocusArea } from '../common/enums/focus-area.enum';
import {
  isCurrentRotaryYear,
  parseRotaryYearLabel,
  rotaryYearBounds,
  rotaryYearLabel,
} from '../common/utils/rotary-year';
import { slugify, withSlugSuffix } from '../common/utils/slug';
import { RotaryYear } from '../rotary-years/schemas/rotary-year.schema';
import { ActionImpactDto, CreateActionDto } from './dto/create-action.dto';
import { QueryAdminActionsDto } from './dto/query-admin-actions.dto';
import { QueryPublicActionsDto } from './dto/query-public-actions.dto';
import { UpdateActionDto } from './dto/update-action.dto';
import { Action, ActionImpact } from './schemas/action.schema';

type ImpactView = {
  objective?: string;
  beneficiaries?: string;
  location?: string;
  period?: string;
  partners?: string[];
  results?: string;
};

export type AdminActionView = {
  id: string;
  title: string;
  slug: string;
  summary: string | null;
  description: string | null;
  date: Date;
  rotaryYear: { id: string; label: string };
  focusAreas: FocusArea[];
  impact?: ImpactView;
  isPublished: boolean;
  publishedAt: Date | null;
  order: number | null;
  createdAt: Date;
  updatedAt: Date;
};

// Forme publique : ni état de publication, ni ordre, ni date technique.
export type PublicActionView = {
  id: string;
  slug: string;
  title: string;
  summary?: string;
  description?: string;
  date: Date;
  rotaryYear: string;
  focusAreas: FocusArea[];
  impact?: ImpactView;
};

export type ActionYearView = {
  id: string;
  startYear: number;
  label: string;
  startDate: Date;
  endDate: Date;
  isCurrent: boolean;
};

type ActionDocument = Action & { _id: Types.ObjectId };

// Désigne la route /actions/years : aucune action ne peut le porter.
const RESERVED_SLUG = 'years';
const SLUG_ATTEMPTS = 5;
const IMPACT_TEXT_FIELDS = [
  'objective',
  'beneficiaries',
  'location',
  'period',
  'results',
] as const;

const ADMIN_SORTS: Record<
  QueryAdminActionsDto['sort'],
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

// Seules les rubriques renseignées ; undefined s'il n'y en a aucune.
function impactOf(
  impact: ActionImpact | ActionImpactDto | null | undefined,
): ImpactView | undefined {
  if (!impact) {
    return undefined;
  }
  const view: ImpactView = {};
  for (const field of IMPACT_TEXT_FIELDS) {
    const value = impact[field];
    if (value) {
      view[field] = value;
    }
  }
  if (impact.partners && impact.partners.length > 0) {
    view.partners = [...impact.partners];
  }
  return Object.keys(view).length > 0 ? view : undefined;
}

function toAdminView(
  action: ActionDocument,
  startYear: number,
): AdminActionView {
  const impact = impactOf(action.impact);
  return {
    id: action._id.toString(),
    title: action.title,
    slug: action.slug,
    summary: action.summary ?? null,
    description: action.description ?? null,
    date: action.date,
    rotaryYear: {
      id: action.rotaryYear.toString(),
      label: rotaryYearLabel(startYear),
    },
    focusAreas: action.focusAreas,
    ...(impact ? { impact } : {}),
    isPublished: action.isPublished,
    publishedAt: action.publishedAt ?? null,
    order: action.order ?? null,
    createdAt: action.createdAt,
    updatedAt: action.updatedAt,
  };
}

function toPublicView(
  action: ActionDocument,
  startYear: number,
): PublicActionView {
  const impact = impactOf(action.impact);
  return {
    id: action._id.toString(),
    slug: action.slug,
    title: action.title,
    ...(action.summary ? { summary: action.summary } : {}),
    ...(action.description ? { description: action.description } : {}),
    date: action.date,
    rotaryYear: rotaryYearLabel(startYear),
    focusAreas: action.focusAreas,
    ...(impact ? { impact } : {}),
  };
}

function emptyPage<T>(page: number, limit: number): Paginated<T> {
  return { data: [], meta: { page, limit, total: 0, totalPages: 0 } };
}

@Injectable()
export class ActionsService {
  constructor(
    @InjectModel(Action.name) private readonly actionModel: Model<Action>,
    @InjectModel(RotaryYear.name)
    private readonly rotaryYearModel: Model<RotaryYear>,
  ) {}

  // --- Administration ---

  async findAllForAdmin(
    query: QueryAdminActionsDto,
  ): Promise<Paginated<AdminActionView>> {
    const { page, limit } = query;
    const filter = await this.buildFilter(query);
    if (!filter) {
      return emptyPage(page, limit);
    }
    if (query.published !== undefined) {
      filter.isPublished = query.published === 'true';
    }

    const [total, actions] = await Promise.all([
      this.actionModel.countDocuments(filter).exec(),
      this.actionModel
        .find(filter)
        .sort(ADMIN_SORTS[query.sort])
        .skip((page - 1) * limit)
        .limit(limit)
        .lean()
        .exec(),
    ]);
    const startYears = await this.startYearsOf(actions);

    return {
      data: actions.flatMap((action) => {
        const startYear = startYears.get(action.rotaryYear.toString());
        return startYear === undefined ? [] : [toAdminView(action, startYear)];
      }),
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOneForAdmin(id: string): Promise<AdminActionView> {
    const action = await this.actionModel.findById(id).lean().exec();
    if (!action) {
      throw new NotFoundException();
    }
    return this.toAdminViewOf(action);
  }

  async create(dto: CreateActionDto): Promise<AdminActionView> {
    const year = await this.existingYear(dto.rotaryYear);
    const impact = impactOf(dto.impact);
    const isPublished = dto.isPublished ?? false;
    const fields = {
      title: dto.title,
      summary: dto.summary,
      description: dto.description,
      date: new Date(dto.date),
      // L'année choisie est enregistrée telle quelle, sans regarder la date.
      rotaryYear: year._id,
      focusAreas: dto.focusAreas ?? [],
      ...(impact ? { impact } : {}),
      isPublished,
      order: dto.order,
    };
    // Une action créée publiée prend sa date de création comme date de
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
        const action = await this.actionModel.create({
          ...fields,
          ...publication(),
          slug: dto.slug,
        });
        return toAdminView(action.toObject(), year.startYear);
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
        const action = await this.actionModel.create({
          ...fields,
          ...publication(),
          slug,
        });
        return toAdminView(action.toObject(), year.startYear);
      } catch (error) {
        if (!isDuplicateKey(error)) {
          throw error;
        }
      }
    }
    throw new ConflictException();
  }

  async update(id: string, dto: UpdateActionDto): Promise<AdminActionView> {
    const action = await this.actionModel.findById(id).lean().exec();
    if (!action) {
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
    if (dto.date !== undefined) {
      set.date = new Date(dto.date);
    }
    if (dto.rotaryYear !== undefined) {
      set.rotaryYear = (await this.existingYear(dto.rotaryYear))._id;
    }
    if (dto.focusAreas !== undefined) {
      set.focusAreas = dto.focusAreas;
    }
    // null efface la valeur ; un champ absent est inchangé.
    for (const field of ['summary', 'description', 'order'] as const) {
      const value = dto[field];
      if (value === null) {
        unset[field] = '';
      } else if (value !== undefined) {
        set[field] = value;
      }
    }
    // L'impact est remplacé en entier, sans fusion. Sans aucune rubrique, il
    // n'existe pas.
    if (dto.impact !== undefined) {
      const impact = impactOf(dto.impact);
      if (impact) {
        set.impact = impact;
      } else {
        unset.impact = '';
      }
    }
    if (dto.isPublished !== undefined) {
      set.isPublished = dto.isPublished;
      // Posée à la première publication seulement, jamais réécrite.
      if (dto.isPublished && !action.publishedAt) {
        set.publishedAt = new Date();
      }
    }

    let updated: ActionDocument | null;
    try {
      updated = await this.actionModel
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
      // Slug déjà porté par une autre action.
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
    const deleted = await this.actionModel.findByIdAndDelete(id).exec();
    if (!deleted) {
      throw new NotFoundException();
    }
  }

  // --- Lecture publique : actions publiées seulement ---

  async findPublished(
    query: QueryPublicActionsDto,
  ): Promise<Paginated<PublicActionView>> {
    const { page, limit } = query;
    const filter = await this.buildFilter(query);
    if (!filter) {
      return emptyPage(page, limit);
    }
    filter.isPublished = true;

    const [total, actions] = await Promise.all([
      this.actionModel.countDocuments(filter).exec(),
      // Les actions qui ont un ordre d'abord, par ordre croissant ; puis par
      // date décroissante ; puis par identifiant, pour une pagination stable.
      // Un tri simple placerait en tête celles qui n'ont pas d'ordre.
      this.actionModel
        .aggregate<ActionDocument>([
          { $match: filter },
          {
            $addFields: {
              hasNoOrder: { $cond: [{ $gte: ['$order', 1] }, 0, 1] },
            },
          },
          { $sort: { hasNoOrder: 1, order: 1, date: -1, _id: 1 } },
          { $skip: (page - 1) * limit },
          { $limit: limit },
        ])
        .exec(),
    ]);
    const startYears = await this.startYearsOf(actions);

    return {
      data: actions.flatMap((action) => {
        const startYear = startYears.get(action.rotaryYear.toString());
        return startYear === undefined ? [] : [toPublicView(action, startYear)];
      }),
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  // Un brouillon répond comme s'il n'existait pas.
  async findPublishedBySlug(slug: string): Promise<PublicActionView> {
    const action = await this.actionModel
      .findOne({ slug, isPublished: true })
      .lean()
      .exec();
    const startYear = action
      ? (await this.startYearsOf([action])).get(action.rotaryYear.toString())
      : undefined;
    if (!action || startYear === undefined) {
      throw new NotFoundException();
    }
    return toPublicView(action, startYear);
  }

  // Les années qui ont au moins une action publiée, de la plus récente à la
  // plus ancienne, dans la forme de la liste des années Rotary.
  async findYears(): Promise<ActionYearView[]> {
    const now = new Date();
    const years = await this.rotaryYearModel
      .find({
        _id: {
          $in: await this.actionModel.distinct('rotaryYear', {
            isPublished: true,
          }),
        },
      })
      .sort({ startYear: -1 })
      .lean()
      .exec();

    return years.map(({ _id, startYear }) => ({
      id: _id.toString(),
      startYear,
      label: rotaryYearLabel(startYear),
      ...rotaryYearBounds(startYear),
      isCurrent: isCurrentRotaryYear(startYear, now),
    }));
  }

  // --- Aides ---

  // Filtre commun aux deux listes ; null quand l'année demandée n'existe pas.
  private async buildFilter(query: {
    q?: string;
    year?: string;
    focusArea?: FocusArea;
  }): Promise<QueryFilter<Action> | null> {
    const filter: QueryFilter<Action> = {};
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
    if (query.focusArea !== undefined) {
      filter.focusAreas = query.focusArea;
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
      (await this.actionModel.exists({ slug }).exec()) !== null;

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

  private async toAdminViewOf(
    action: ActionDocument,
  ): Promise<AdminActionView> {
    const startYear = (await this.startYearsOf([action])).get(
      action.rotaryYear.toString(),
    );
    if (startYear === undefined) {
      throw new NotFoundException();
    }
    return toAdminView(action, startYear);
  }

  private async startYearsOf(
    actions: ActionDocument[],
  ): Promise<Map<string, number>> {
    const years = await this.rotaryYearModel
      .find({ _id: { $in: actions.map((action) => action.rotaryYear) } })
      .lean()
      .exec();
    return new Map(years.map((year) => [year._id.toString(), year.startYear]));
  }
}
