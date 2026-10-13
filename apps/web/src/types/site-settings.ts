import type { Photo } from "./media";

/** Les six questions fréquentes de « Nous rejoindre » (id de content/join.ts). */
export type FaqQuestionId =
  | "qui"
  | "rencontre"
  | "sympathisant"
  | "avant"
  | "membre"
  | "frequence";

/** Les sept emplacements photographiques fixes du site. */
export type SitePhotoSlot =
  | "accueil-ouverture"
  | "accueil-club"
  | "accueil-rejoindre"
  | "actions-ouverture"
  | "actions-detail"
  | "membres-ouverture"
  | "rejoindre-ouverture";

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
  /** Réponses enregistrées, en paragraphes. */
  faq: Partial<Record<FaqQuestionId, string[]>>;
  photos: Partial<Record<SitePhotoSlot, Photo>>;
}
