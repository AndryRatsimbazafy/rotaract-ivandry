import { notFound } from "next/navigation";
import { contentFor, type Content } from "@/content";
import { site } from "@/config/site";
import { getSiteSettings } from "@/data/site-settings";
import { isLang, type Lang } from "@/lib/locale";
import type { Photo } from "@/types/media";
import type { SitePhotoSlot } from "@/types/site-settings";
import { renderShareImage, SHARE_CONTENT_TYPE, SHARE_SIZE, shareAlt } from "./share-image";

// Fabriques des fichiers opengraph-image.tsx (fonctionnalité 015) : chaque
// segment déclare son titre et sa photographie, la composition est commune.

type LangParams = { params: Promise<{ lang: string }> };

/**
 * Une seule image par page, avec son texte alternatif dans la langue de
 * l'adresse. Next.js l'appelle aussi pour lister les images : jamais de 404
 * ici, la fonction de l'image s'en charge.
 */
export function shareMetadata(title: (content: Content) => string) {
  return async ({ params }: { params: { lang?: string } | Promise<{ lang?: string }> }) => {
    const { lang } = await params;
    return [
      {
        id: "partage",
        alt: shareAlt(title(contentFor(lang && isLang(lang) ? lang : "fr"))),
        size: SHARE_SIZE,
        contentType: SHARE_CONTENT_TYPE,
      },
    ];
  };
}

/** Repli commun : l'ouverture de l'accueil, puis la photographie livrée avec le site. */
async function sitePhoto(slots: SitePhotoSlot[], lang: Lang): Promise<Photo | undefined> {
  const { photos } = await getSiteSettings(lang);
  for (const slot of [...slots, "accueil-ouverture" as const]) {
    if (photos[slot]) return photos[slot];
  }
  return undefined;
}

/** Image d'une page fixe : son titre, la photographie de son ouverture. */
export function pageShareImage(title: (content: Content) => string, slots: SitePhotoSlot[] = []) {
  return async function Image({ params }: LangParams) {
    const { lang } = await params;
    if (!isLang(lang)) notFound();
    return renderShareImage({ title: title(contentFor(lang)), photo: await sitePhoto(slots, lang) });
  };
}

/** Image d'un contenu : son titre résolu pour la langue, sa photographie principale. */
export async function contentShareImage(
  item: { title: string; photos: Photo[] } | null,
  lang: Lang,
): Promise<Response> {
  if (!item) notFound();
  return renderShareImage({ title: item.title, photo: item.photos[0] ?? (await sitePhoto([], lang)) });
}

/** Langue d'une route d'image : next/root-params n'y est pas disponible. */
export function langOrNotFound(value: string | undefined): Lang {
  if (!value || !isLang(value)) notFound();
  return value;
}

export const homeTitle = () => site.name;
