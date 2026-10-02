import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsEnum,
  IsString,
  Length,
  Matches,
  MaxLength,
} from 'class-validator';
import { ApplicantStatus } from '../../common/enums/applicant-status.enum';

export const FIRST_NAME_MESSAGE =
  'Le prénom est obligatoire, 120 caractères au plus.';
export const LAST_NAME_MESSAGE =
  'Le nom est obligatoire, 120 caractères au plus.';
export const EMAIL_MESSAGE = 'Adresse email invalide.';
export const PHONE_MESSAGE = 'Numéro de téléphone invalide.';
export const APPLICANT_STATUS_MESSAGE =
  'La situation doit être « etudiant » ou « professionnel ».';

// Chiffres, espaces, « + », « - », « . », parenthèses ; au moins 8 chiffres.
const PHONE_PATTERN = /^(?=(?:\D*\d){8})[\d\s+\-.()]+$/;

export const trim = ({ value }: { value: unknown }): unknown =>
  typeof value === 'string' ? value.trim() : value;

const trimAndLowerCase = ({ value }: { value: unknown }): unknown =>
  typeof value === 'string' ? value.trim().toLowerCase() : value;

// Champs texte du dépôt. Le CV arrive à part, comme fichier. Tout autre champ,
// dont un état de traitement, est refusé par le socle.
export class CreateApplicationDto {
  @Transform(trim)
  @IsString({ message: FIRST_NAME_MESSAGE })
  @Length(1, 120, { message: FIRST_NAME_MESSAGE })
  firstName: string;

  @Transform(trim)
  @IsString({ message: LAST_NAME_MESSAGE })
  @Length(1, 120, { message: LAST_NAME_MESSAGE })
  lastName: string;

  @Transform(trimAndLowerCase)
  @IsEmail({}, { message: EMAIL_MESSAGE })
  @MaxLength(254, { message: EMAIL_MESSAGE })
  email: string;

  @Transform(trim)
  @IsString({ message: PHONE_MESSAGE })
  @Matches(PHONE_PATTERN, { message: PHONE_MESSAGE })
  phone: string;

  @IsEnum(ApplicantStatus, { message: APPLICANT_STATUS_MESSAGE })
  applicantStatus: ApplicantStatus;
}
