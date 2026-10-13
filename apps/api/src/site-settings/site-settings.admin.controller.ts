import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  ParseEnumPipe,
  Patch,
  Put,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { ADMIN_ROLE } from '../auth/schemas/admin.schema';
import {
  ImageFieldsDto,
  UpdateImageFieldsDto,
} from '../common/dto/image-fields.dto';
import { SitePhotoSlot } from '../common/enums/site-photo-slot.enum';
import { ImageUploadInterceptor } from '../media/image-upload.interceptor';
import type { UploadedImage } from '../media/image-upload.interceptor';
import { UpdateSiteSettingsDto } from './dto/update-site-settings.dto';
import { SiteSettingsService } from './site-settings.service';
import type { AdminSiteSettingsView } from './site-settings.service';

// Un emplacement inconnu est une ressource absente.
const slotPipe = new ParseEnumPipe(SitePhotoSlot, {
  exceptionFactory: () => new NotFoundException(),
});

// Gardé au niveau de la classe : toute route ajoutée ici est protégée.
@Controller('admin/site-settings')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(ADMIN_ROLE)
export class SiteSettingsAdminController {
  constructor(private readonly siteSettingsService: SiteSettingsService) {}

  @Get()
  find(): Promise<AdminSiteSettingsView> {
    return this.siteSettingsService.findAdmin();
  }

  @Patch()
  update(@Body() dto: UpdateSiteSettingsDto): Promise<AdminSiteSettingsView> {
    return this.siteSettingsService.update(dto);
  }

  @Put('photos/:slot')
  @UseInterceptors(ImageUploadInterceptor)
  setPhoto(
    @Param('slot', slotPipe) slot: SitePhotoSlot,
    @UploadedFile() file: UploadedImage | undefined,
    @Body() dto: ImageFieldsDto,
  ): Promise<AdminSiteSettingsView> {
    return this.siteSettingsService.setPhoto(slot, file, dto);
  }

  @Patch('photos/:slot')
  updatePhoto(
    @Param('slot', slotPipe) slot: SitePhotoSlot,
    @Body() dto: UpdateImageFieldsDto,
  ): Promise<AdminSiteSettingsView> {
    return this.siteSettingsService.updatePhoto(slot, dto);
  }

  @Delete('photos/:slot')
  removePhoto(
    @Param('slot', slotPipe) slot: SitePhotoSlot,
  ): Promise<AdminSiteSettingsView> {
    return this.siteSettingsService.removePhoto(slot);
  }
}
