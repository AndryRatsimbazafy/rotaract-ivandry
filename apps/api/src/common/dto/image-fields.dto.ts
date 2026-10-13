import { Transform } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayUnique,
  IsArray,
  IsMongoId,
  IsString,
  MinLength,
  Matches,
  MaxLength,
  ValidateIf,
} from 'class-validator';

export const ALT_REQUIRED_MESSAGE = 'Le texte alternatif est obligatoire.';
export const ALT_LENGTH_MESSAGE =
  'Le texte alternatif compte 300 caractères au plus.';
export const CAPTION_MESSAGE = 'La légende compte 300 caractères au plus.';
export const CREDIT_MESSAGE = 'Le crédit compte 120 caractères au plus.';
export const ALT_EN_MESSAGE =
  'Le texte alternatif (anglais) compte 300 caractères au plus.';
export const CAPTION_EN_MESSAGE =
  'La légende (anglais) compte 300 caractères au plus.';
export const FOCUS_MESSAGE =
  "Le point d'intérêt doit être de la forme « 50% 30% ».";

// Deux pourcentages entiers de 0 à 100.
const FOCUS_PATTERN = /^(100|[1-9]?\d)% (100|[1-9]?\d)%$/;

const trim = ({ value }: { value: unknown }): unknown =>
  typeof value === 'string' ? value.trim() : value;
// Une chaîne vide vaut absence.
const trimOrAbsent = ({ value }: { value: unknown }): unknown => {
  if (typeof value !== 'string') {
    return value;
  }
  const trimmed = value.trim();
  return trimmed === '' ? undefined : trimmed;
};
// En modification, une chaîne vide retire le champ, comme null.
const trimOrNull = ({ value }: { value: unknown }): unknown => {
  if (typeof value !== 'string') {
    return value;
  }
  const trimmed = value.trim();
  return trimmed === '' ? null : trimmed;
};

const isSent = (_: object, value: unknown): boolean => value !== undefined;
const isSentAndNotNull = (_: object, value: unknown): boolean =>
  value !== undefined && value !== null;

// Champs qui accompagnent l'envoi d'une image (multipart).
export class ImageFieldsDto {
  @Transform(trim)
  @IsString({ message: ALT_REQUIRED_MESSAGE })
  @MinLength(1, { message: ALT_REQUIRED_MESSAGE })
  @MaxLength(300, { message: ALT_LENGTH_MESSAGE })
  alt: string;

  @ValidateIf(isSent)
  @Transform(trimOrAbsent)
  @IsString({ message: CAPTION_MESSAGE })
  @MaxLength(300, { message: CAPTION_MESSAGE })
  caption?: string;

  @ValidateIf(isSent)
  @Transform(trimOrAbsent)
  @IsString({ message: CREDIT_MESSAGE })
  @MaxLength(120, { message: CREDIT_MESSAGE })
  credit?: string;

  @ValidateIf(isSent)
  @Transform(trimOrAbsent)
  @IsString({ message: FOCUS_MESSAGE })
  @Matches(FOCUS_PATTERN, { message: FOCUS_MESSAGE })
  focus?: string;

  // Traductions anglaises facultatives (fonctionnalité 014).
  @ValidateIf(isSent)
  @Transform(trimOrAbsent)
  @IsString({ message: ALT_EN_MESSAGE })
  @MaxLength(300, { message: ALT_EN_MESSAGE })
  altEn?: string;

  @ValidateIf(isSent)
  @Transform(trimOrAbsent)
  @IsString({ message: CAPTION_EN_MESSAGE })
  @MaxLength(300, { message: CAPTION_EN_MESSAGE })
  captionEn?: string;
}

// Modification des champs d'une image : un champ absent est inchangé ; null
// ou une chaîne vide retire la légende ou le crédit.
export class UpdateImageFieldsDto {
  @ValidateIf(isSent)
  @Transform(trim)
  @IsString({ message: ALT_REQUIRED_MESSAGE })
  @MinLength(1, { message: ALT_REQUIRED_MESSAGE })
  @MaxLength(300, { message: ALT_LENGTH_MESSAGE })
  alt?: string;

  @ValidateIf(isSentAndNotNull)
  @Transform(trimOrNull)
  @IsString({ message: CAPTION_MESSAGE })
  @MaxLength(300, { message: CAPTION_MESSAGE })
  caption?: string | null;

  @ValidateIf(isSentAndNotNull)
  @Transform(trimOrNull)
  @IsString({ message: CREDIT_MESSAGE })
  @MaxLength(120, { message: CREDIT_MESSAGE })
  credit?: string | null;

  @ValidateIf(isSent)
  @Transform(trim)
  @IsString({ message: FOCUS_MESSAGE })
  @Matches(FOCUS_PATTERN, { message: FOCUS_MESSAGE })
  focus?: string;

  @ValidateIf(isSentAndNotNull)
  @Transform(trimOrNull)
  @IsString({ message: ALT_EN_MESSAGE })
  @MaxLength(300, { message: ALT_EN_MESSAGE })
  altEn?: string | null;

  @ValidateIf(isSentAndNotNull)
  @Transform(trimOrNull)
  @IsString({ message: CAPTION_EN_MESSAGE })
  @MaxLength(300, { message: CAPTION_EN_MESSAGE })
  captionEn?: string | null;
}

export const ORDER_MESSAGE =
  'La liste doit contenir toutes les photographies, chacune une fois.';

export class ReorderPhotosDto {
  @IsArray({ message: ORDER_MESSAGE })
  @ArrayMaxSize(20, { message: ORDER_MESSAGE })
  @ArrayUnique({ message: ORDER_MESSAGE })
  @IsMongoId({ each: true, message: ORDER_MESSAGE })
  photoIds: string[];
}
