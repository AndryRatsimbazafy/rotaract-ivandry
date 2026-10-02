import { ArrayUnique, IsArray, IsMongoId } from 'class-validator';
import { YEAR_ID_MESSAGE } from './create-mandate.dto';

export const MANDATE_IDS_MESSAGE =
  "La liste doit contenir tous les mandats de l'année, chacun une seule fois.";

export class ReorderMandatesDto {
  @IsMongoId({ message: YEAR_ID_MESSAGE })
  rotaryYear: string;

  @IsArray({ message: MANDATE_IDS_MESSAGE })
  @IsMongoId({ each: true, message: MANDATE_IDS_MESSAGE })
  @ArrayUnique({ message: MANDATE_IDS_MESSAGE })
  mandateIds: string[];
}
