import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from '../auth/auth.module';
import { MediaModule } from '../media/media.module';
import { ApplicationsAdminController } from './applications.admin.controller';
import { ApplicationsPublicController } from './applications.public.controller';
import { ApplicationsService } from './applications.service';
import { CvUploadInterceptor } from './cv-upload.interceptor';
import { Application, ApplicationSchema } from './schemas/application.schema';

@Module({
  imports: [
    AuthModule,
    // Le CV passe par l'abstraction de stockage : ce module ne connaît aucun
    // fournisseur.
    MediaModule,
    MongooseModule.forFeature([
      { name: Application.name, schema: ApplicationSchema },
    ]),
  ],
  controllers: [ApplicationsPublicController, ApplicationsAdminController],
  providers: [ApplicationsService, CvUploadInterceptor],
})
export class ApplicationsModule {}
