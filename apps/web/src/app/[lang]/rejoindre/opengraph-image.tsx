import type { Content } from "@/content";
import { pageShareImage, shareMetadata } from "@/lib/share-page";

const title = (content: Content) => content.pages.joinPage.title;

export const generateImageMetadata = shareMetadata(title);
export default pageShareImage(title, ["rejoindre-ouverture"]);

// Recomposée au plus toutes les 60 secondes, comme les pages (décision 20).
export const revalidate = 60;
