import { IsInt, Max, Min } from 'class-validator';

const MESSAGE = "L'année de début doit être un entier entre 2000 et 2100.";

// Entier JSON : aucune conversion depuis un texte, « "2026" » est refusé.
export class CreateRotaryYearDto {
  @IsInt({ message: MESSAGE })
  @Min(2000, { message: MESSAGE })
  @Max(2100, { message: MESSAGE })
  startYear: number;
}
