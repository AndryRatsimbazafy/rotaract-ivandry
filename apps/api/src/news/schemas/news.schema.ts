import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { SchemaTypes, Types } from 'mongoose';
import { NewsType } from '../../common/enums/news-type.enum';

// Une actualité du club. Entité distincte des actions : la date y domine, et
// elle n'a ni impact, ni domaine, ni ordre manuel.
// Le nom de collection est fixé : « news » n'a pas de pluriel.
@Schema({ timestamps: true, collection: 'news' })
export class News {
  @Prop({ type: String, required: true, trim: true, maxlength: 120 })
  title: string;

  @Prop({ type: String, required: true, unique: true, maxlength: 120 })
  slug: string;

  @Prop({ type: String, required: true, enum: Object.values(NewsType) })
  type: NewsType;

  // Un seul champ de date et heure : ni heure séparée, ni date de fin.
  @Prop({ type: Date, required: true })
  date: Date;

  // Choisie par l'administrateur, jamais déduite de la date.
  @Prop({ type: SchemaTypes.ObjectId, ref: 'RotaryYear', required: true })
  rotaryYear: Types.ObjectId;

  @Prop({ type: String, trim: true, maxlength: 120 })
  location?: string;

  @Prop({ type: String, trim: true, maxlength: 500 })
  summary?: string;

  @Prop({ type: String, trim: true, maxlength: 20000 })
  content?: string;

  @Prop({ type: Boolean, required: true, default: false })
  isPublished: boolean;

  // Posé à la première publication, jamais réécrit.
  @Prop({ type: Date })
  publishedAt?: Date;

  createdAt: Date;
  updatedAt: Date;
}

export const NewsSchema = SchemaFactory.createForClass(News);

NewsSchema.index({ isPublished: 1, date: -1 });
NewsSchema.index({ rotaryYear: 1, isPublished: 1 });
NewsSchema.index({ type: 1 });
// Recherche par mot entier, sans racinisation.
NewsSchema.index(
  { title: 'text', summary: 'text' },
  { default_language: 'none' },
);
