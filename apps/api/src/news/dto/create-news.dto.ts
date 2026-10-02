import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsISO8601,
  IsMongoId,
  IsOptional,
  IsString,
  Length,
  Matches,
  MaxLength,
} from 'class-validator';
import { NewsType } from '../../common/enums/news-type.enum';
import { SLUG_MAX_LENGTH, SLUG_PATTERN } from '../../common/utils/slug';

export const TITLE_MESSAGE =
  'Le titre est obligatoire, 120 caractères au plus.';
export const SLUG_MESSAGE =
  'Le slug ne contient que des minuscules, des chiffres et des tirets, 120 caractères au plus.';
export const TYPE_MESSAGE =
  "Le type doit être l'un des cinq types d'actualité.";
export const DATE_MESSAGE = 'La date doit être au format ISO 8601.';
export const YEAR_ID_MESSAGE = "Identifiant d'année Rotary invalide.";
export const LOCATION_MESSAGE = 'Le lieu compte 120 caractères au plus.';
export const SUMMARY_MESSAGE = 'Le résumé compte 500 caractères au plus.';
export const CONTENT_MESSAGE = 'Le contenu compte 20 000 caractères au plus.';
export const PUBLISHED_MESSAGE =
  "L'état de publication doit être vrai ou faux.";

export const trim = ({ value }: { value: unknown }): unknown =>
  typeof value === 'string' ? value.trim() : value;

// Ni photographie, ni date de publication, ni ordre : ils ne sont pas acceptés
// en entrée.
export class CreateNewsDto {
  @Transform(trim)
  @IsString({ message: TITLE_MESSAGE })
  @Length(1, 120, { message: TITLE_MESSAGE })
  title: string;

  // Facultatif : généré depuis le titre s'il est absent.
  @IsOptional()
  @IsString({ message: SLUG_MESSAGE })
  @Matches(SLUG_PATTERN, { message: SLUG_MESSAGE })
  @MaxLength(SLUG_MAX_LENGTH, { message: SLUG_MESSAGE })
  slug?: string;

  @IsEnum(NewsType, { message: TYPE_MESSAGE })
  type: NewsType;

  @IsISO8601({}, { message: DATE_MESSAGE })
  date: string;

  @IsMongoId({ message: YEAR_ID_MESSAGE })
  rotaryYear: string;

  @IsOptional()
  @Transform(trim)
  @IsString({ message: LOCATION_MESSAGE })
  @Length(1, 120, { message: LOCATION_MESSAGE })
  location?: string;

  @IsOptional()
  @Transform(trim)
  @IsString({ message: SUMMARY_MESSAGE })
  @Length(1, 500, { message: SUMMARY_MESSAGE })
  summary?: string;

  @IsOptional()
  @Transform(trim)
  @IsString({ message: CONTENT_MESSAGE })
  @Length(1, 20000, { message: CONTENT_MESSAGE })
  content?: string;

  @IsOptional()
  @IsBoolean({ message: PUBLISHED_MESSAGE })
  isPublished?: boolean;
}
