import { Transform } from 'class-transformer';
import {
  IsEnum,
  IsIn,
  IsOptional,
  IsString,
  MinLength,
  Validate,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { FocusArea } from '../../common/enums/focus-area.enum';
import { parseRotaryYearLabel } from '../../common/utils/rotary-year';
import { trim } from './create-action.dto';

export const YEAR_LABEL_MESSAGE =
  "L'année doit être au format AAAA-AAAA, avec deux années consécutives.";
export const SEARCH_MESSAGE =
  'La recherche doit compter 2 caractères au moins.';
export const FOCUS_AREA_MESSAGE = 'Domaine inconnu.';

@ValidatorConstraint({ name: 'isActionYearLabel' })
export class IsYearLabel implements ValidatorConstraintInterface {
  validate(value: unknown): boolean {
    return typeof value === 'string' && parseRotaryYearLabel(value) !== null;
  }
}

// Trois champs de tri, dans les deux sens.
export const ACTION_SORTS = [
  '-date',
  'date',
  'title',
  '-title',
  'createdAt',
  '-createdAt',
] as const;

export class QueryAdminActionsDto extends PaginationQueryDto {
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

  @IsOptional()
  @IsIn(['true', 'false'], {
    message: 'Le filtre de publication vaut true ou false.',
  })
  published?: 'true' | 'false';

  @IsIn(ACTION_SORTS, { message: 'Tri non autorisé.' })
  sort: (typeof ACTION_SORTS)[number] = '-date';
}
