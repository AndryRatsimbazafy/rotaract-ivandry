import { Transform, Type } from 'class-transformer';
import {
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  Length,
  Max,
  MaxLength,
  Min,
  registerDecorator,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import {
  FaqQuestion,
  REQUIRED_FAQ_QUESTIONS,
} from '../../common/enums/faq-question.enum';
import { englishLengthMessage } from '../../common/dto/translation.dto';

export const FACEBOOK_MESSAGE =
  "Indiquez l'adresse complète de la page Facebook du club, commençant par https://.";
export const INSTAGRAM_MESSAGE =
  "Indiquez l'adresse complète du compte Instagram du club, commençant par https://.";
export const FOUNDED_YEAR_MESSAGE =
  "L'année de création est une année entre 1968 et l'année en cours.";
export const SPONSOR_CLUB_MESSAGE =
  'Le club parrain compte 120 caractères au plus.';
export const MEMBER_COUNT_MESSAGE =
  'Le nombre de membres est un entier de 1 à 999.';
export const MEETING_PLACE_MESSAGE =
  'Le lieu des réunions compte 160 caractères au plus.';
export const MEETING_RHYTHM_MESSAGE =
  'Le rythme des réunions compte 160 caractères au plus.';
export const FAQ_LENGTH_MESSAGE = 'La réponse compte 1000 caractères au plus.';
export const FAQ_REQUIRED_MESSAGE = "Cette question a besoin d'une réponse.";

// Création du premier club Rotaract.
const FIRST_FOUNDED_YEAR = 1968;

// Espaces de bord retirés ; une chaîne vide vide le champ, comme null.
const trimOrNull = ({ value }: { value: unknown }): unknown => {
  if (typeof value !== 'string') {
    return value;
  }
  const trimmed = value.trim();
  return trimmed === '' ? null : trimmed;
};

// Un champ absent est inchangé ; null le vide sans être validé.
const isSentAndNotNull = (_: object, value: unknown): boolean =>
  value !== undefined && value !== null;
const isSent = (_: object, value: unknown): boolean => value !== undefined;

function IsFoundedYear() {
  return (target: object, propertyName: string) => {
    registerDecorator({
      name: 'isFoundedYear',
      target: target.constructor,
      propertyName,
      options: { message: FOUNDED_YEAR_MESSAGE },
      validator: {
        validate: (value: unknown) =>
          Number.isInteger(value) &&
          (value as number) >= FIRST_FOUNDED_YEAR &&
          (value as number) <= new Date().getUTCFullYear(),
      },
    });
  };
}

// Réponse de la FAQ : 1000 caractères au plus. Une question obligatoire refuse
// null, avec son propre message.
function IsFaqAnswer(required: boolean) {
  return (target: object, propertyName: string) => {
    registerDecorator({
      name: 'isFaqAnswer',
      target: target.constructor,
      propertyName,
      validator: {
        validate: (value: unknown) =>
          value === null
            ? !required
            : typeof value === 'string' && value.length <= 1000,
        defaultMessage: (args) =>
          args?.value === null ? FAQ_REQUIRED_MESSAGE : FAQ_LENGTH_MESSAGE,
      },
    });
  };
}

export class SocialDto {
  @ValidateIf(isSentAndNotNull)
  @Transform(trimOrNull)
  @IsUrl(
    {
      protocols: ['https'],
      require_protocol: true,
      host_whitelist: [
        'facebook.com',
        'www.facebook.com',
        'm.facebook.com',
        'fb.com',
      ],
    },
    { message: FACEBOOK_MESSAGE },
  )
  @MaxLength(300, { message: FACEBOOK_MESSAGE })
  facebook?: string | null;

  @ValidateIf(isSentAndNotNull)
  @Transform(trimOrNull)
  @IsUrl(
    {
      protocols: ['https'],
      require_protocol: true,
      host_whitelist: ['instagram.com', 'www.instagram.com'],
    },
    { message: INSTAGRAM_MESSAGE },
  )
  @MaxLength(300, { message: INSTAGRAM_MESSAGE })
  instagram?: string | null;
}

export class ClubDto {
  @ValidateIf(isSentAndNotNull)
  @IsFoundedYear()
  foundedYear?: number | null;

  @ValidateIf(isSentAndNotNull)
  @Transform(trimOrNull)
  @IsString({ message: SPONSOR_CLUB_MESSAGE })
  @Length(1, 120, { message: SPONSOR_CLUB_MESSAGE })
  sponsorClub?: string | null;

  @ValidateIf(isSentAndNotNull)
  @IsInt({ message: MEMBER_COUNT_MESSAGE })
  @Min(1, { message: MEMBER_COUNT_MESSAGE })
  @Max(999, { message: MEMBER_COUNT_MESSAGE })
  memberCount?: number | null;

  @ValidateIf(isSentAndNotNull)
  @Transform(trimOrNull)
  @IsString({ message: MEETING_PLACE_MESSAGE })
  @Length(1, 160, { message: MEETING_PLACE_MESSAGE })
  meetingPlace?: string | null;

  @ValidateIf(isSentAndNotNull)
  @Transform(trimOrNull)
  @IsString({ message: MEETING_RHYTHM_MESSAGE })
  @Length(1, 160, { message: MEETING_RHYTHM_MESSAGE })
  meetingRhythm?: string | null;
}

const required = (question: FaqQuestion) =>
  REQUIRED_FAQ_QUESTIONS.includes(question);

export class FaqDto {
  @ValidateIf(isSent)
  @Transform(trimOrNull)
  @IsFaqAnswer(required(FaqQuestion.Qui))
  qui?: string | null;

  @ValidateIf(isSent)
  @Transform(trimOrNull)
  @IsFaqAnswer(required(FaqQuestion.Rencontre))
  rencontre?: string | null;

  @ValidateIf(isSent)
  @Transform(trimOrNull)
  @IsFaqAnswer(required(FaqQuestion.Sympathisant))
  sympathisant?: string | null;

  @ValidateIf(isSent)
  @Transform(trimOrNull)
  @IsFaqAnswer(required(FaqQuestion.Avant))
  avant?: string | null;

  @ValidateIf(isSent)
  @Transform(trimOrNull)
  @IsFaqAnswer(required(FaqQuestion.Membre))
  membre?: string | null;

  @ValidateIf(isSent)
  @Transform(trimOrNull)
  @IsFaqAnswer(required(FaqQuestion.Frequence))
  frequence?: string | null;
}

// Traductions anglaises (fonctionnalité 014) : facultatives, aucune réponse
// obligatoire.
export class ClubEnDto {
  @ValidateIf(isSentAndNotNull)
  @Transform(trimOrNull)
  @IsString({ message: englishLengthMessage('Le club parrain', 120) })
  @Length(1, 120, { message: englishLengthMessage('Le club parrain', 120) })
  sponsorClub?: string | null;

  @ValidateIf(isSentAndNotNull)
  @Transform(trimOrNull)
  @IsString({ message: englishLengthMessage('Le lieu des réunions', 160) })
  @Length(1, 160, {
    message: englishLengthMessage('Le lieu des réunions', 160),
  })
  meetingPlace?: string | null;

  @ValidateIf(isSentAndNotNull)
  @Transform(trimOrNull)
  @IsString({ message: englishLengthMessage('Le rythme des réunions', 160) })
  @Length(1, 160, {
    message: englishLengthMessage('Le rythme des réunions', 160),
  })
  meetingRhythm?: string | null;
}

const FAQ_EN_MESSAGE = englishLengthMessage('La réponse', 1000);

export class FaqEnDto {
  @ValidateIf(isSentAndNotNull)
  @Transform(trimOrNull)
  @IsString({ message: FAQ_EN_MESSAGE })
  @Length(1, 1000, { message: FAQ_EN_MESSAGE })
  qui?: string | null;

  @ValidateIf(isSentAndNotNull)
  @Transform(trimOrNull)
  @IsString({ message: FAQ_EN_MESSAGE })
  @Length(1, 1000, { message: FAQ_EN_MESSAGE })
  rencontre?: string | null;

  @ValidateIf(isSentAndNotNull)
  @Transform(trimOrNull)
  @IsString({ message: FAQ_EN_MESSAGE })
  @Length(1, 1000, { message: FAQ_EN_MESSAGE })
  sympathisant?: string | null;

  @ValidateIf(isSentAndNotNull)
  @Transform(trimOrNull)
  @IsString({ message: FAQ_EN_MESSAGE })
  @Length(1, 1000, { message: FAQ_EN_MESSAGE })
  avant?: string | null;

  @ValidateIf(isSentAndNotNull)
  @Transform(trimOrNull)
  @IsString({ message: FAQ_EN_MESSAGE })
  @Length(1, 1000, { message: FAQ_EN_MESSAGE })
  membre?: string | null;

  @ValidateIf(isSentAndNotNull)
  @Transform(trimOrNull)
  @IsString({ message: FAQ_EN_MESSAGE })
  @Length(1, 1000, { message: FAQ_EN_MESSAGE })
  frequence?: string | null;
}

export class SiteSettingsEnDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => ClubEnDto)
  club?: ClubEnDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => FaqEnDto)
  faq?: FaqEnDto;
}

// Corps de PATCH /admin/site-settings : partiel ; null vide un champ.
export class UpdateSiteSettingsDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => SocialDto)
  social?: SocialDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => ClubDto)
  club?: ClubDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => FaqDto)
  faq?: FaqDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => SiteSettingsEnDto)
  en?: SiteSettingsEnDto;
}
