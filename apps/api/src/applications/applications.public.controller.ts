import {
  Body,
  Controller,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { ApplicationsService } from './applications.service';
import { CvUploadInterceptor } from './cv-upload.interceptor';
import type { UploadedCv } from './cv-upload.interceptor';
import { CreateApplicationDto } from './dto/create-application.dto';

// Dépôt d'une candidature : la seule route publique. Aucune lecture publique.
@Controller('applications')
export class ApplicationsPublicController {
  constructor(private readonly applicationsService: ApplicationsService) {}

  // 20 demandes par heure et par adresse IP, réussies ou non. La garde passe
  // avant la lecture du fichier : une demande refusée n'est pas lue.
  @Post()
  @Throttle({ default: { limit: 20, ttl: 3_600_000 } })
  @UseGuards(ThrottlerGuard)
  @UseInterceptors(CvUploadInterceptor)
  create(
    @Body() createApplicationDto: CreateApplicationDto,
    @UploadedFile() cv: UploadedCv | undefined,
  ): Promise<{ received: true }> {
    return this.applicationsService.create(createApplicationDto, cv);
  }
}
