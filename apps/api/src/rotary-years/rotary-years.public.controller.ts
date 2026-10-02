import { Controller, Get } from '@nestjs/common';
import { RotaryYearsService, RotaryYearView } from './rotary-years.service';

@Controller('rotary-years')
export class RotaryYearsPublicController {
  constructor(private readonly rotaryYearsService: RotaryYearsService) {}

  @Get()
  async findAll(): Promise<{ data: RotaryYearView[] }> {
    return { data: await this.rotaryYearsService.findAll() };
  }
}
