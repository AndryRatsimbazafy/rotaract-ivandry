import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsISO8601,
  IsMongoId,
  IsString,
  Length,
  Matches,
  MaxLength,
  ValidateIf,
} from 'class-validator';
import { NewsType } from '../../common/enums/news-type.enum';
import { SLUG_MAX_LENGTH, SLUG_PATTERN } from '../../common/utils/slug';
import {
  CONTENT_MESSAGE,
  DATE_MESSAGE,
  LOCATION_MESSAGE,
  PUBLISHED_MESSAGE,
  SLUG_MESSAGE,
  SUMMARY_MESSAGE,
  TITLE_MESSAGE,
  trim,
  TYPE_MESSAGE,
  YEAR_ID_MESSAGE,
} from './create-news.dto';

const isSent = (_: object, value: unknown): boolean => value !== undefined;
// null efface le champ : il n'est pas validé. Une chaîne vide l'est, et échoue.
const isSentAndNotNull = (_: object, value: unknown): boolean =>
  value !== undefined && value !== null;

// Un champ absent est inchangé. Le slug ne change que s'il est envoyé.
export class UpdateNewsDto {
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

  @ValidateIf(isSent)
  @IsEnum(NewsType, { message: TYPE_MESSAGE })
  type?: NewsType;

  @ValidateIf(isSent)
  @IsISO8601({}, { message: DATE_MESSAGE })
  date?: string;

  @ValidateIf(isSent)
  @IsMongoId({ message: YEAR_ID_MESSAGE })
  rotaryYear?: string;

  @ValidateIf(isSentAndNotNull)
  @Transform(trim)
  @IsString({ message: LOCATION_MESSAGE })
  @Length(1, 120, { message: LOCATION_MESSAGE })
  location?: string | null;

  @ValidateIf(isSentAndNotNull)
  @Transform(trim)
  @IsString({ message: SUMMARY_MESSAGE })
  @Length(1, 500, { message: SUMMARY_MESSAGE })
  summary?: string | null;

  @ValidateIf(isSentAndNotNull)
  @Transform(trim)
  @IsString({ message: CONTENT_MESSAGE })
  @Length(1, 20000, { message: CONTENT_MESSAGE })
  content?: string | null;

  @ValidateIf(isSent)
  @IsBoolean({ message: PUBLISHED_MESSAGE })
  isPublished?: boolean;
}
