import type { GalleryLabels, GalleryPhoto } from "@/components/media/PhotoGallery";
import { getContent } from "@/content";
import type { Photo } from "@/types/media";

/**
 * Données de la galerie d'une page de détail (fonctionnalité 015) : les textes
 * qui dépendent de la langue sont résolus ici, sur le serveur.
 */
export async function galleryProps(
  photos: Photo[],
  title: string,
): Promise<{ photos: GalleryPhoto[]; labels: GalleryLabels; }> {
  const { chrome } = (await getContent()).common;
  return {
    photos: photos.map((photo) => ({
      src: photo.src,
      width: photo.width,
      height: photo.height,
      alt: photo.alt,
      caption: photo.caption,
      credit: photo.credit ? chrome.photoCredit(photo.credit) : undefined,
      altLang: photo.french?.alt ? "fr" : undefined,
      captionLang: photo.french?.caption ? "fr" : undefined,
    })),
    labels: {
      dialog: chrome.gallery.dialog(title),
      previous: chrome.gallery.previous,
      next: chrome.gallery.next,
      close: chrome.gallery.close,
      announce: chrome.gallery.announce,
    },
  };
}
