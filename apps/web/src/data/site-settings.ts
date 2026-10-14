import { apiGet } from "@/lib/api";
import { toParagraphs } from "@/lib/paragraphs";
import type { FaqQuestionId, SitePhotoSlot, SiteSettings } from "@/types/site-settings";
import { currentLang } from "@/lib/current-lang";
import type { Lang } from "@/lib/locale";
import { pick, picker } from "./localize";
import { toPhoto, type ApiImage } from "./media";

// Seule porte des réglages du site (ARCHITECTURE.md, section 10). Si la
// lecture échoue, l'état vide : chaque page garde ses emplacements et ses
// replis, rien n'est inventé.

interface ApiSiteSettings {
  social: SiteSettings["social"];
  club: SiteSettings["club"];
  faq: Partial<Record<FaqQuestionId, string>>;
  photos: Partial<Record<SitePhotoSlot, ApiImage>>;
  history?: string;
  en?: {
    club?: { sponsorClub?: string; meetingPlace?: string; meetingRhythm?: string };
    faq?: Partial<Record<FaqQuestionId, string>>;
    history?: string;
  };
}

function paragraphsOf(answers: Partial<Record<FaqQuestionId, string>> | undefined) {
  const result: SiteSettings["faq"] = {};
  for (const [id, text] of Object.entries(answers ?? {}) as [FaqQuestionId, string][]) {
    const paragraphs = toParagraphs(text);
    if (paragraphs.length > 0) result[id] = paragraphs;
  }
  return result;
}

const EMPTY: SiteSettings = { social: {}, club: {}, faq: {}, faqEn: {}, photos: {} };

/** forLang : hors d'une page (images de partage), next/root-params n'existe pas. */
export async function getSiteSettings(forLang?: Lang): Promise<SiteSettings> {
  let settings: ApiSiteSettings;
  try {
    settings = await apiGet<ApiSiteSettings>("/site-settings");
  } catch {
    return EMPTY;
  }

  const lang = forLang ?? (await currentLang());
  const { french, take } = picker<"sponsorClub" | "meetingPlace" | "meetingRhythm">(lang);
  const enClub = settings.en?.club;
  const club: SiteSettings["club"] = {
    ...settings.club,
    sponsorClub: take("sponsorClub", settings.club.sponsorClub, enClub?.sponsorClub),
    meetingPlace: take("meetingPlace", settings.club.meetingPlace, enClub?.meetingPlace),
    meetingRhythm: take("meetingRhythm", settings.club.meetingRhythm, enClub?.meetingRhythm),
  };

  // Histoire du club (fonctionnalité 015) : absente si le français l'est.
  const history = pick(settings.history, settings.en?.history, lang);
  const historyParagraphs = toParagraphs(history.value);

  const photos: SiteSettings["photos"] = {};
  for (const [slot, image] of Object.entries(settings.photos) as [SitePhotoSlot, ApiImage][]) {
    photos[slot] = toPhoto(image, lang);
  }

  return {
    social: settings.social,
    club,
    ...(Object.keys(french).length ? { clubFrench: french } : {}),
    faq: paragraphsOf(settings.faq),
    faqEn: paragraphsOf(settings.en?.faq),
    ...(historyParagraphs.length > 0
      ? { history: historyParagraphs, ...(history.french ? { historyFrench: true as const } : {}) }
      : {}),
    photos,
  };
}
