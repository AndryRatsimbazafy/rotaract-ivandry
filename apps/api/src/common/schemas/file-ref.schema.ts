import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

// Un fichier conservé au stockage, embarqué dans son document. Aucune adresse :
// le fichier n'en a pas de publique.
@Schema({ _id: false })
export class FileRef {
  // Identifiant au stockage. Jamais renvoyé par l'API.
  @Prop({ type: String, required: true })
  publicId: string;

  // Nom d'origine, pour l'affichage et le téléchargement.
  @Prop({ type: String, required: true, maxlength: 255 })
  name: string;

  // Type constaté par l'API sur le contenu.
  @Prop({ type: String, required: true })
  mimeType: string;

  @Prop({ type: Number, required: true, min: 1 })
  size: number;
}

export const FileRefSchema = SchemaFactory.createForClass(FileRef);
