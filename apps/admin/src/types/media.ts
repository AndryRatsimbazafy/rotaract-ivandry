// Image d'un contenu, telle que la renvoient les lectures d'administration.
// Aucune référence de stockage : seulement l'adresse publique.
export type AdminImage = {
  id: string;
  url: string;
  width: number;
  height: number;
  alt: string;
  caption: string | null;
  credit: string | null;
  focus: string;
  name: string;
  mimeType: string;
  size: number;
};

// Largeurs conseillées par DESIGN.md (racine), section 7.
export const PORTRAIT_MIN_WIDTH = 1200;
export const PHOTO_MIN_WIDTH = 1600;

export const PHOTOS_MAX = 20;
