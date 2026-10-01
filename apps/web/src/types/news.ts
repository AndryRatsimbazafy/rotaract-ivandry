import type { Photo } from "./media";

export type NewsType =
  | "evenement"
  | "participation"
  | "reunion"
  | "formation"
  | "annonce";

/** Événement, participation, réunion, formation ou actualité du club. */
export interface NewsItem {
  id: string;
  slug: string;
  title: string;
  type: NewsType;
  /** Date au format ISO 8601. */
  date: string;
  location?: string;
  summary?: string;
  /** Texte complet, un paragraphe par élément. Sert au détail de l'actualité. */
  body?: string[];
  photos: Photo[];
}
