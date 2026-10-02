import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  isCurrentRotaryYear,
  rotaryYearBounds,
  rotaryYearLabel,
} from '../common/utils/rotary-year';
import { MemberMandate } from '../members/schemas/member-mandate.schema';
import { RotaryYear } from './schemas/rotary-year.schema';

export type RotaryYearView = {
  id: string;
  startYear: number;
  label: string;
  startDate: Date;
  endDate: Date;
  isCurrent: boolean;
};

@Injectable()
export class RotaryYearsService {
  constructor(
    @InjectModel(RotaryYear.name)
    private readonly rotaryYearModel: Model<RotaryYear>,
    @InjectModel(MemberMandate.name)
    private readonly mandateModel: Model<MemberMandate>,
  ) {}

  async findAll(): Promise<RotaryYearView[]> {
    // Un seul instant pour toute la liste : au plus une année est courante.
    const now = new Date();
    const years = await this.rotaryYearModel
      .find()
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

  async create(startYear: number): Promise<RotaryYearView> {
    try {
      const year = await this.rotaryYearModel.create({ startYear });
      return {
        id: year.id as string,
        startYear,
        label: rotaryYearLabel(startYear),
        ...rotaryYearBounds(startYear),
        isCurrent: isCurrentRotaryYear(startYear, new Date()),
      };
    } catch (error) {
      // Clé dupliquée sur l'index unique : couvre aussi deux demandes
      // simultanées, ce qu'une lecture préalable ne ferait pas.
      if ((error as { code?: unknown }).code === 11000) {
        throw new ConflictException('Cette année Rotary existe déjà.');
      }
      throw error;
    }
  }

  async remove(id: string): Promise<void> {
    // Une année référencée ne se supprime pas. Chaque entité qui référence une
    // année ajoute ici son contrôle.
    if (await this.mandateModel.exists({ rotaryYear: id }).exec()) {
      throw new ConflictException();
    }
    const deleted = await this.rotaryYearModel.findByIdAndDelete(id).exec();
    if (!deleted) {
      throw new NotFoundException();
    }
  }
}
