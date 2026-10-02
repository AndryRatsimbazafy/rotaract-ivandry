import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RotaryYearsPublicController } from './rotary-years.public.controller';
import { RotaryYearsService } from './rotary-years.service';
import { RotaryYear, RotaryYearSchema } from './schemas/rotary-year.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: RotaryYear.name, schema: RotaryYearSchema },
    ]),
  ],
  controllers: [RotaryYearsPublicController],
  providers: [RotaryYearsService],
})
export class RotaryYearsModule {}
