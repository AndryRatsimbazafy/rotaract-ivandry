import type { AdminImage } from "./media";

// Réglages du site public (contracts/api-site-settings.md). Listes fermées,
// identiques à celles de l'API.
export type SitePhotoSlot =
  | "accueil-ouverture"
  | "accueil-club"
  | "accueil-rejoindre"
  | "actions-ouverture"
  | "actions-detail"
  | "membres-ouverture"
  | "rejoindre-ouverture";

export type FaqQuestionId =
  | "qui"
  | "rencontre"
  | "sympathisant"
  | "avant"
  | "membre"
  | "frequence";

export type SiteSettings = {
  social: { facebook?: string; instagram?: string };
  club: {
    foundedYear?: number;
    sponsorClub?: string;
    memberCount?: number;
    meetingPlace?: string;
    meetingRhythm?: string;
  };
  faq: Partial<Record<FaqQuestionId, string>>;
  photos: Partial<Record<SitePhotoSlot, AdminImage>>;
  // Traductions anglaises (fonctionnalité 014).
  en?: {
    club?: { sponsorClub?: string; meetingPlace?: string; meetingRhythm?: string };
    faq?: Partial<Record<FaqQuestionId, string>>;
  };
  updatedAt: string | null;
};
