import type { Photo } from "@/types/media";

// Forme publique d'une image dans l'API : ce qu'il faut pour l'afficher.
export interface ApiImage {
  url: string;
  width: number;
  height: number;
  alt: string;
  caption?: string;
  credit?: string;
  focus: string;
}

// Seul renommage : l'adresse devient src (ARCHITECTURE.md, section 10).
export function toPhoto(image: ApiImage): Photo {
  return {
    src: image.url,
    width: image.width,
    height: image.height,
    alt: image.alt,
    caption: image.caption,
    credit: image.credit,
    focus: image.focus,
  };
}
