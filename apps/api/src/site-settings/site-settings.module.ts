import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from '../auth/auth.module';
import { ImageUploadInterceptor } from '../media/image-upload.interceptor';
import { MediaModule } from '../media/media.module';
import {
  SiteSettings,
  SiteSettingsSchema,
} from './schemas/site-settings.schema';
import { SiteSettingsAdminController } from './site-settings.admin.controller';
import { SiteSettingsPublicController } from './site-settings.public.controller';
import { SiteSettingsService } from './site-settings.service';

@Module({
  imports: [
    AuthModule,
    // Les photographies passent par l'abstraction de stockage.
    MediaModule,
    MongooseModule.forFeature([
      { name: SiteSettings.name, schema: SiteSettingsSchema },
    ]),
  ],
  controllers: [SiteSettingsPublicController, SiteSettingsAdminController],
  providers: [SiteSettingsService, ImageUploadInterceptor],
})
export class SiteSettingsModule {}
