import { Transform, Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayUnique,
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsISO8601,
  IsMongoId,
  IsObject,
  IsOptional,
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

export const TITLE_MESSAGE =
  'Le titre est obligatoire, 120 caractères au plus.';
export const SLUG_MESSAGE =
  'Le slug ne contient que des minuscules, des chiffres et des tirets, 120 caractères au plus.';
export const SUMMARY_MESSAGE = 'Le résumé compte 500 caractères au plus.';
export const DESCRIPTION_MESSAGE =
  'La description compte 20 000 caractères au plus.';
export const DATE_MESSAGE = 'La date doit être au format ISO 8601.';
export const YEAR_ID_MESSAGE = "Identifiant d'année Rotary invalide.";
export const FOCUS_AREAS_MESSAGE =
  "Les domaines doivent appartenir à la liste des domaines d'action, sans doublon.";
export const IMPACT_MESSAGE = "L'impact doit être un objet.";
export const IMPACT_TEXT_MESSAGE =
  'Cette rubrique compte 500 caractères au plus.';
export const IMPACT_PARTNERS_MESSAGE =
  '20 partenaires au plus, 120 caractères chacun.';
export const PUBLISHED_MESSAGE =
  "L'état de publication doit être vrai ou faux.";
export const ORDER_MESSAGE =
  "L'ordre doit être un entier supérieur ou égal à 1.";

export const trim = ({ value }: { value: unknown }): unknown =>
  typeof value === 'string' ? value.trim() : value;

const trimEach = ({ value }: { value: unknown }): unknown =>
  Array.isArray(value)
    ? value.map((item: unknown) =>
        typeof item === 'string' ? item.trim() : item,
      )
    : value;

const isSent = (_: object, value: unknown): boolean => value !== undefined;

// Une rubrique absente n'existe pas ; une rubrique envoyée doit être remplie.
export class ActionImpactDto {
  @ValidateIf(isSent)
  @Transform(trim)
  @IsString({ message: IMPACT_TEXT_MESSAGE })
  @Length(1, 500, { message: IMPACT_TEXT_MESSAGE })
  objective?: string;

  @ValidateIf(isSent)
  @Transform(trim)
  @IsString({ message: IMPACT_TEXT_MESSAGE })
  @Length(1, 500, { message: IMPACT_TEXT_MESSAGE })
  beneficiaries?: string;

  @ValidateIf(isSent)
  @Transform(trim)
  @IsString({ message: IMPACT_TEXT_MESSAGE })
  @Length(1, 500, { message: IMPACT_TEXT_MESSAGE })
  location?: string;

  @ValidateIf(isSent)
  @Transform(trim)
  @IsString({ message: IMPACT_TEXT_MESSAGE })
  @Length(1, 500, { message: IMPACT_TEXT_MESSAGE })
  period?: string;

  @ValidateIf(isSent)
  @Transform(trimEach)
  @IsArray({ message: IMPACT_PARTNERS_MESSAGE })
  @ArrayMaxSize(20, { message: IMPACT_PARTNERS_MESSAGE })
  @IsString({ each: true, message: IMPACT_PARTNERS_MESSAGE })
  @Length(1, 120, { each: true, message: IMPACT_PARTNERS_MESSAGE })
  partners?: string[];

  @ValidateIf(isSent)
  @Transform(trim)
  @IsString({ message: IMPACT_TEXT_MESSAGE })
  @Length(1, 500, { message: IMPACT_TEXT_MESSAGE })
  results?: string;
}

// Ni photographie ni date de publication : elles ne sont pas acceptées en entrée.
export class CreateActionDto {
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

  @IsOptional()
  @Transform(trim)
  @IsString({ message: SUMMARY_MESSAGE })
  @Length(1, 500, { message: SUMMARY_MESSAGE })
  summary?: string;

  @IsOptional()
  @Transform(trim)
  @IsString({ message: DESCRIPTION_MESSAGE })
  @Length(1, 20000, { message: DESCRIPTION_MESSAGE })
  description?: string;

  @IsISO8601({}, { message: DATE_MESSAGE })
  date: string;

  @IsMongoId({ message: YEAR_ID_MESSAGE })
  rotaryYear: string;

  @IsOptional()
  @IsArray({ message: FOCUS_AREAS_MESSAGE })
  @IsEnum(FocusArea, { each: true, message: FOCUS_AREAS_MESSAGE })
  @ArrayUnique({ message: FOCUS_AREAS_MESSAGE })
  focusAreas?: FocusArea[];

  @IsOptional()
  @IsObject({ message: IMPACT_MESSAGE })
  @ValidateNested({ message: IMPACT_MESSAGE })
  @Type(() => ActionImpactDto)
  impact?: ActionImpactDto;

  @IsOptional()
  @IsBoolean({ message: PUBLISHED_MESSAGE })
  isPublished?: boolean;

  @IsOptional()
  @IsInt({ message: ORDER_MESSAGE })
  @Min(1, { message: ORDER_MESSAGE })
  order?: number;
}
