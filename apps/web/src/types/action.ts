import type { Photo } from "./media";
import type { RotaryYear } from "./rotary-year";

/** Fiche d'impact : seules les rubriques renseignées sont affichées. */
export interface ActionImpact {
  objective?: string;
  beneficiaries?: string;
  location?: string;
  period?: string;
  partners?: string[];
  results?: string;
}

/** Projet ou activité du club avec un objectif ou un impact concret. */
export interface Action {
  id: string;
  slug: string;
  title: string;
  summary?: string;
  /** Description longue, un paragraphe par élément. */
  description?: string[];
  /** Date de l'action, au format ISO 8601. Elle n'est pas affichée. */
  date: string;
  /** Année choisie par le club pour cette action, jamais déduite de la date. */
  rotaryYear: RotaryYear;
  /** Domaines d'action du Rotary : aucun, un ou plusieurs. */
  focusAreas: string[];
  /** Toujours vide tant que l'API ne fournit pas de photographie. */
  photos: Photo[];
  impact?: ActionImpact;
}
