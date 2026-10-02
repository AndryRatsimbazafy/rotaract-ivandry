import { Controller, Get, Query } from '@nestjs/common';
import { QueryDirectoryDto } from './dto/query-directory.dto';
import { MandatesService } from './mandates.service';
import type { DirectoryEntryView, MemberYearView } from './mandates.service';

// Lecture publique : ni email ni téléphone ne sortent d'ici.
@Controller('members')
export class MembersPublicController {
  constructor(private readonly mandatesService: MandatesService) {}

  @Get()
  async findDirectory(
    @Query() query: QueryDirectoryDto,
  ): Promise<{ data: DirectoryEntryView[] }> {
    return { data: await this.mandatesService.findDirectory(query) };
  }

  @Get('years')
  async findYears(): Promise<{ data: MemberYearView[] }> {
    return { data: await this.mandatesService.findYears() };
  }
}
