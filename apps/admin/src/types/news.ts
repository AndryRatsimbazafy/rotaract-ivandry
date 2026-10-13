import type { AdminImage } from "./media";
import type { YearRef } from "./rotary-year";

export type NewsType =
  | "evenement"
  | "participation"
  | "reunion"
  | "formation"
  | "annonce";

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
  isPublished: boolean;
  publishedAt: string | null;
  photos: AdminImage[];
  createdAt: string;
  updatedAt: string;
};
