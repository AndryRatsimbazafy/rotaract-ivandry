export const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;
export const SLUG_MAX_LENGTH = 120;

// Tire un slug d'un texte : sans accents, en minuscules, mots séparés par des
// tirets. Renvoie une chaîne vide si le texte ne contient ni lettre ni chiffre.
export function slugify(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, SLUG_MAX_LENGTH)
    .replace(/-+$/, '');
}

// « base-2 », « base-3 »… en raccourcissant la base pour tenir dans la limite.
export function withSlugSuffix(base: string, suffix: number): string {
  const ending = `-${suffix}`;
  return (
    base.slice(0, SLUG_MAX_LENGTH - ending.length).replace(/-+$/, '') + ending
  );
}
