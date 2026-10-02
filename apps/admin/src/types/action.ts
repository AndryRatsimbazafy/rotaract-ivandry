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
  isPublished: boolean;
  publishedAt: string | null;
  order: number | null;
  createdAt: string;
  updatedAt: string;
};
