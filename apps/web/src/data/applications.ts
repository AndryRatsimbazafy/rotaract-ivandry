"use server";

import { joinApplication } from "@/content/join";
import { apiUrl } from "@/lib/api";
import type { ApplicationField } from "@/types/application";

export type SubmissionResult =
  | { ok: true }
  // Refus qui désigne un ou plusieurs champs : un message par champ.
  | { ok: false; fieldErrors: Partial<Record<ApplicationField, string>> }
  // Refus d'ensemble : trop de demandes, ou service indisponible.
  | { ok: false; reason: "too-many" | "unavailable" };

// Les six champs du contrat de l'API, et aucun autre : elle refuse tout champ
// en plus.
const TEXT_FIELDS = [
  "firstName",
  "lastName",
  "email",
  "phone",
  "applicantStatus",
] as const;
const FIELDS: readonly string[] = [...TEXT_FIELDS, "cv"];

// L'API envoie ensuite le fichier au stockage : un CV volumineux peut demander
// plusieurs dizaines de secondes.
const TIMEOUT_MS = 60_000;

const UNAVAILABLE: SubmissionResult = { ok: false, reason: "unavailable" };

/**
 * Dépôt d'une candidature : le formulaire est relayé à l'API par le serveur du
 * site. Rien n'est conservé ni journalisé ici, et rien de la réponse de l'API
 * ne retourne au navigateur en dehors de ce résultat.
 */
export async function submitApplication(
  formData: FormData,
): Promise<SubmissionResult> {
  const body = new FormData();
  for (const field of TEXT_FIELDS) {
    const value = formData.get(field);
    if (typeof value === "string") body.append(field, value);
  }
  const cv = formData.get("cv");
  // Le fichier garde son nom et ses octets ; l'API constate son type.
  if (cv instanceof File) body.append("cv", cv, cv.name);

  let response: Response;
  try {
    response = await fetch(apiUrl("/applications"), {
      method: "POST",
      body,
      cache: "no-store",
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
  } catch {
    return UNAVAILABLE;
  }

  if (response.status === 201) return { ok: true };
  if (response.status === 413) {
    return { ok: false, fieldErrors: { cv: joinApplication.cvTooLarge } };
  }
  if (response.status === 415) {
    return { ok: false, fieldErrors: { cv: joinApplication.cvFormat } };
  }
  if (response.status === 429) return { ok: false, reason: "too-many" };
  if (response.status === 400) {
    const fieldErrors = await readFieldErrors(response);
    if (Object.keys(fieldErrors).length > 0) return { ok: false, fieldErrors };
  }

  return UNAVAILABLE;
}

/** Messages de validation de l'API, par champ du formulaire. */
async function readFieldErrors(
  response: Response,
): Promise<Partial<Record<ApplicationField, string>>> {
  const fieldErrors: Partial<Record<ApplicationField, string>> = {};
  try {
    const { details } = (await response.json()) as {
      details?: { field?: unknown; message?: unknown }[];
    };
    for (const { field, message } of details ?? []) {
      if (
        typeof field === "string" &&
        typeof message === "string" &&
        FIELDS.includes(field)
      ) {
        fieldErrors[field as ApplicationField] ??= message;
      }
    }
  } catch {
    // Corps illisible : aucun message par champ.
  }

  return fieldErrors;
}
