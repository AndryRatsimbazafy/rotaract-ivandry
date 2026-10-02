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
  Query,
  UseGuards,
} from '@nestjs/common';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { ADMIN_ROLE } from '../auth/schemas/admin.schema';
import type { Paginated } from '../common/dto/pagination-query.dto';
import { ParseObjectIdPipe } from '../common/pipes/parse-object-id.pipe';
import { ActionsService } from './actions.service';
import type { AdminActionView } from './actions.service';
import { CreateActionDto } from './dto/create-action.dto';
import { QueryAdminActionsDto } from './dto/query-admin-actions.dto';
import { UpdateActionDto } from './dto/update-action.dto';

// Gardé au niveau de la classe : toute route ajoutée ici est protégée.
@Controller('admin/actions')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(ADMIN_ROLE)
export class ActionsAdminController {
  constructor(private readonly actionsService: ActionsService) {}

  @Get()
  findAll(
    @Query() query: QueryAdminActionsDto,
  ): Promise<Paginated<AdminActionView>> {
    return this.actionsService.findAllForAdmin(query);
  }

  @Get(':id')
  findOne(
    @Param('id', ParseObjectIdPipe) id: string,
  ): Promise<AdminActionView> {
    return this.actionsService.findOneForAdmin(id);
  }

  @Post()
  create(@Body() createActionDto: CreateActionDto): Promise<AdminActionView> {
    return this.actionsService.create(createActionDto);
  }

  // Publie et dépublie aussi : il n'y a pas de route dédiée.
  @Patch(':id')
  update(
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() updateActionDto: UpdateActionDto,
  ): Promise<AdminActionView> {
    return this.actionsService.update(id, updateActionDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseObjectIdPipe) id: string): Promise<void> {
    return this.actionsService.remove(id);
  }
}
