import { homeTitle, pageShareImage, shareMetadata } from "@/lib/share-page";

// Image de partage de l'accueil, et repli des pages sans image propre (015).
export const generateImageMetadata = shareMetadata(homeTitle);
export default pageShareImage(homeTitle);

// Recomposée au plus toutes les 60 secondes, comme les pages (décision 20).
export const revalidate = 60;
