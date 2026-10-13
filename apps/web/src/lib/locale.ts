// Deux langues (fonctionnalité 014). Utilisable côté client ; la langue de
// la page côté serveur : lib/current-lang.ts. L'adresse anglaise est l'adresse
// française précédée de /en ; les mots des rubriques restent français.

export const LANGS = ["fr", "en"] as const;
export type Lang = (typeof LANGS)[number];

export function isLang(value: string): value is Lang {
  return (LANGS as readonly string[]).includes(value);
}

/** Lien interne dans la langue donnée : préfixe /en en anglais, rien en français. */
export function localize(href: string, target: Lang): string {
  if (target === "fr" || !href.startsWith("/") || langOf(href.split(/[?#]/)[0]) === "en") return href;
  return href === "/" ? "/en" : href.startsWith("/?") || href.startsWith("/#") ? `/en${href.slice(1)}` : `/en${href}`;
}

/** Retire le préfixe /en d'une adresse : l'adresse française correspondante. */
export function stripLang(pathname: string): string {
  if (pathname === "/en") return "/";
  return pathname.startsWith("/en/") ? pathname.slice(3) : pathname;
}

/** La même page dans l'autre langue (sélecteur). */
export function switchLanguage(pathname: string, search: string, target: Lang): string {
  const french = stripLang(pathname);
  return `${localize(french, target)}${search ? `?${search.replace(/^\?/, "")}` : ""}`;
}

/** Langue d'une adresse affichée (composants client) : /en… ou le français. */
export function langOf(pathname: string): Lang {
  return pathname === "/en" || pathname.startsWith("/en/") ? "en" : "fr";
}
