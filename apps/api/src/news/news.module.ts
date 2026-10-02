import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from '../auth/auth.module';
import {
  RotaryYear,
  RotaryYearSchema,
} from '../rotary-years/schemas/rotary-year.schema';
import { NewsAdminController } from './news.admin.controller';
import { NewsPublicController } from './news.public.controller';
import { NewsService } from './news.service';
import { News, NewsSchema } from './schemas/news.schema';

@Module({
  imports: [
    AuthModule,
    // Le module lit les années Rotary sans importer leur module, qui lit lui-même
    // les actualités : chacun déclare les modèles qu'il lit.
    MongooseModule.forFeature([
      { name: News.name, schema: NewsSchema },
      { name: RotaryYear.name, schema: RotaryYearSchema },
    ]),
  ],
  controllers: [NewsPublicController, NewsAdminController],
  providers: [NewsService],
})
export class NewsModule {}
