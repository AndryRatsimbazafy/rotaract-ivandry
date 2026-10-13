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
import { CreateNewsDto } from './dto/create-news.dto';
import { QueryAdminNewsDto } from './dto/query-admin-news.dto';
import { UpdateNewsDto } from './dto/update-news.dto';
import { NewsService } from './news.service';
import type { AdminNewsView } from './news.service';

// Gardé au niveau de la classe : toute route ajoutée ici est protégée.
@Controller('admin/news')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(ADMIN_ROLE)
export class NewsAdminController {
  constructor(private readonly newsService: NewsService) {}

  @Get()
  findAll(
    @Query() query: QueryAdminNewsDto,
  ): Promise<Paginated<AdminNewsView>> {
    return this.newsService.findAllForAdmin(query);
  }

  @Get(':id')
  findOne(@Param('id', ParseObjectIdPipe) id: string): Promise<AdminNewsView> {
    return this.newsService.findOneForAdmin(id);
  }

  @Post()
  create(@Body() createNewsDto: CreateNewsDto): Promise<AdminNewsView> {
    return this.newsService.create(createNewsDto);
  }

  // Publie et dépublie aussi : il n'y a pas de route dédiée.
  @Patch(':id')
  update(
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() updateNewsDto: UpdateNewsDto,
  ): Promise<AdminNewsView> {
    return this.newsService.update(id, updateNewsDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseObjectIdPipe) id: string): Promise<void> {
    return this.newsService.remove(id);
  }

  // --- Photographies (contracts/api-images.md) ---

  @Post(':id/photos')
  @UseInterceptors(ImageUploadInterceptor)
  addPhoto(
    @Param('id', ParseObjectIdPipe) id: string,
    @UploadedFile() file: UploadedImage | undefined,
    @Body() dto: ImageFieldsDto,
  ): Promise<AdminNewsView> {
    return this.newsService.addPhoto(id, file, dto);
  }

  // Déclarée avant ':id/photos/:photoId' : « order » n'est pas un identifiant.
  @Put(':id/photos/order')
  reorderPhotos(
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() dto: ReorderPhotosDto,
  ): Promise<AdminNewsView> {
    return this.newsService.reorderPhotos(id, dto);
  }

  @Patch(':id/photos/:photoId')
  updatePhoto(
    @Param('id', ParseObjectIdPipe) id: string,
    @Param('photoId', ParseObjectIdPipe) photoId: string,
    @Body() dto: UpdateImageFieldsDto,
  ): Promise<AdminNewsView> {
    return this.newsService.updatePhoto(id, photoId, dto);
  }

  @Delete(':id/photos/:photoId')
  removePhoto(
    @Param('id', ParseObjectIdPipe) id: string,
    @Param('photoId', ParseObjectIdPipe) photoId: string,
  ): Promise<AdminNewsView> {
    return this.newsService.removePhoto(id, photoId);
  }
}
