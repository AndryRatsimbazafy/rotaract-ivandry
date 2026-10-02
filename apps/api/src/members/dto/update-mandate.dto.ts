import {
  ArrayUnique,
  IsArray,
  IsEnum,
  IsInt,
  Min,
  ValidateIf,
} from 'class-validator';
import { MemberRole } from '../../common/enums/member-role.enum';
import { ROLES_MESSAGE } from './create-mandate.dto';

const ORDER_MESSAGE = "L'ordre doit être un entier supérieur ou égal à 1.";
const isSent = (_: object, value: unknown): boolean => value !== undefined;

// Le membre et l'année d'un mandat ne se modifient pas.
export class UpdateMandateDto {
  @ValidateIf(isSent)
  @IsArray({ message: ROLES_MESSAGE })
  @IsEnum(MemberRole, { each: true, message: ROLES_MESSAGE })
  @ArrayUnique({ message: ROLES_MESSAGE })
  roles?: MemberRole[];

  @ValidateIf(isSent)
  @IsInt({ message: ORDER_MESSAGE })
  @Min(1, { message: ORDER_MESSAGE })
  order?: number;
}
