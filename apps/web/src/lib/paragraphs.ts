/**
 * Découpe un texte en paragraphes, séparés par une ou plusieurs lignes vides.
 * Un texte absent ne donne aucun paragraphe.
 */
export function toParagraphs(text: string | undefined): string[] {
  return (text ?? "")
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}
