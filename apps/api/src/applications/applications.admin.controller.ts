import {
  Controller,
  Delete,
  Get,
  Header,
  HttpCode,
  HttpStatus,
  Param,
  Query,
  StreamableFile,
  UseGuards,
} from '@nestjs/common';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { ADMIN_ROLE } from '../auth/schemas/admin.schema';
import type { Paginated } from '../common/dto/pagination-query.dto';
import { ParseObjectIdPipe } from '../common/pipes/parse-object-id.pipe';
import { ApplicationsService } from './applications.service';
import type { ApplicationView } from './applications.service';
import { QueryApplicationsDto } from './dto/query-applications.dto';

// Nom d'origine en pièce jointe : repli ASCII, puis forme UTF-8.
function attachment(name: string): string {
  const fallback = name.replace(/[^\x20-\x7e]|["\\]/g, '_');
  return `attachment; filename="${fallback}"; filename*=UTF-8''${encodeURIComponent(name)}`;
}

// Gardé au niveau de la classe : toute route ajoutée ici est protégée.
// Consultation et suppression seulement : une candidature ne se modifie pas.
@Controller('admin/applications')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(ADMIN_ROLE)
export class ApplicationsAdminController {
  constructor(private readonly applicationsService: ApplicationsService) {}

  @Get()
  findAll(
    @Query() query: QueryApplicationsDto,
  ): Promise<Paginated<ApplicationView>> {
    return this.applicationsService.findAll(query);
  }

  @Get(':id')
  findOne(
    @Param('id', ParseObjectIdPipe) id: string,
  ): Promise<ApplicationView> {
    return this.applicationsService.findOne(id);
  }

  // Le fichier lui-même, en téléchargement : aucune adresse de stockage n'est
  // remise à l'appelant.
  @Get(':id/cv')
  @Header('Cache-Control', 'no-store')
  async cv(
    @Param('id', ParseObjectIdPipe) id: string,
  ): Promise<StreamableFile> {
    const cv = await this.applicationsService.readCv(id);
    return new StreamableFile(cv.content, {
      type: cv.mimeType,
      disposition: attachment(cv.name),
      length: cv.content.length,
    });
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseObjectIdPipe) id: string): Promise<void> {
    return this.applicationsService.remove(id);
  }
}
