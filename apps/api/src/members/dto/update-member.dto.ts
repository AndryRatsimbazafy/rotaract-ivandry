import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsString,
  Length,
  Matches,
  MaxLength,
  ValidateIf,
} from 'class-validator';
import {
  EMAIL_MESSAGE,
  FIRST_NAME_MESSAGE,
  LAST_NAME_MESSAGE,
  OCCUPATION_MESSAGE,
  PHONE_MESSAGE,
  PHONE_PATTERN,
  trim,
  trimAndLowerCase,
} from './create-member.dto';

const isSent = (_: object, value: unknown): boolean => value !== undefined;
// null efface le champ : il n'est pas validé. Une chaîne vide l'est, et échoue.
const isSentAndNotNull = (_: object, value: unknown): boolean =>
  value !== undefined && value !== null;

// Un champ absent est inchangé.
export class UpdateMemberDto {
  @ValidateIf(isSent)
  @Transform(trim)
  @IsString({ message: FIRST_NAME_MESSAGE })
  @Length(1, 120, { message: FIRST_NAME_MESSAGE })
  firstName?: string;

  @ValidateIf(isSent)
  @Transform(trim)
  @IsString({ message: LAST_NAME_MESSAGE })
  @Length(1, 120, { message: LAST_NAME_MESSAGE })
  lastName?: string;

  @ValidateIf(isSentAndNotNull)
  @Transform(trim)
  @IsString({ message: OCCUPATION_MESSAGE })
  @Length(1, 120, { message: OCCUPATION_MESSAGE })
  occupation?: string | null;

  @ValidateIf(isSentAndNotNull)
  @Transform(trimAndLowerCase)
  @IsEmail({}, { message: EMAIL_MESSAGE })
  @MaxLength(254, { message: EMAIL_MESSAGE })
  email?: string | null;

  @ValidateIf(isSentAndNotNull)
  @Transform(trim)
  @IsString({ message: PHONE_MESSAGE })
  @Matches(PHONE_PATTERN, { message: PHONE_MESSAGE })
  phone?: string | null;
}
