"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { apiWrite } from "@/lib/api";
import { goneToList, remove, setPublished, SLUG_TAKEN } from "@/lib/content-actions";
import { madagascarInputToIso } from "@/lib/dates";
import { failure } from "@/lib/form-errors";
import {
  formValues,
  text,
  type ActionResult,
  type FormState,
} from "@/lib/form-state";
import { safeReturnPath, withNotice } from "@/lib/navigation";

const BASE = "/actualites";
const API = "/admin/news";
// Message de l'API pour ce champ (contrat 006).
const DATE_MESSAGE = "La date doit être au format ISO 8601.";
const OPTIONAL = ["location", "summary", "content"] as const;

export async function createNews(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  const values = formValues(formData);
  const returnTo = safeReturnPath(formData.get("retour"), BASE);
  // Saisie en heure de Madagascar, envoyée en temps universel.
  const date = madagascarInputToIso(text(formData, "date"));
  if (!date) {
    return { fieldErrors: { date: DATE_MESSAGE }, values };
  }
  const body: Record<string, unknown> = {
    title: text(formData, "title"),
    type: text(formData, "type"),
    date,
    rotaryYear: text(formData, "rotaryYear"),
  };
  for (const key of ["slug", ...OPTIONAL]) {
    const value = text(formData, key);
    if (value) {
      body[key] = value;
    }
  }
  if (formData.get("isPublished") === "true") {
    body.isPublished = true;
  }
  try {
    await apiWrite(API, "POST", body);
  } catch (error) {
    return failure(error, values, SLUG_TAKEN);
  }
  revalidatePath(BASE, "layout");
  redirect(withNotice(returnTo, "cree"));
}

export async function updateNews(
  id: string,
  originalSlug: string,
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  const values = formValues(formData);
  const returnTo = safeReturnPath(formData.get("retour"), BASE);
  const date = madagascarInputToIso(text(formData, "date"));
  if (!date) {
    return { fieldErrors: { date: DATE_MESSAGE }, values };
  }
  const body: Record<string, unknown> = {
    title: text(formData, "title"),
    type: text(formData, "type"),
    date,
    rotaryYear: text(formData, "rotaryYear"),
    isPublished: formData.get("isPublished") === "true",
  };
  // Un champ vidé est effacé : null, jamais une chaîne vide.
  for (const key of OPTIONAL) {
    body[key] = text(formData, key) || null;
  }
  const slug = text(formData, "slug");
  if (slug && slug !== originalSlug) {
    body.slug = slug;
  }
  try {
    await apiWrite(`${API}/${id}`, "PATCH", body);
  } catch (error) {
    goneToList(error, BASE, returnTo);
    return failure(error, values, SLUG_TAKEN);
  }
  revalidatePath(BASE, "layout");
  redirect(withNotice(returnTo, "modifie"));
}

export async function setNewsPublished(
  id: string,
  isPublished: boolean,
  returnTo: string,
): Promise<ActionResult> {
  return setPublished(BASE, API, id, isPublished, returnTo);
}

export async function deleteNews(
  id: string,
  returnTo: string,
): Promise<ActionResult> {
  return remove(BASE, API, id, returnTo);
}
