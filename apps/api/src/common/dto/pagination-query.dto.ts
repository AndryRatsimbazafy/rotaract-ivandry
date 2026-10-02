import { Type } from 'class-transformer';
import { IsInt, Max, Min } from 'class-validator';

const PAGE_MESSAGE = 'La page doit être un entier supérieur ou égal à 1.';
export const LIMIT_MESSAGE =
  'La taille de page doit être un entier entre 1 et 100.';

// Contrat commun des listes paginées.
export class PaginationQueryDto {
  @Type(() => Number)
  @IsInt({ message: PAGE_MESSAGE })
  @Min(1, { message: PAGE_MESSAGE })
  page: number = 1;

  @Type(() => Number)
  @IsInt({ message: LIMIT_MESSAGE })
  @Min(1, { message: LIMIT_MESSAGE })
  @Max(100, { message: LIMIT_MESSAGE })
  limit: number = 20;
}

export type Paginated<T> = {
  data: T[];
  meta: { page: number; limit: number; total: number; totalPages: number };
};
