import { IsMongoId, IsOptional, Validate } from 'class-validator';
import { IsRotaryYearLabel, YEAR_LABEL_MESSAGE } from './query-members.dto';

export class QueryMandatesDto {
  @IsOptional()
  @Validate(IsRotaryYearLabel, { message: YEAR_LABEL_MESSAGE })
  year?: string;

  @IsOptional()
  @IsMongoId({ message: 'Identifiant de membre invalide.' })
  member?: string;
}
