import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import {
  MediaRef,
  MediaRefSchema,
} from '../../common/schemas/media-ref.schema';
import { SchemaTypes, Types } from 'mongoose';
import { FocusArea } from '../../common/enums/focus-area.enum';

// Fiche d'impact : seules les rubriques fournies sont enregistrées, aucune
// n'est jamais estimée.
@Schema({ _id: false })
export class ActionImpact {
  @Prop({ type: String, trim: true, maxlength: 500 })
  objective?: string;

  @Prop({ type: String, trim: true, maxlength: 500 })
  beneficiaries?: string;

  @Prop({ type: String, trim: true, maxlength: 500 })
  location?: string;

  @Prop({ type: String, trim: true, maxlength: 500 })
  period?: string;

  @Prop({ type: [String], default: undefined })
  partners?: string[];

  @Prop({ type: String, trim: true, maxlength: 500 })
  results?: string;
}

const ActionImpactSchema = SchemaFactory.createForClass(ActionImpact);

// Traduction anglaise de l'impact (fonctionnalité 014) : les partenaires ne
// se traduisent pas.
@Schema({ _id: false })
export class ActionImpactEn {
  @Prop({ type: String, trim: true, maxlength: 500 })
  objective?: string;

  @Prop({ type: String, trim: true, maxlength: 500 })
  beneficiaries?: string;

  @Prop({ type: String, trim: true, maxlength: 500 })
  location?: string;

  @Prop({ type: String, trim: true, maxlength: 500 })
  period?: string;

  @Prop({ type: String, trim: true, maxlength: 500 })
  results?: string;
}

// Traduction anglaise facultative ; le français reste la référence.
@Schema({ _id: false })
export class ActionEn {
  @Prop({ type: String, trim: true, maxlength: 120 })
  title?: string;

  @Prop({ type: String, trim: true, maxlength: 500 })
  summary?: string;

  @Prop({ type: String, trim: true, maxlength: 20000 })
  description?: string;

  @Prop({ type: SchemaFactory.createForClass(ActionImpactEn) })
  impact?: ActionImpactEn;
}

const ActionEnSchema = SchemaFactory.createForClass(ActionEn);

// Projet ou activité du club. Entité distincte des actualités.
@Schema({ timestamps: true })
export class Action {
  @Prop({ type: String, required: true, trim: true, maxlength: 120 })
  title: string;

  @Prop({ type: String, required: true, unique: true, maxlength: 120 })
  slug: string;

  @Prop({ type: String, trim: true, maxlength: 500 })
  summary?: string;

  @Prop({ type: String, trim: true, maxlength: 20000 })
  description?: string;

  @Prop({ type: Date, required: true })
  date: Date;

  // Choisie par l'administrateur, jamais déduite de la date.
  @Prop({ type: SchemaTypes.ObjectId, ref: 'RotaryYear', required: true })
  rotaryYear: Types.ObjectId;

  @Prop({ type: [String], enum: Object.values(FocusArea), default: [] })
  focusAreas: FocusArea[];

  @Prop({ type: ActionEnSchema })
  en?: ActionEn;

  @Prop({ type: ActionImpactSchema })
  impact?: ActionImpact;

  @Prop({ type: Boolean, required: true, default: false })
  isPublished: boolean;

  // Posé à la première publication, jamais réécrit.
  @Prop({ type: Date })
  publishedAt?: Date;

  // Ordre manuel facultatif : entier à partir de 1, global, non unique.
  @Prop({ type: Number })
  order?: number;

  // Action marquante de la frise du club (fonctionnalité 015) : trois au plus
  // par année Rotary, vérifié par le service.
  @Prop({ type: Boolean, required: true, default: false })
  highlighted: boolean;

  // Photographies, dans l'ordre : la première est la principale. 20 au plus.
  @Prop({ type: [MediaRefSchema], default: [] })
  photos: MediaRef[];

  createdAt: Date;
  updatedAt: Date;
}

export const ActionSchema = SchemaFactory.createForClass(Action);

ActionSchema.index({ isPublished: 1, date: -1 });
ActionSchema.index({ rotaryYear: 1, isPublished: 1 });
ActionSchema.index({ rotaryYear: 1, highlighted: 1 });
ActionSchema.index({ focusAreas: 1 });
// Recherche par mot entier, sans racinisation.
ActionSchema.index(
  { title: 'text', summary: 'text' },
  { default_language: 'none' },
);
