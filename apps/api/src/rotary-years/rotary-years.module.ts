import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Action, ActionSchema } from '../actions/schemas/action.schema';
import { AuthModule } from '../auth/auth.module';
import {
  MemberMandate,
  MemberMandateSchema,
} from '../members/schemas/member-mandate.schema';
import { News, NewsSchema } from '../news/schemas/news.schema';
import { RotaryYearsAdminController } from './rotary-years.admin.controller';
import { RotaryYearsPublicController } from './rotary-years.public.controller';
import { RotaryYearsService } from './rotary-years.service';
import { RotaryYear, RotaryYearSchema } from './schemas/rotary-year.schema';

@Module({
  imports: [
    AuthModule,
    MongooseModule.forFeature([
      { name: RotaryYear.name, schema: RotaryYearSchema },
      // Lus pour refuser la suppression d'une année référencée par un mandat,
      // une action ou une actualité.
      { name: MemberMandate.name, schema: MemberMandateSchema },
      { name: Action.name, schema: ActionSchema },
      { name: News.name, schema: NewsSchema },
    ]),
  ],
  controllers: [RotaryYearsPublicController, RotaryYearsAdminController],
  providers: [RotaryYearsService],
})
export class RotaryYearsModule {}
