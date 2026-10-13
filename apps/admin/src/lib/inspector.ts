import { redirect } from "next/navigation";
import {
  ApiError,
  FORBIDDEN_PATH,
  SESSION_END_PATH,
  apiRaw,
  isNotFound,
  toApiError,
} from "./api";
import { param, type SearchParams } from "./navigation";

// Lecture de la fiche montrée dans l'aperçu d'une liste. Contrairement à
// apiRead, une fiche introuvable ne remplace pas la page : l'aperçu le dit.
export type Inspected<T> =
  | { status: "ok"; data: T }
  | { status: "not-found" }
  | { status: "error" };

export async function readInspected<T>(path: string): Promise<Inspected<T>> {
  let error: ApiError;
  try {
    const response = await apiRaw(path);
    if (response.ok) {
      return { status: "ok", data: (await response.json()) as T };
    }
    error = await toApiError(response);
  } catch {
    return { status: "error" };
  }
  if (error.status === 401) {
    redirect(SESSION_END_PATH);
  }
  if (error.status === 403) {
    redirect(FORBIDDEN_PATH);
  }
  return isNotFound(error) ? { status: "not-found" } : { status: "error" };
}

// Ligne choisie, seulement si elle fait partie des lignes affichées.
export function pickSelection(params: SearchParams, ids: string[]): string | null {
  const id = param(params, "selection");
  return id && ids.includes(id) ? id : null;
}
