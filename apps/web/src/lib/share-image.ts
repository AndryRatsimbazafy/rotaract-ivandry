import type { Metadata } from "next";
import { getSiteSettings } from "@/data/site-settings";
import type { Photo } from "@/types/media";

type OpenGraphImages = NonNullable<Metadata["openGraph"]>["images"];

/**
 * Image de partage d'un contenu : sa photographie principale, à défaut
 * l'ouverture de l'accueil saisie dans le Back Office. Seules des adresses
 * absolues : la photographie livrée avec le site attend l'adresse publique.
 */
export async function shareImages(photo: Photo | undefined): Promise<OpenGraphImages> {
  const image = photo ?? (await getSiteSettings()).photos["accueil-ouverture"];
  if (!image) return undefined;
  return [{ url: image.src, width: image.width, height: image.height, alt: image.alt }];
}
