import type { AdminImage } from "./media";
import type { YearRef } from "./rotary-year";

export type NewsType =
  | "evenement"
  | "participation"
  | "reunion"
  | "formation"
  | "annonce";

// Traduction anglaise facultative (fonctionnalité 014).
export type NewsEn = {
  title?: string;
  summary?: string;
  content?: string;
  location?: string;
};

export type News = {
  id: string;
  title: string;
  slug: string;
  type: NewsType;
  date: string;
  rotaryYear: YearRef;
  location: string | null;
  summary: string | null;
  content: string | null;
  en?: NewsEn;
  isPublished: boolean;
  publishedAt: string | null;
  photos: AdminImage[];
  createdAt: string;
  updatedAt: string;
};
