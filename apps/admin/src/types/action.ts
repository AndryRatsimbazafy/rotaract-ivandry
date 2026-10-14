import type { AdminImage } from "./media";
import type { YearRef } from "./rotary-year";

export type FocusArea =
  | "paix"
  | "maladies"
  | "eau"
  | "sante"
  | "education"
  | "economie"
  | "environnement";

export type ActionImpact = {
  objective?: string;
  beneficiaries?: string;
  location?: string;
  period?: string;
  partners?: string[];
  results?: string;
};

// Traduction anglaise facultative (fonctionnalité 014).
export type ActionEn = {
  title?: string;
  summary?: string;
  description?: string;
  impact?: Omit<ActionImpact, "partners">;
};

export type Action = {
  id: string;
  title: string;
  slug: string;
  summary: string | null;
  description: string | null;
  date: string;
  rotaryYear: YearRef;
  focusAreas: FocusArea[];
  impact?: ActionImpact;
  en?: ActionEn;
  isPublished: boolean;
  publishedAt: string | null;
  order: number | null;
  // Action marquante de la frise du club (fonctionnalité 015).
  highlighted: boolean;
  photos: AdminImage[];
  createdAt: string;
  updatedAt: string;
};
