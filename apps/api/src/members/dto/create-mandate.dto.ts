import {
  ArrayUnique,
  IsArray,
  IsEnum,
  IsMongoId,
  IsOptional,
} from 'class-validator';
import { MemberRole } from '../../common/enums/member-role.enum';

export const ROLES_MESSAGE =
  'Les fonctions doivent appartenir à la liste des fonctions du club, sans doublon.';
export const YEAR_ID_MESSAGE = "Identifiant d'année Rotary invalide.";

// Pas de champ « order » : il est attribué par le système, à la suite des
// mandats de l'année.
export class CreateMandateDto {
  @IsMongoId({ message: 'Identifiant de membre invalide.' })
  member: string;

  @IsMongoId({ message: YEAR_ID_MESSAGE })
  rotaryYear: string;

  @IsOptional()
  @IsArray({ message: ROLES_MESSAGE })
  @IsEnum(MemberRole, { each: true, message: ROLES_MESSAGE })
  @ArrayUnique({ message: ROLES_MESSAGE })
  roles?: MemberRole[];
}
