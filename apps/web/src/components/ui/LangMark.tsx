import { getContent } from "@/content";
import styles from "./LangMark.module.css";

/**
 * Mention de langue (DESIGN.md, section 8) : sur une page anglaise, une fois
 * par bloc qui contient un passage en français.
 */
export async function LangMark({ show, className }: { show: boolean; className?: string }) {
  if (!show) return null;
  const { inFrench } = (await getContent()).common.chrome;
  return <p className={`label ${styles.mark}${className ? ` ${className}` : ""}`}>{inFrench}</p>;
}

/** Vrai si au moins un champ du contenu est affiché en français. */
export function hasFrench(french: object | undefined): boolean {
  return Boolean(french && Object.values(french).some(Boolean));
}

/** Attribut lang d'un passage : « fr » s'il est affiché en français sur une page anglaise. */
export function frenchLang(french: boolean | undefined): "fr" | undefined {
  return french ? "fr" : undefined;
}
