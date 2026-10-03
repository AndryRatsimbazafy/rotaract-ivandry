// Client de l'API, côté serveur uniquement : le navigateur ne connaît pas
// l'adresse de l'API et ne l'appelle jamais.

// Revalidation par durée, en secondes. C'est un objectif de fraîcheur
// d'environ une minute, pas une garantie à la seconde près : une fois ce délai
// passé, la visite suivante reçoit encore la réponse en cache et déclenche la
// relecture. Seule une réponse correcte remplace une entrée du cache : une
// relecture qui échoue ne vide donc pas un contenu déjà lu.
const REVALIDATE_SECONDS = 60;
const TIMEOUT_MS = 10_000;
const PAGE_SIZE = 100;

type Params = Record<string, string | number | undefined>;

export function apiUrl(path: string, params: Params = {}): string {
  const base = process.env.API_URL;
  if (!base) {
    throw new Error("API_URL est obligatoire (apps/web/.env.local).");
  }
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") {
      search.set(key, String(value));
    }
  }
  const query = search.toString();
  return `${base.replace(/\/+$/, "")}${path}${query ? `?${query}` : ""}`;
}

// Lecture publique. Toute réponse autre que 200 lève une erreur : elle n'est
// alors pas mise en cache.
export async function apiGet<T>(path: string, params?: Params): Promise<T> {
  const response = await fetch(apiUrl(path, params), {
    next: { revalidate: REVALIDATE_SECONDS },
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (response.status !== 200) {
    throw new Error(`Lecture refusée (${response.status}).`);
  }
  return (await response.json()) as T;
}

type Page<T> = {
  data: T[];
  meta: { page: number; limit: number; total: number; totalPages: number };
};

export type FullList<T> = {
  items: T[];
  // Nombre total d'éléments selon l'API, que la liste soit complète ou non.
  total: number;
  // Faux quand une page suivante n'a pas pu être lue : la liste n'est alors
  // jamais présentée comme complète.
  complete: boolean;
};

// Liste paginée lue en entier : la première page, puis les suivantes en
// parallèle, assemblées dans l'ordre de l'API. Chaque page est une lecture à
// part, avec sa propre entrée de cache. Si la première page échoue, l'erreur
// est levée ; si une page suivante échoue, les pages lues sont renvoyées.
export async function apiGetAll<T>(
  path: string,
  params: Params = {},
): Promise<FullList<T>> {
  const read = (page: number) =>
    apiGet<Page<T>>(path, { ...params, limit: PAGE_SIZE, page });

  const first = await read(1);
  const { total, totalPages } = first.meta;
  if (totalPages <= 1) {
    return { items: first.data, total, complete: true };
  }

  const rest = await Promise.allSettled(
    Array.from({ length: totalPages - 1 }, (_, index) => read(index + 2)),
  );
  const items = [...first.data];
  let complete = true;
  for (const page of rest) {
    if (page.status === "fulfilled") {
      items.push(...page.value.data);
    } else {
      complete = false;
    }
  }
  return { items, total, complete };
}
