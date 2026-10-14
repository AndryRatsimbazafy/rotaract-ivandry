import type { Photo } from "./media";

/** Les six questions fréquentes de « Nous rejoindre » (id de content/join.ts). */
export type FaqQuestionId =
  | "qui"
  | "rencontre"
  | "sympathisant"
  | "avant"
  | "membre"
  | "frequence";

/** Les huit emplacements photographiques fixes du site (club-ouverture : 015). */
export type SitePhotoSlot =
  | "accueil-ouverture"
  | "accueil-club"
  | "accueil-rejoindre"
  | "actions-ouverture"
  | "actions-detail"
  | "membres-ouverture"
  | "rejoindre-ouverture"
  | "club-ouverture";

/** Informations du club saisies dans le Back Office ; chacune facultative. */
export interface ClubFacts {
  foundedYear?: number;
  sponsorClub?: string;
  memberCount?: number;
  meetingPlace?: string;
  meetingRhythm?: string;
}

/** Réglages du site. Un réglage absent laisse la page dans son état d'origine. */
export interface SiteSettings {
  social: { facebook?: string; instagram?: string };
  club: ClubFacts;
  /** Informations textuelles du club affichées en français sur une page anglaise (014). */
  clubFrench?: Partial<Record<"sponsorClub" | "meetingPlace" | "meetingRhythm", true>>;
  /** Réponses enregistrées en français, en paragraphes. */
  faq: Partial<Record<FaqQuestionId, string[]>>;
  /** Réponses enregistrées en anglais, en paragraphes (fonctionnalité 014). */
  faqEn: Partial<Record<FaqQuestionId, string[]>>;
  /** Histoire du club, en paragraphes, dans la langue de la page (fonctionnalité 015). */
  history?: string[];
  /** Vrai quand une page anglaise affiche l'histoire en français. */
  historyFrench?: true;
  photos: Partial<Record<SitePhotoSlot, Photo>>;
}
