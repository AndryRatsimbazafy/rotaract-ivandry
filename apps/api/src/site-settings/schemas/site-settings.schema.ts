import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Schema as MongooseSchema } from 'mongoose';
import { FaqQuestion } from '../../common/enums/faq-question.enum';
import { SitePhotoSlot } from '../../common/enums/site-photo-slot.enum';
import {
  MediaRef,
  MediaRefSchema,
} from '../../common/schemas/media-ref.schema';

// Identifiant du seul document de la collection.
export const SITE_SETTINGS_ID = 'site';

@Schema({ _id: false })
export class SocialLinks {
  @Prop({ type: String })
  facebook?: string;

  @Prop({ type: String })
  instagram?: string;
}

@Schema({ _id: false })
export class ClubFacts {
  @Prop({ type: Number })
  foundedYear?: number;

  @Prop({ type: String })
  sponsorClub?: string;

  @Prop({ type: Number })
  memberCount?: number;

  @Prop({ type: String })
  meetingPlace?: string;

  @Prop({ type: String })
  meetingRhythm?: string;
}

// Traduction anglaise des informations textuelles du club (fonctionnalité 014).
@Schema({ _id: false })
export class ClubFactsEn {
  @Prop({ type: String })
  sponsorClub?: string;

  @Prop({ type: String })
  meetingPlace?: string;

  @Prop({ type: String })
  meetingRhythm?: string;
}

export type FaqAnswers = Partial<Record<FaqQuestion, string>>;
export type SitePhotos = Partial<Record<SitePhotoSlot, MediaRef>>;

// Une propriété par valeur des listes fermées.
const FaqAnswersSchema = new MongooseSchema(
  Object.fromEntries(
    Object.values(FaqQuestion).map((question) => [question, { type: String }]),
  ),
  { _id: false },
);

const SitePhotosSchema = new MongooseSchema(
  Object.fromEntries(
    Object.values(SitePhotoSlot).map((slot) => [
      slot,
      { type: MediaRefSchema },
    ]),
  ),
  { _id: false },
);

// Traductions anglaises facultatives : club et réponses de la FAQ.
@Schema({ _id: false })
export class SiteSettingsEn {
  @Prop({ type: SchemaFactory.createForClass(ClubFactsEn) })
  club?: ClubFactsEn;

  @Prop({ type: FaqAnswersSchema })
  faq?: FaqAnswers;

  // Histoire du club en anglais (fonctionnalité 015).
  @Prop({ type: String })
  history?: string;
}

// Réglages du site public (ARCHITECTURE.md, section 1.8) : un seul document,
// créé au premier enregistrement. Un champ vide n'est pas stocké.
@Schema({ collection: 'site_settings', timestamps: true })
export class SiteSettings {
  @Prop({ type: String })
  _id: string;

  @Prop({ type: SchemaFactory.createForClass(SocialLinks) })
  social?: SocialLinks;

  @Prop({ type: SchemaFactory.createForClass(ClubFacts) })
  club?: ClubFacts;

  @Prop({ type: FaqAnswersSchema })
  faq?: FaqAnswers;

  // Histoire du club, paragraphes séparés par une ligne vide (fonctionnalité 015).
  @Prop({ type: String })
  history?: string;

  @Prop({ type: SitePhotosSchema })
  photos?: SitePhotos;

  @Prop({ type: SchemaFactory.createForClass(SiteSettingsEn) })
  en?: SiteSettingsEn;

  updatedAt?: Date;
}

export const SiteSettingsSchema = SchemaFactory.createForClass(SiteSettings);
