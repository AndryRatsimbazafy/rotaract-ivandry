import type { Content } from "@/content";
import { pageShareImage, shareMetadata } from "@/lib/share-page";

const title = (content: Content) => content.pages.clubPage.title;

export const generateImageMetadata = shareMetadata(title);
// Même repli que l'ouverture de la page (FR-026).
export default pageShareImage(title, ["club-ouverture", "accueil-club"]);

// Recomposée au plus toutes les 60 secondes, comme les pages (décision 20).
export const revalidate = 60;
