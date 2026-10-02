import { Transform } from 'class-transformer';
import {
  IsEnum,
  IsIn,
  IsOptional,
  IsString,
  MinLength,
  Validate,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { MemberRole } from '../../common/enums/member-role.enum';
import { parseRotaryYearLabel } from '../../common/utils/rotary-year';
import { trim } from './create-member.dto';

export const YEAR_LABEL_MESSAGE =
  "L'année doit être au format AAAA-AAAA, avec deux années consécutives.";
const SEARCH_MESSAGE = 'La recherche doit compter 2 caractères au moins.';

@ValidatorConstraint({ name: 'isRotaryYearLabel' })
export class IsRotaryYearLabel implements ValidatorConstraintInterface {
  validate(value: unknown): boolean {
    return typeof value === 'string' && parseRotaryYearLabel(value) !== null;
  }
}

export const MEMBER_SORTS = [
  'lastName',
  '-lastName',
  'createdAt',
  '-createdAt',
] as const;

export class QueryMembersDto extends PaginationQueryDto {
  @IsOptional()
  @Transform(trim)
  @IsString({ message: SEARCH_MESSAGE })
  @MinLength(2, { message: SEARCH_MESSAGE })
  q?: string;

  @IsOptional()
  @Validate(IsRotaryYearLabel, { message: YEAR_LABEL_MESSAGE })
  year?: string;

  @IsOptional()
  @IsEnum(MemberRole, { message: 'Fonction inconnue.' })
  role?: MemberRole;

  @IsIn(MEMBER_SORTS, { message: 'Tri non autorisé.' })
  sort: (typeof MEMBER_SORTS)[number] = 'lastName';
}
