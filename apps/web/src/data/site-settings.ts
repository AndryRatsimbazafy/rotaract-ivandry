import { apiGet } from "@/lib/api";
import { toParagraphs } from "@/lib/paragraphs";
import type { FaqQuestionId, SitePhotoSlot, SiteSettings } from "@/types/site-settings";
import { toPhoto, type ApiImage } from "./media";

// Seule porte des réglages du site (ARCHITECTURE.md, section 10). Si la
// lecture échoue, l'état vide : chaque page garde ses emplacements et ses
// replis, rien n'est inventé.

interface ApiSiteSettings {
  social: SiteSettings["social"];
  club: SiteSettings["club"];
  faq: Partial<Record<FaqQuestionId, string>>;
  photos: Partial<Record<SitePhotoSlot, ApiImage>>;
}

const EMPTY: SiteSettings = { social: {}, club: {}, faq: {}, photos: {} };

export async function getSiteSettings(): Promise<SiteSettings> {
  let settings: ApiSiteSettings;
  try {
    settings = await apiGet<ApiSiteSettings>("/site-settings");
  } catch {
    return EMPTY;
  }

  const faq: SiteSettings["faq"] = {};
  for (const [id, text] of Object.entries(settings.faq) as [FaqQuestionId, string][]) {
    const paragraphs = toParagraphs(text);
    if (paragraphs.length > 0) faq[id] = paragraphs;
  }

  const photos: SiteSettings["photos"] = {};
  for (const [slot, image] of Object.entries(settings.photos) as [SitePhotoSlot, ApiImage][]) {
    photos[slot] = toPhoto(image);
  }

  return { social: settings.social, club: settings.club, faq, photos };
}
