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
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { ADMIN_ROLE } from '../auth/schemas/admin.schema';
import type { Paginated } from '../common/dto/pagination-query.dto';
import {
  ImageFieldsDto,
  ReorderPhotosDto,
  UpdateImageFieldsDto,
} from '../common/dto/image-fields.dto';
import { ParseObjectIdPipe } from '../common/pipes/parse-object-id.pipe';
import { ImageUploadInterceptor } from '../media/image-upload.interceptor';
import type { UploadedImage } from '../media/image-upload.interceptor';
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

  // --- Photographies (contracts/api-images.md) ---

  @Post(':id/photos')
  @UseInterceptors(ImageUploadInterceptor)
  addPhoto(
    @Param('id', ParseObjectIdPipe) id: string,
    @UploadedFile() file: UploadedImage | undefined,
    @Body() dto: ImageFieldsDto,
  ): Promise<AdminActionView> {
    return this.actionsService.addPhoto(id, file, dto);
  }

  // Déclarée avant ':id/photos/:photoId' : « order » n'est pas un identifiant.
  @Put(':id/photos/order')
  reorderPhotos(
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() dto: ReorderPhotosDto,
  ): Promise<AdminActionView> {
    return this.actionsService.reorderPhotos(id, dto);
  }

  @Patch(':id/photos/:photoId')
  updatePhoto(
    @Param('id', ParseObjectIdPipe) id: string,
    @Param('photoId', ParseObjectIdPipe) photoId: string,
    @Body() dto: UpdateImageFieldsDto,
  ): Promise<AdminActionView> {
    return this.actionsService.updatePhoto(id, photoId, dto);
  }

  @Delete(':id/photos/:photoId')
  removePhoto(
    @Param('id', ParseObjectIdPipe) id: string,
    @Param('photoId', ParseObjectIdPipe) photoId: string,
  ): Promise<AdminActionView> {
    return this.actionsService.removePhoto(id, photoId);
  }
}
