import { notFound } from "next/navigation";
import { lang } from "next/root-params";
import { isLang, type Lang } from "./locale";

/** Langue de la page en cours, lue dans l'adresse (composants serveur seulement). */
export async function currentLang(): Promise<Lang> {
  const value = await lang();
  if (!value || !isLang(value)) notFound();
  return value;
}
