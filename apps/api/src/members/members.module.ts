import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from '../auth/auth.module';
import {
  RotaryYear,
  RotaryYearSchema,
} from '../rotary-years/schemas/rotary-year.schema';
import { MandatesAdminController } from './mandates.admin.controller';
import { MandatesService } from './mandates.service';
import { MembersAdminController } from './members.admin.controller';
import { MembersPublicController } from './members.public.controller';
import { MembersService } from './members.service';
import {
  MemberMandate,
  MemberMandateSchema,
} from './schemas/member-mandate.schema';
import { Member, MemberSchema } from './schemas/member.schema';

@Module({
  imports: [
    AuthModule,
    // Le module lit les années Rotary sans importer leur module, qui lit lui-même
    // les mandats : chacun déclare les modèles qu'il lit.
    MongooseModule.forFeature([
      { name: Member.name, schema: MemberSchema },
      { name: MemberMandate.name, schema: MemberMandateSchema },
      { name: RotaryYear.name, schema: RotaryYearSchema },
    ]),
  ],
  controllers: [
    MembersPublicController,
    MembersAdminController,
    MandatesAdminController,
  ],
  providers: [MembersService, MandatesService],
})
export class MembersModule {}
