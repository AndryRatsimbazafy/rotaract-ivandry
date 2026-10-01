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
  rotaryYear: RotaryYear;
  photos: Photo[];
  impact?: ActionImpact;
}
