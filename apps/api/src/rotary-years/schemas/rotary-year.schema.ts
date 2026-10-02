import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

// Seule l'année de début est enregistrée : label, dates et caractère courant
// sont calculés (common/utils/rotary-year.ts).
@Schema({ timestamps: true })
export class RotaryYear {
  @Prop({ type: Number, required: true, unique: true })
  startYear: number;
}

export const RotaryYearSchema = SchemaFactory.createForClass(RotaryYear);
