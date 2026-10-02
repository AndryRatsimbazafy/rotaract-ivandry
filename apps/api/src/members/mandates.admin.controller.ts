import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { ADMIN_ROLE } from '../auth/schemas/admin.schema';
import { ParseObjectIdPipe } from '../common/pipes/parse-object-id.pipe';
import { CreateMandateDto } from './dto/create-mandate.dto';
import { QueryMandatesDto } from './dto/query-mandates.dto';
import { ReorderMandatesDto } from './dto/reorder-mandates.dto';
import { UpdateMandateDto } from './dto/update-mandate.dto';
import { MandatesService } from './mandates.service';
import type { MandateView } from './mandates.service';

// Gardé au niveau de la classe : toute route ajoutée ici est protégée.
@Controller('admin/mandates')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(ADMIN_ROLE)
export class MandatesAdminController {
  constructor(private readonly mandatesService: MandatesService) {}

  @Get()
  async findAll(
    @Query() query: QueryMandatesDto,
  ): Promise<{ data: MandateView[] }> {
    return { data: await this.mandatesService.findAll(query) };
  }

  @Post()
  create(@Body() createMandateDto: CreateMandateDto): Promise<MandateView> {
    return this.mandatesService.create(createMandateDto);
  }

  // Réordonne tous les mandats d'une année, en une opération indissociable.
  @Put('order')
  async reorder(
    @Body() reorderMandatesDto: ReorderMandatesDto,
  ): Promise<{ data: MandateView[] }> {
    return { data: await this.mandatesService.reorder(reorderMandatesDto) };
  }

  @Patch(':id')
  update(
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() updateMandateDto: UpdateMandateDto,
  ): Promise<MandateView> {
    return this.mandatesService.update(id, updateMandateDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseObjectIdPipe) id: string): Promise<void> {
    return this.mandatesService.remove(id);
  }
}
