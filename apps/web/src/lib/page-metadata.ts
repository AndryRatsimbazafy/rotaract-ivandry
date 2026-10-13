import type { Metadata } from "next";
import { getContent, type Content } from "@/content";
import { localize } from "./locale";

/**
 * Les deux versions d'une page pour les moteurs de recherche : la française
 * (aussi par défaut) et l'anglaise. path : l'adresse française.
 */
export function languageAlternates(path: string): NonNullable<Metadata["alternates"]> {
  return {
    languages: { fr: path, en: localize(path, "en"), "x-default": path },
  };
}

type PageKey = keyof Content["pages"];

/** Métadonnées d'une page fixe : titre et description du dictionnaire. */
export async function staticPageMetadata(page: PageKey, path: string): Promise<Metadata> {
  const { title, description } = (await getContent()).pages[page];
  return { title, description, alternates: languageAlternates(path) };
}
