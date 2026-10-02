import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

// Une personne membre du club. Ses fonctions ne sont pas ici : elles vivent
// dans ses mandats (member-mandate.schema.ts).
@Schema({ timestamps: true })
export class Member {
  @Prop({ type: String, required: true, trim: true, maxlength: 120 })
  firstName: string;

  @Prop({ type: String, required: true, trim: true, maxlength: 120 })
  lastName: string;

  @Prop({ type: String, trim: true, maxlength: 120 })
  occupation?: string;

  // Usage interne : jamais exposé sur la surface publique.
  @Prop({ type: String, trim: true, lowercase: true, maxlength: 254 })
  email?: string;

  // Usage interne : jamais exposé sur la surface publique.
  @Prop({ type: String, trim: true })
  phone?: string;

  createdAt: Date;
  updatedAt: Date;
}

export const MemberSchema = SchemaFactory.createForClass(Member);

MemberSchema.index({ lastName: 1, firstName: 1 });
// Recherche par mot entier, sans racinisation : ce sont des noms propres.
MemberSchema.index(
  { firstName: 'text', lastName: 'text' },
  { default_language: 'none' },
);
