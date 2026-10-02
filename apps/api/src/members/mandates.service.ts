import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model, QueryFilter, Types } from 'mongoose';
import { MemberRole } from '../common/enums/member-role.enum';
import {
  isCurrentRotaryYear,
  parseRotaryYearLabel,
  rotaryStartYearAt,
  rotaryYearBounds,
  rotaryYearLabel,
} from '../common/utils/rotary-year';
import { RotaryYear } from '../rotary-years/schemas/rotary-year.schema';
import { CreateMandateDto } from './dto/create-mandate.dto';
import { QueryDirectoryDto } from './dto/query-directory.dto';
import { QueryMandatesDto } from './dto/query-mandates.dto';
import {
  MANDATE_IDS_MESSAGE,
  ReorderMandatesDto,
} from './dto/reorder-mandates.dto';
import { UpdateMandateDto } from './dto/update-mandate.dto';
import { MemberMandate } from './schemas/member-mandate.schema';
import { Member } from './schemas/member.schema';

export type MandateView = {
  id: string;
  member: string;
  rotaryYear: { id: string; label: string };
  roles: MemberRole[];
  order: number;
  createdAt: Date;
  updatedAt: Date;
};

// Forme publique : jamais d'email, de téléphone ni de date technique.
export type DirectoryEntryView = {
  id: string;
  firstName: string;
  lastName: string;
  occupation?: string;
  rotaryYear: string;
  roles: MemberRole[];
  order: number;
};

export type MemberYearView = {
  id: string;
  startYear: number;
  label: string;
  startDate: Date;
  endDate: Date;
  isCurrent: boolean;
};

type MandateDocument = MemberMandate & { _id: Types.ObjectId };

const ORDER_ATTEMPTS = 3;

function invalid(field: string, message: string): BadRequestException {
  return new BadRequestException({
    message: 'Données invalides.',
    details: [{ field, message }],
  });
}

// Erreur de clé dupliquée de la base : dit quel index unique est en cause.
function duplicateKeyOn(error: unknown): 'couple' | 'order' | null {
  const { code, keyPattern } = error as {
    code?: unknown;
    keyPattern?: Record<string, unknown>;
  };
  if (code !== 11000) {
    return null;
  }
  return keyPattern && 'order' in keyPattern ? 'order' : 'couple';
}

function toView(mandate: MandateDocument, startYear: number): MandateView {
  return {
    id: mandate._id.toString(),
    member: mandate.member.toString(),
    rotaryYear: {
      id: mandate.rotaryYear.toString(),
      label: rotaryYearLabel(startYear),
    },
    roles: mandate.roles,
    order: mandate.order,
    createdAt: mandate.createdAt,
    updatedAt: mandate.updatedAt,
  };
}

@Injectable()
export class MandatesService {
  constructor(
    @InjectConnection() private readonly connection: Connection,
    @InjectModel(MemberMandate.name)
    private readonly mandateModel: Model<MemberMandate>,
    @InjectModel(Member.name) private readonly memberModel: Model<Member>,
    @InjectModel(RotaryYear.name)
    private readonly rotaryYearModel: Model<RotaryYear>,
  ) {}

  async findAll(query: QueryMandatesDto): Promise<MandateView[]> {
    const filter: QueryFilter<MemberMandate> = {};
    if (query.year !== undefined) {
      const year = await this.rotaryYearModel
        .findOne({ startYear: parseRotaryYearLabel(query.year) })
        .lean()
        .exec();
      if (!year) {
        return [];
      }
      filter.rotaryYear = year._id;
    }
    if (query.member !== undefined) {
      filter.member = new Types.ObjectId(query.member);
    }

    const mandates = await this.mandateModel.find(filter).lean().exec();
    const startYears = await this.startYearsOf(mandates);

    return (
      mandates
        .map((mandate) => ({
          mandate,
          startYear: startYears.get(mandate.rotaryYear.toString()),
        }))
        .filter(
          (entry): entry is typeof entry & { startYear: number } =>
            entry.startYear !== undefined,
        )
        // De l'année la plus récente à la plus ancienne, puis par ordre.
        .sort(
          (a, b) =>
            b.startYear - a.startYear || a.mandate.order - b.mandate.order,
        )
        .map(({ mandate, startYear }) => toView(mandate, startYear))
    );
  }

  async create(dto: CreateMandateDto): Promise<MandateView> {
    if (!(await this.memberModel.exists({ _id: dto.member }).exec())) {
      throw invalid('member', "Ce membre n'existe pas.");
    }
    const year = await this.rotaryYearModel
      .findById(dto.rotaryYear)
      .lean()
      .exec();
    if (!year) {
      throw invalid('rotaryYear', "Cette année Rotary n'existe pas.");
    }

    // L'ordre n'est jamais fourni : le mandat se place après ceux de l'année.
    // Deux créations simultanées peuvent calculer le même ordre ; l'index
    // unique refuse la seconde, qui recalcule et réessaie.
    for (let attempt = 0; attempt < ORDER_ATTEMPTS; attempt += 1) {
      const last = await this.mandateModel
        .findOne({ rotaryYear: year._id })
        .sort({ order: -1 })
        .lean()
        .exec();
      try {
        const mandate = await this.mandateModel.create({
          member: dto.member,
          rotaryYear: year._id,
          roles: dto.roles ?? [],
          order: Math.max(last?.order ?? 0, 0) + 1,
        });
        return toView(mandate.toObject(), year.startYear);
      } catch (error) {
        const duplicate = duplicateKeyOn(error);
        if (duplicate === 'couple') {
          throw new ConflictException();
        }
        if (duplicate !== 'order') {
          throw error;
        }
      }
    }
    throw new ConflictException();
  }

  async update(id: string, dto: UpdateMandateDto): Promise<MandateView> {
    const set: Partial<Pick<MemberMandate, 'roles' | 'order'>> = {};
    if (dto.roles !== undefined) {
      set.roles = dto.roles;
    }
    if (dto.order !== undefined) {
      set.order = dto.order;
    }

    let mandate: MandateDocument | null;
    try {
      mandate = await this.mandateModel
        .findByIdAndUpdate(
          id,
          { $set: set },
          { new: true, runValidators: true },
        )
        .lean()
        .exec();
    } catch (error) {
      // Ordre déjà porté par un autre mandat de la même année.
      if (duplicateKeyOn(error) !== null) {
        throw new ConflictException();
      }
      throw error;
    }
    if (!mandate) {
      throw new NotFoundException();
    }
    return (await this.toViews([mandate]))[0];
  }

  async remove(id: string): Promise<void> {
    const deleted = await this.mandateModel.findByIdAndDelete(id).exec();
    if (!deleted) {
      throw new NotFoundException();
    }
  }

  // Réécrit de 1 à n les ordres de tous les mandats d'une année.
  async reorder(dto: ReorderMandatesDto): Promise<MandateView[]> {
    const year = await this.rotaryYearModel
      .findById(dto.rotaryYear)
      .lean()
      .exec();
    if (!year) {
      throw invalid('rotaryYear', "Cette année Rotary n'existe pas.");
    }

    // Une transaction : soit tous les ordres changent, soit aucun. Le pilote
    // peut exécuter cette fonction plus d'une fois (conflit d'écriture) : elle
    // ne garde aucun état et refait son contrôle à chaque exécution.
    await this.connection.transaction(async (session) => {
      // Contrôle complet, avant toute écriture, sur l'état vu par la
      // transaction : exactement tous les mandats de l'année, chacun une fois.
      const current = await this.mandateModel
        .find({ rotaryYear: year._id }, { _id: 1 })
        .session(session)
        .lean()
        .exec();
      const expected = new Set(
        current.map((mandate) => mandate._id.toString()),
      );
      const received = new Set(dto.mandateIds);
      if (
        dto.mandateIds.length !== expected.size ||
        received.size !== expected.size ||
        dto.mandateIds.some((mandateId) => !expected.has(mandateId))
      ) {
        throw invalid('mandateIds', MANDATE_IDS_MESSAGE);
      }
      if (expected.size === 0) {
        return;
      }

      // L'index unique (rotaryYear, order) est vérifié à chaque écriture.
      // 1. Les ordres passent en négatif : la zone positive de l'année est vide.
      await this.mandateModel.updateMany(
        { rotaryYear: year._id },
        { $mul: { order: -1 } },
        { session },
      );
      // 2. Chaque mandat prend sa position, de 1 à n, sans collision possible.
      await this.mandateModel.bulkWrite(
        dto.mandateIds.map((mandateId, index) => ({
          updateOne: {
            filter: {
              _id: new Types.ObjectId(mandateId),
              rotaryYear: year._id,
            },
            update: { $set: { order: index + 1 } },
          },
        })),
        { session },
      );
    });

    const mandates = await this.mandateModel
      .find({ rotaryYear: year._id })
      .sort({ order: 1 })
      .lean()
      .exec();
    return mandates.map((mandate) => toView(mandate, year.startYear));
  }

  // Annuaire public d'une année : les membres qui y ont un mandat, dans
  // l'ordre du club.
  async findDirectory(query: QueryDirectoryDto): Promise<DirectoryEntryView[]> {
    const startYear =
      query.year !== undefined
        ? parseRotaryYearLabel(query.year)
        : rotaryStartYearAt(new Date());
    const year = await this.rotaryYearModel
      .findOne({ startYear })
      .lean()
      .exec();
    // Année inexistante, ou aucune année courante : liste vide, pas d'erreur.
    if (!year) {
      return [];
    }

    const mandatesQuery = this.mandateModel
      .find({ rotaryYear: year._id })
      .sort({ order: 1 });
    if (query.limit !== undefined) {
      mandatesQuery.limit(query.limit);
    }
    const mandates = await mandatesQuery.lean().exec();
    const members = await this.memberModel
      .find({ _id: { $in: mandates.map((mandate) => mandate.member) } })
      .lean()
      .exec();
    const membersById = new Map(
      members.map((member) => [member._id.toString(), member]),
    );
    const label = rotaryYearLabel(year.startYear);

    return mandates.flatMap((mandate) => {
      const member = membersById.get(mandate.member.toString());
      if (!member) {
        return [];
      }
      return [
        {
          id: member._id.toString(),
          firstName: member.firstName,
          lastName: member.lastName,
          ...(member.occupation ? { occupation: member.occupation } : {}),
          rotaryYear: label,
          roles: mandate.roles,
          order: mandate.order,
        },
      ];
    });
  }

  // Les années qui ont au moins un mandat, de la plus récente à la plus
  // ancienne, dans la forme de la liste des années Rotary.
  async findYears(): Promise<MemberYearView[]> {
    const now = new Date();
    const years = await this.rotaryYearModel
      .find({ _id: { $in: await this.mandateModel.distinct('rotaryYear') } })
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

  private async toViews(mandates: MandateDocument[]): Promise<MandateView[]> {
    const startYears = await this.startYearsOf(mandates);
    return mandates.flatMap((mandate) => {
      const startYear = startYears.get(mandate.rotaryYear.toString());
      return startYear === undefined ? [] : [toView(mandate, startYear)];
    });
  }

  private async startYearsOf(
    mandates: MandateDocument[],
  ): Promise<Map<string, number>> {
    const years = await this.rotaryYearModel
      .find({ _id: { $in: mandates.map((mandate) => mandate.rotaryYear) } })
      .lean()
      .exec();
    return new Map(years.map((year) => [year._id.toString(), year.startYear]));
  }
}
