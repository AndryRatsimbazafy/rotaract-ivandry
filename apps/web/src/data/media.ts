import type { Lang } from "@/lib/locale";
import type { Photo } from "@/types/media";
import { pick } from "./localize";

// Forme publique d'une image dans l'API : ce qu'il faut pour l'afficher.
export interface ApiImage {
  url: string;
  width: number;
  height: number;
  alt: string;
  caption?: string;
  credit?: string;
  altEn?: string;
  captionEn?: string;
  focus: string;
}

// L'adresse devient src (ARCHITECTURE.md, section 10) ; le texte alternatif
// et la légende suivent la langue de la page (fonctionnalité 014).
export function toPhoto(image: ApiImage, lang: Lang = "fr"): Photo {
  const alt = pick(image.alt, image.altEn, lang);
  const caption = pick(image.caption, image.captionEn, lang);
  const french = {
    ...(alt.french ? { alt: true as const } : {}),
    ...(caption.french ? { caption: true as const } : {}),
  };
  return {
    src: image.url,
    width: image.width,
    height: image.height,
    alt: alt.value ?? image.alt,
    caption: caption.value,
    credit: image.credit,
    focus: image.focus,
    ...(Object.keys(french).length ? { french } : {}),
  };
}
