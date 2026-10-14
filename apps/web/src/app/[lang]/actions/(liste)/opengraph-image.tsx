import type { Content } from "@/content";
import { pageShareImage, shareMetadata } from "@/lib/share-page";

const title = (content: Content) => content.pages.actionsPage.title;

export const generateImageMetadata = shareMetadata(title);
export default pageShareImage(title, ["actions-ouverture"]);

// Recomposée au plus toutes les 60 secondes, comme les pages (décision 20).
export const revalidate = 60;
