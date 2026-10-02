import { Controller, Get, Param, Query } from '@nestjs/common';
import type { Paginated } from '../common/dto/pagination-query.dto';
import { QueryPublicNewsDto } from './dto/query-public-news.dto';
import { NewsService } from './news.service';
import type { NewsArchiveView, PublicNewsView } from './news.service';

// Lecture publique : seules les actualités publiées en sortent.
@Controller('news')
export class NewsPublicController {
  constructor(private readonly newsService: NewsService) {}

  @Get()
  findAll(
    @Query() query: QueryPublicNewsDto,
  ): Promise<Paginated<PublicNewsView>> {
    return this.newsService.findPublished(query);
  }

  // Déclarée avant « :slug » : « archives » est un slug réservé.
  @Get('archives')
  async findArchives(): Promise<{ data: NewsArchiveView[] }> {
    return { data: await this.newsService.findArchives() };
  }

  @Get(':slug')
  findOne(@Param('slug') slug: string): Promise<PublicNewsView> {
    return this.newsService.findPublishedBySlug(slug);
  }
}
