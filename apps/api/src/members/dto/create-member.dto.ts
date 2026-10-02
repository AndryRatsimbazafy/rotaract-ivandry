import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsOptional,
  IsString,
  Length,
  Matches,
  MaxLength,
} from 'class-validator';

export const FIRST_NAME_MESSAGE =
  'Le prénom est obligatoire, 120 caractères au plus.';
export const LAST_NAME_MESSAGE =
  'Le nom est obligatoire, 120 caractères au plus.';
export const OCCUPATION_MESSAGE =
  'La profession ou les études comptent 120 caractères au plus.';
export const EMAIL_MESSAGE = 'Adresse email invalide.';
export const PHONE_MESSAGE = 'Numéro de téléphone invalide.';

// Chiffres, espaces, « + », « - », « . », parenthèses ; au moins 8 chiffres.
export const PHONE_PATTERN = /^(?=(?:\D*\d){8})[\d\s+\-.()]+$/;

export const trim = ({ value }: { value: unknown }): unknown =>
  typeof value === 'string' ? value.trim() : value;

export const trimAndLowerCase = ({ value }: { value: unknown }): unknown =>
  typeof value === 'string' ? value.trim().toLowerCase() : value;

export class CreateMemberDto {
  @Transform(trim)
  @IsString({ message: FIRST_NAME_MESSAGE })
  @Length(1, 120, { message: FIRST_NAME_MESSAGE })
  firstName: string;

  @Transform(trim)
  @IsString({ message: LAST_NAME_MESSAGE })
  @Length(1, 120, { message: LAST_NAME_MESSAGE })
  lastName: string;

  @IsOptional()
  @Transform(trim)
  @IsString({ message: OCCUPATION_MESSAGE })
  @Length(1, 120, { message: OCCUPATION_MESSAGE })
  occupation?: string;

  @IsOptional()
  @Transform(trimAndLowerCase)
  @IsEmail({}, { message: EMAIL_MESSAGE })
  @MaxLength(254, { message: EMAIL_MESSAGE })
  email?: string;

  @IsOptional()
  @Transform(trim)
  @IsString({ message: PHONE_MESSAGE })
  @Matches(PHONE_PATTERN, { message: PHONE_MESSAGE })
  phone?: string;
}
