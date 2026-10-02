// Adresse de retour vers une liste, avec son état (recherche, filtres, tri,
// page). Seule une adresse interne est acceptée.
export function safeReturnPath(value: unknown, fallback: string): string {
  return typeof value === "string" &&
    value.startsWith("/") &&
    !value.startsWith("//") &&
    !value.includes("\\")
    ? value
    : fallback;
}

export type NoticeCode =
  | "cree"
  | "modifie"
  | "supprime"
  | "publie"
  | "depublie"
  | "ordre"
  | "introuvable";

// Ajoute un avis (code d'une liste fermée) à une adresse.
export function withNotice(path: string, code: NoticeCode): string {
  const [pathname, query = ""] = path.split("?");
  const search = new URLSearchParams(query);
  search.set("avis", code);
  return `${pathname}?${search.toString()}`;
}

export type SearchParams = Record<string, string | string[] | undefined>;

export function param(params: SearchParams, key: string): string {
  const value = params[key];
  return (Array.isArray(value) ? value[0] : value)?.trim() ?? "";
}

// Adresse courante d'une liste, sans avis : sert de retour depuis une fiche.
export function listPath(pathname: string, params: SearchParams): string {
  const search = new URLSearchParams();
  for (const key of Object.keys(params)) {
    const value = param(params, key);
    if (value && key !== "avis") {
      search.set(key, value);
    }
  }
  const text = search.toString();
  return text ? `${pathname}?${text}` : pathname;
}
