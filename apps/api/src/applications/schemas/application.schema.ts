import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApplicantStatus } from '../../common/enums/applicant-status.enum';
import { FileRef, FileRefSchema } from '../../common/schemas/file-ref.schema';

// Une candidature au club. Simplement enregistrée : aucun état de traitement,
// et elle ne se modifie pas, d'où l'absence de updatedAt.
@Schema({ timestamps: { createdAt: true, updatedAt: false } })
export class Application {
  @Prop({ type: String, required: true, trim: true, maxlength: 120 })
  firstName: string;

  @Prop({ type: String, required: true, trim: true, maxlength: 120 })
  lastName: string;

  // Non unique : une personne peut candidater plusieurs fois.
  @Prop({
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    maxlength: 254,
  })
  email: string;

  @Prop({ type: String, required: true, trim: true })
  phone: string;

  @Prop({
    type: String,
    required: true,
    enum: Object.values(ApplicantStatus),
  })
  applicantStatus: ApplicantStatus;

  @Prop({ type: FileRefSchema, required: true })
  cv: FileRef;

  // La date de candidature.
  createdAt: Date;
}

export const ApplicationSchema = SchemaFactory.createForClass(Application);

ApplicationSchema.index({ createdAt: 1 });
ApplicationSchema.index(
  { firstName: 'text', lastName: 'text', email: 'text' },
  { default_language: 'none' },
);
