import { currentLang } from "@/lib/current-lang";
import { contentFor, type Content } from "./dictionaries";

export { contentFor, type Content };

/** Dictionnaire de la page en cours (composants serveur seulement). */
export async function getContent(): Promise<Content> {
  return contentFor(await currentLang());
}
