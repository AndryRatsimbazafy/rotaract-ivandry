import { Transform } from 'class-transformer';
import {
  IsEnum,
  IsOptional,
  IsString,
  MinLength,
  Validate,
} from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { NewsType } from '../../common/enums/news-type.enum';
import { trim } from './create-news.dto';
import {
  IsYearLabel,
  SEARCH_MESSAGE,
  TYPE_FILTER_MESSAGE,
  YEAR_LABEL_MESSAGE,
} from './query-admin-news.dto';

// Liste publique : ni filtre de publication ni tri au choix.
export class QueryPublicNewsDto extends PaginationQueryDto {
  @IsOptional()
  @Transform(trim)
  @IsString({ message: SEARCH_MESSAGE })
  @MinLength(2, { message: SEARCH_MESSAGE })
  q?: string;

  @IsOptional()
  @Validate(IsYearLabel, { message: YEAR_LABEL_MESSAGE })
  year?: string;

  @IsOptional()
  @IsEnum(NewsType, { message: TYPE_FILTER_MESSAGE })
  type?: NewsType;
}
