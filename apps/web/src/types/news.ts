import type { Photo } from "./media";
import type { RotaryYear } from "./rotary-year";

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
  /** Instant de l'actualité, au format ISO 8601. Seuls le jour et le mois sont affichés. */
  date: string;
  /** Année choisie par le club pour cette actualité, jamais déduite de la date. */
  rotaryYear: RotaryYear;
  location?: string;
  summary?: string;
  /** Texte complet, un paragraphe par élément. Sert au détail de l'actualité. */
  body?: string[];
  /** Toujours vide tant que l'API ne fournit pas de photographie. */
  photos: Photo[];
}
