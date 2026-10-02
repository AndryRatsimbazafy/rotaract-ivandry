import { redirect } from "next/navigation";
import { ApiError, apiRead, queryString } from "./api";
import type { Paginated } from "@/types/api";

type Params = Record<string, string | number | undefined>;

// Lecture d'une liste paginée. Un paramètre refusé par l'API (recherche trop
// courte, par exemple) est signalé par son message, et la liste est relue
// sans lui : elle reste affichée.
export async function readList<T>(
  path: string,
  params: Params,
): Promise<{ list: Paginated<T>; errors: string[] }> {
  try {
    return { list: await apiRead(`${path}${queryString(params)}`), errors: [] };
  } catch (error) {
    if (error instanceof ApiError && error.status === 400 && error.details?.length) {
      const kept = { ...params };
      for (const { field } of error.details) {
        delete kept[field];
      }
      return {
        list: await apiRead(`${path}${queryString(kept)}`),
        errors: error.details.map(({ message }) => message),
      };
    }
    throw error;
  }
}

// Une page au-delà de la dernière est ramenée à la dernière.
export function clampPage(
  list: Paginated<unknown>,
  pathname: string,
  search: URLSearchParams,
): void {
  const { page, totalPages } = list.meta;
  if (totalPages > 0 && page > totalPages) {
    const next = new URLSearchParams(search);
    next.set("page", String(totalPages));
    redirect(`${pathname}?${next.toString()}`);
  }
}

export function toSearch(params: Record<string, string>): URLSearchParams {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value) {
      search.set(key, value);
    }
  }
  return search;
}
