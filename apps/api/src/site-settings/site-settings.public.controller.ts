import { Controller, Get } from '@nestjs/common';
import { SiteSettingsService } from './site-settings.service';
import type { PublicSiteSettingsView } from './site-settings.service';

@Controller('site-settings')
export class SiteSettingsPublicController {
  constructor(private readonly siteSettingsService: SiteSettingsService) {}

  @Get()
  find(): Promise<PublicSiteSettingsView> {
    return this.siteSettingsService.findPublic();
  }
}
