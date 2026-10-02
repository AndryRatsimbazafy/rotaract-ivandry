import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, QueryFilter, SortOrder, Types } from 'mongoose';
import { Paginated } from '../common/dto/pagination-query.dto';
import {
  parseRotaryYearLabel,
  rotaryYearLabel,
} from '../common/utils/rotary-year';
import { MemberRole } from '../common/enums/member-role.enum';
import { RotaryYear } from '../rotary-years/schemas/rotary-year.schema';
import { CreateMemberDto } from './dto/create-member.dto';
import { QueryMembersDto } from './dto/query-members.dto';
import { UpdateMemberDto } from './dto/update-member.dto';
import { MemberMandate } from './schemas/member-mandate.schema';
import { Member } from './schemas/member.schema';

// Forme d'administration : champs internes compris, sans les mandats.
export type AdminMemberView = {
  id: string;
  firstName: string;
  lastName: string;
  occupation: string | null;
  email: string | null;
  phone: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type MemberMandateSummary = {
  id: string;
  rotaryYear: { id: string; label: string };
  roles: MemberRole[];
  order: number;
};

export type AdminMemberDetailView = AdminMemberView & {
  mandates: MemberMandateSummary[];
};

const SORTS: Record<QueryMembersDto['sort'], Record<string, SortOrder>> = {
  lastName: { lastName: 1, firstName: 1 },
  '-lastName': { lastName: -1, firstName: -1 },
  createdAt: { createdAt: 1 },
  '-createdAt': { createdAt: -1 },
};

const CLEARABLE_FIELDS = ['occupation', 'email', 'phone'] as const;

function toAdminView(
  member: Member & { _id: Types.ObjectId },
): AdminMemberView {
  return {
    id: member._id.toString(),
    firstName: member.firstName,
    lastName: member.lastName,
    occupation: member.occupation ?? null,
    email: member.email ?? null,
    phone: member.phone ?? null,
    createdAt: member.createdAt,
    updatedAt: member.updatedAt,
  };
}

@Injectable()
export class MembersService {
  constructor(
    @InjectModel(Member.name) private readonly memberModel: Model<Member>,
    @InjectModel(MemberMandate.name)
    private readonly mandateModel: Model<MemberMandate>,
    @InjectModel(RotaryYear.name)
    private readonly rotaryYearModel: Model<RotaryYear>,
  ) {}

  async findAll(query: QueryMembersDto): Promise<Paginated<AdminMemberView>> {
    const { page, limit } = query;
    const filter = await this.buildFilter(query);
    if (!filter) {
      return { data: [], meta: { page, limit, total: 0, totalPages: 0 } };
    }

    const [total, members] = await Promise.all([
      this.memberModel.countDocuments(filter).exec(),
      this.memberModel
        .find(filter)
        .sort(SORTS[query.sort])
        .skip((page - 1) * limit)
        .limit(limit)
        .lean()
        .exec(),
    ]);

    return {
      data: members.map(toAdminView),
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string): Promise<AdminMemberDetailView> {
    const member = await this.memberModel.findById(id).lean().exec();
    if (!member) {
      throw new NotFoundException();
    }

    const mandates = await this.mandateModel
      .find({ member: member._id })
      .lean()
      .exec();
    const years = await this.rotaryYearModel
      .find({ _id: { $in: mandates.map((mandate) => mandate.rotaryYear) } })
      .lean()
      .exec();
    const startYears = new Map(
      years.map((year) => [year._id.toString(), year.startYear]),
    );

    return {
      ...toAdminView(member),
      mandates: mandates
        .map((mandate) => ({
          mandate,
          startYear: startYears.get(mandate.rotaryYear.toString()),
        }))
        .filter(
          (entry): entry is typeof entry & { startYear: number } =>
            entry.startYear !== undefined,
        )
        // De l'année la plus récente à la plus ancienne.
        .sort((a, b) => b.startYear - a.startYear)
        .map(({ mandate, startYear }) => ({
          id: mandate._id.toString(),
          rotaryYear: {
            id: mandate.rotaryYear.toString(),
            label: rotaryYearLabel(startYear),
          },
          roles: mandate.roles,
          order: mandate.order,
        })),
    };
  }

  async create(dto: CreateMemberDto): Promise<AdminMemberView> {
    const member = await this.memberModel.create(dto);
    return toAdminView(member.toObject());
  }

  async update(id: string, dto: UpdateMemberDto): Promise<AdminMemberView> {
    const set: Record<string, string> = {};
    const unset: Record<string, ''> = {};

    if (dto.firstName !== undefined) {
      set.firstName = dto.firstName;
    }
    if (dto.lastName !== undefined) {
      set.lastName = dto.lastName;
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

    const member = await this.memberModel
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
    if (!member) {
      throw new NotFoundException();
    }
    return toAdminView(member);
  }

  async remove(id: string): Promise<void> {
    const member = await this.memberModel.exists({ _id: id }).exec();
    if (!member) {
      throw new NotFoundException();
    }
    // Les mandats d'abord : si l'opération s'arrête ici, il reste un membre
    // sans mandat, état valide, et la suppression peut être relancée.
    await this.mandateModel.deleteMany({ member: member._id }).exec();
    await this.memberModel.deleteOne({ _id: member._id }).exec();
  }

  // null quand le filtre ne peut désigner aucun membre (année inconnue).
  private async buildFilter(
    query: QueryMembersDto,
  ): Promise<QueryFilter<Member> | null> {
    const filter: QueryFilter<Member> = {};

    if (query.year !== undefined || query.role !== undefined) {
      const mandateFilter: QueryFilter<MemberMandate> = {};
      if (query.year !== undefined) {
        const year = await this.rotaryYearModel
          .findOne({ startYear: parseRotaryYearLabel(query.year) })
          .lean()
          .exec();
        if (!year) {
          return null;
        }
        mandateFilter.rotaryYear = year._id;
      }
      if (query.role !== undefined) {
        mandateFilter.roles = query.role;
      }
      filter._id = {
        $in: await this.mandateModel.distinct('member', mandateFilter).exec(),
      };
    }

    if (query.q !== undefined) {
      filter.$text = { $search: query.q };
    }

    return filter;
  }
}
