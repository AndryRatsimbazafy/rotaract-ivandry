import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  isCurrentRotaryYear,
  rotaryYearBounds,
  rotaryYearLabel,
} from '../common/utils/rotary-year';
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
}
