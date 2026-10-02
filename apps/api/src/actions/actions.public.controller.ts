import { Controller, Get, Param, Query } from '@nestjs/common';
import type { Paginated } from '../common/dto/pagination-query.dto';
import { ActionsService } from './actions.service';
import type { ActionYearView, PublicActionView } from './actions.service';
import { QueryPublicActionsDto } from './dto/query-public-actions.dto';

// Lecture publique : seules les actions publiées en sortent.
@Controller('actions')
export class ActionsPublicController {
  constructor(private readonly actionsService: ActionsService) {}

  @Get()
  findAll(
    @Query() query: QueryPublicActionsDto,
  ): Promise<Paginated<PublicActionView>> {
    return this.actionsService.findPublished(query);
  }

  // Déclarée avant « :slug » : « years » est un slug réservé.
  @Get('years')
  async findYears(): Promise<{ data: ActionYearView[] }> {
    return { data: await this.actionsService.findYears() };
  }

  @Get(':slug')
  findOne(@Param('slug') slug: string): Promise<PublicActionView> {
    return this.actionsService.findPublishedBySlug(slug);
  }
}
