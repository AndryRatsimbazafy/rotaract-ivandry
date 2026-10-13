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

/**
 * Extrait pour une description de page : le texte entier s'il est court,
 * sinon coupé sur un mot, suivi de « … ».
 */
export function toExcerpt(text: string | undefined, max = 160): string | undefined {
  const clean = (text ?? "").replace(/\s+/g, " ").trim();
  if (!clean) return undefined;
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max - 1);
  const lastSpace = cut.lastIndexOf(" ");
  return `${(lastSpace > 0 ? cut.slice(0, lastSpace) : cut).replace(/[\s,;:.]+$/, "")}…`;
}
