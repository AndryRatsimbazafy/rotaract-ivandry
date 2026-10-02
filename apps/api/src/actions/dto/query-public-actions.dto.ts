import { Transform } from 'class-transformer';
import {
  IsEnum,
  IsOptional,
  IsString,
  MinLength,
  Validate,
} from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { FocusArea } from '../../common/enums/focus-area.enum';
import { trim } from './create-action.dto';
import {
  FOCUS_AREA_MESSAGE,
  IsYearLabel,
  SEARCH_MESSAGE,
  YEAR_LABEL_MESSAGE,
} from './query-admin-actions.dto';

// Liste publique : ni filtre de publication ni tri au choix.
export class QueryPublicActionsDto extends PaginationQueryDto {
  @IsOptional()
  @Transform(trim)
  @IsString({ message: SEARCH_MESSAGE })
  @MinLength(2, { message: SEARCH_MESSAGE })
  q?: string;

  @IsOptional()
  @Validate(IsYearLabel, { message: YEAR_LABEL_MESSAGE })
  year?: string;

  @IsOptional()
  @IsEnum(FocusArea, { message: FOCUS_AREA_MESSAGE })
  focusArea?: FocusArea;
}
