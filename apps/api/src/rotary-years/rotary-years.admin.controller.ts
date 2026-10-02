import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { ADMIN_ROLE } from '../auth/schemas/admin.schema';
import { ParseObjectIdPipe } from '../common/pipes/parse-object-id.pipe';
import { CreateRotaryYearDto } from './dto/create-rotary-year.dto';
import { RotaryYearsService, RotaryYearView } from './rotary-years.service';

// Gardé au niveau de la classe : toute route ajoutée ici est protégée.
@Controller('admin/rotary-years')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(ADMIN_ROLE)
export class RotaryYearsAdminController {
  constructor(private readonly rotaryYearsService: RotaryYearsService) {}

  @Get()
  async findAll(): Promise<{ data: RotaryYearView[] }> {
    return { data: await this.rotaryYearsService.findAll() };
  }

  @Post()
  create(
    @Body() createRotaryYearDto: CreateRotaryYearDto,
  ): Promise<RotaryYearView> {
    return this.rotaryYearsService.create(createRotaryYearDto.startYear);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseObjectIdPipe) id: string): Promise<void> {
    return this.rotaryYearsService.remove(id);
  }
}
