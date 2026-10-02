import { Transform, Type } from 'class-transformer';
import {
  ArrayUnique,
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsISO8601,
  IsMongoId,
  IsObject,
  IsString,
  Length,
  Matches,
  MaxLength,
  Min,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { FocusArea } from '../../common/enums/focus-area.enum';
import { SLUG_MAX_LENGTH, SLUG_PATTERN } from '../../common/utils/slug';
import {
  ActionImpactDto,
  DATE_MESSAGE,
  DESCRIPTION_MESSAGE,
  FOCUS_AREAS_MESSAGE,
  IMPACT_MESSAGE,
  ORDER_MESSAGE,
  PUBLISHED_MESSAGE,
  SLUG_MESSAGE,
  SUMMARY_MESSAGE,
  TITLE_MESSAGE,
  trim,
  YEAR_ID_MESSAGE,
} from './create-action.dto';

const isSent = (_: object, value: unknown): boolean => value !== undefined;
// null efface le champ : il n'est pas validé. Une chaîne vide l'est, et échoue.
const isSentAndNotNull = (_: object, value: unknown): boolean =>
  value !== undefined && value !== null;

// Un champ absent est inchangé. Le slug ne change que s'il est envoyé.
export class UpdateActionDto {
  @ValidateIf(isSent)
  @Transform(trim)
  @IsString({ message: TITLE_MESSAGE })
  @Length(1, 120, { message: TITLE_MESSAGE })
  title?: string;

  @ValidateIf(isSent)
  @IsString({ message: SLUG_MESSAGE })
  @Matches(SLUG_PATTERN, { message: SLUG_MESSAGE })
  @MaxLength(SLUG_MAX_LENGTH, { message: SLUG_MESSAGE })
  slug?: string;

  @ValidateIf(isSentAndNotNull)
  @Transform(trim)
  @IsString({ message: SUMMARY_MESSAGE })
  @Length(1, 500, { message: SUMMARY_MESSAGE })
  summary?: string | null;

  @ValidateIf(isSentAndNotNull)
  @Transform(trim)
  @IsString({ message: DESCRIPTION_MESSAGE })
  @Length(1, 20000, { message: DESCRIPTION_MESSAGE })
  description?: string | null;

  @ValidateIf(isSent)
  @IsISO8601({}, { message: DATE_MESSAGE })
  date?: string;

  @ValidateIf(isSent)
  @IsMongoId({ message: YEAR_ID_MESSAGE })
  rotaryYear?: string;

  @ValidateIf(isSent)
  @IsArray({ message: FOCUS_AREAS_MESSAGE })
  @IsEnum(FocusArea, { each: true, message: FOCUS_AREAS_MESSAGE })
  @ArrayUnique({ message: FOCUS_AREAS_MESSAGE })
  focusAreas?: FocusArea[];

  // Un impact envoyé remplace l'impact entier ; null l'efface.
  @ValidateIf(isSentAndNotNull)
  @IsObject({ message: IMPACT_MESSAGE })
  @ValidateNested({ message: IMPACT_MESSAGE })
  @Type(() => ActionImpactDto)
  impact?: ActionImpactDto | null;

  @ValidateIf(isSent)
  @IsBoolean({ message: PUBLISHED_MESSAGE })
  isPublished?: boolean;

  @ValidateIf(isSentAndNotNull)
  @IsInt({ message: ORDER_MESSAGE })
  @Min(1, { message: ORDER_MESSAGE })
  order?: number | null;
}
