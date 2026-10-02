import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Action, ActionSchema } from '../actions/schemas/action.schema';
import { AuthModule } from '../auth/auth.module';
import {
  MemberMandate,
  MemberMandateSchema,
} from '../members/schemas/member-mandate.schema';
import { RotaryYearsAdminController } from './rotary-years.admin.controller';
import { RotaryYearsPublicController } from './rotary-years.public.controller';
import { RotaryYearsService } from './rotary-years.service';
import { RotaryYear, RotaryYearSchema } from './schemas/rotary-year.schema';

@Module({
  imports: [
    AuthModule,
    MongooseModule.forFeature([
      { name: RotaryYear.name, schema: RotaryYearSchema },
      // Lus pour refuser la suppression d'une année référencée par un mandat
      // ou par une action.
      { name: MemberMandate.name, schema: MemberMandateSchema },
      { name: Action.name, schema: ActionSchema },
    ]),
  ],
  controllers: [RotaryYearsPublicController, RotaryYearsAdminController],
  providers: [RotaryYearsService],
})
export class RotaryYearsModule {}
