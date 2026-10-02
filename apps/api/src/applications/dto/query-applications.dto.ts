import { Transform } from 'class-transformer';
import {
  IsIn,
  IsISO8601,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { trim } from './create-application.dto';

const SEARCH_MESSAGE = 'La recherche doit compter 2 caractères au moins.';
const DATE_MESSAGE = 'La date doit être au format ISO 8601.';

// Deux champs de tri, dans les deux sens.
export const APPLICATION_SORTS = [
  'createdAt',
  '-createdAt',
  'lastName',
  '-lastName',
] as const;

export class QueryApplicationsDto extends PaginationQueryDto {
  @IsOptional()
  @Transform(trim)
  @IsString({ message: SEARCH_MESSAGE })
  @MinLength(2, { message: SEARCH_MESSAGE })
  q?: string;

  // Bornes incluses, sur la date de candidature.
  @IsOptional()
  @IsISO8601({ strict: true }, { message: DATE_MESSAGE })
  from?: string;

  @IsOptional()
  @IsISO8601({ strict: true }, { message: DATE_MESSAGE })
  to?: string;

  @IsIn(APPLICATION_SORTS, { message: 'Tri non autorisé.' })
  sort: (typeof APPLICATION_SORTS)[number] = '-createdAt';
}
