import { notFound, redirect } from "next/navigation";
import type { ApiErrorBody, ApiErrorDetail } from "@/types/api";
import { clearSession, getSessionToken } from "./session";

// Client de l'API, côté serveur uniquement : le navigateur ne connaît ni
// l'adresse de l'API ni le jeton.

const TIMEOUT_MS = 15_000;
export const GENERIC_ERROR = "Une erreur est survenue. Réessayez.";
const INVALID_ID = "Identifiant invalide.";

export const SESSION_END_PATH = "/session/fin?motif=expiree";
export const LOGIN_EXPIRED_PATH = "/connexion?motif=expiree";
export const FORBIDDEN_PATH = "/acces-refuse";

// Seule forme d'erreur. status 0 : l'API n'a pas répondu.
export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
    readonly details?: ApiErrorDetail[],
  ) {
    super(message);
  }
}

type Method = "GET" | "POST" | "PATCH" | "PUT" | "DELETE";

function baseUrl(): string {
  const url = process.env.API_URL;
  if (!url) {
    throw new Error("API_URL est obligatoire (apps/admin/.env.local).");
  }
  return url.replace(/\/+$/, "");
}

// Réponse brute de l'API. Lève ApiError(0) si elle ne répond pas.
export async function apiRaw(
  path: string,
  method: Method = "GET",
  body?: unknown,
): Promise<Response> {
  const token = await getSessionToken();
  const url = `${baseUrl()}${path}`;
  try {
    return await fetch(url, {
      method,
      cache: "no-store",
      signal: AbortSignal.timeout(TIMEOUT_MS),
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(body === undefined ? {} : { "Content-Type": "application/json" }),
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new ApiError(0, GENERIC_ERROR);
  }
}

export async function toApiError(response: Response): Promise<ApiError> {
  try {
    const body = (await response.json()) as Partial<ApiErrorBody>;
    if (typeof body.message === "string") {
      return new ApiError(
        response.status,
        response.status >= 500 && response.status !== 503
          ? GENERIC_ERROR
          : body.message,
        body.details,
      );
    }
  } catch {
    // Corps illisible : message générique.
  }
  return new ApiError(response.status, GENERIC_ERROR);
}

async function request<T>(
  path: string,
  method: Method,
  body?: unknown,
): Promise<T> {
  const response = await apiRaw(path, method, body);
  if (!response.ok) {
    throw await toApiError(response);
  }
  if (response.status === 204) {
    return undefined as T;
  }
  try {
    return (await response.json()) as T;
  } catch {
    throw new ApiError(0, GENERIC_ERROR);
  }
}

export function isNotFound(error: ApiError): boolean {
  return (
    error.status === 404 ||
    (error.status === 400 && error.message === INVALID_ID)
  );
}

// Lecture, depuis un Server Component. Un cookie ne peut pas être effacé
// pendant un rendu : la fin de session passe par /session/fin.
export async function apiRead<T>(path: string): Promise<T> {
  try {
    return await request<T>(path, "GET");
  } catch (error) {
    if (error instanceof ApiError) {
      if (error.status === 401) {
        redirect(SESSION_END_PATH);
      }
      if (error.status === 403) {
        redirect(FORBIDDEN_PATH);
      }
      if (isNotFound(error)) {
        notFound();
      }
    }
    throw error;
  }
}

// Écriture, depuis une Server Action. Les autres erreurs reviennent à
// l'action, qui les rend à l'écran.
export async function apiWrite<T>(
  path: string,
  method: Exclude<Method, "GET">,
  body?: unknown,
): Promise<T> {
  try {
    return await request<T>(path, method, body);
  } catch (error) {
    if (error instanceof ApiError) {
      if (error.status === 401) {
        await clearSession();
        redirect(LOGIN_EXPIRED_PATH);
      }
      if (error.status === 403) {
        redirect(FORBIDDEN_PATH);
      }
    }
    throw error;
  }
}

// Appel sans traitement de session : la connexion.
export async function apiAnonymous<T>(
  path: string,
  method: Method,
  body?: unknown,
): Promise<T> {
  return request<T>(path, method, body);
}

export function queryString(
  params: Record<string, string | number | undefined>,
): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") {
      search.set(key, String(value));
    }
  }
  const text = search.toString();
  return text ? `?${text}` : "";
}
