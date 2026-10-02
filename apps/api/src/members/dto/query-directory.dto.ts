import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min, Validate } from 'class-validator';
import { LIMIT_MESSAGE } from '../../common/dto/pagination-query.dto';
import { IsRotaryYearLabel, YEAR_LABEL_MESSAGE } from './query-members.dto';

// Annuaire public d'une année : pas de pagination.
export class QueryDirectoryDto {
  @IsOptional()
  @Validate(IsRotaryYearLabel, { message: YEAR_LABEL_MESSAGE })
  year?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: LIMIT_MESSAGE })
  @Min(1, { message: LIMIT_MESSAGE })
  @Max(100, { message: LIMIT_MESSAGE })
  limit?: number;
}
