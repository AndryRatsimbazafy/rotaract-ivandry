import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

export const DEFAULT_FOCUS = '50% 50%';

// Une image conservée au stockage, embarquée dans son contenu (portrait d'un
// membre, photographie d'une action ou d'une actualité). Son identifiant de
// sous-document sert à la modifier, la retirer ou la déplacer.
@Schema()
export class MediaRef {
  _id: Types.ObjectId;

  // Adresse publique, servie au navigateur.
  @Prop({ type: String, required: true })
  url: string;

  // Identifiant au stockage. Jamais renvoyé par l'API.
  @Prop({ type: String, required: true })
  publicId: string;

  // Nom d'origine, pour l'affichage dans le Back Office.
  @Prop({ type: String, required: true, maxlength: 255 })
  name: string;

  // Type constaté par l'API sur le contenu.
  @Prop({
    type: String,
    required: true,
    enum: ['image/jpeg', 'image/png', 'image/webp'],
  })
  mimeType: string;

  @Prop({ type: Number, required: true, min: 1, max: 5 * 1024 * 1024 })
  size: number;

  @Prop({ type: Number, required: true, min: 1 })
  width: number;

  @Prop({ type: Number, required: true, min: 1 })
  height: number;

  // Ce que l'image montre, pour qui ne la voit pas.
  @Prop({
    type: String,
    required: true,
    trim: true,
    minlength: 1,
    maxlength: 300,
  })
  alt: string;

  @Prop({ type: String, trim: true, maxlength: 300 })
  caption?: string;

  @Prop({ type: String, trim: true, maxlength: 120 })
  credit?: string;

  // Point d'intérêt gardé au recadrage, en syntaxe CSS.
  @Prop({ type: String, required: true, default: DEFAULT_FOCUS })
  focus: string;
}

export const MediaRefSchema = SchemaFactory.createForClass(MediaRef);

// Forme d'administration : sans identifiant au stockage.
export type AdminImage = {
  id: string;
  url: string;
  width: number;
  height: number;
  alt: string;
  caption: string | null;
  credit: string | null;
  focus: string;
  name: string;
  mimeType: string;
  size: number;
};

// Forme publique : ce qu'il faut pour afficher l'image, rien d'autre.
export type PublicImage = {
  url: string;
  width: number;
  height: number;
  alt: string;
  caption?: string;
  credit?: string;
  focus: string;
};

export function toAdminImage(image: MediaRef): AdminImage {
  return {
    id: image._id.toString(),
    url: image.url,
    width: image.width,
    height: image.height,
    alt: image.alt,
    caption: image.caption ?? null,
    credit: image.credit ?? null,
    focus: image.focus,
    name: image.name,
    mimeType: image.mimeType,
    size: image.size,
  };
}

export function toPublicImage(image: MediaRef): PublicImage {
  return {
    url: image.url,
    width: image.width,
    height: image.height,
    alt: image.alt,
    ...(image.caption ? { caption: image.caption } : {}),
    ...(image.credit ? { credit: image.credit } : {}),
    focus: image.focus,
  };
}
