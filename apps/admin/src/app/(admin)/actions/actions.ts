"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { apiWrite } from "@/lib/api";
import { goneToList, remove, setPublished, SLUG_TAKEN } from "@/lib/content-actions";
import { failure } from "@/lib/form-errors";
import {
  formValues,
  text,
  type ActionResult,
  type FormState,
} from "@/lib/form-state";
import { safeReturnPath, withNotice } from "@/lib/navigation";

const BASE = "/actions";
const API = "/admin/actions";
const IMPACT_TEXTS = [
  "objective",
  "beneficiaries",
  "location",
  "period",
  "results",
] as const;

// Seules les rubriques renseignées sont envoyées : aucune n'est estimée ni
// remplacée par un texte d'attente.
// Traduction anglaise (fonctionnalité 014) : champs remplis seulement ; null
// s'il n'y en a aucun, ce qui retire la traduction.
function enOf(formData: FormData): Record<string, unknown> | null {
  const en: Record<string, unknown> = {};
  for (const key of ["title", "summary", "description"]) {
    const value = text(formData, `en.${key}`);
    if (value) en[key] = value;
  }
  const impact: Record<string, string> = {};
  for (const key of IMPACT_TEXTS) {
    const value = text(formData, `en.impact.${key}`);
    if (value) impact[key] = value;
  }
  if (Object.keys(impact).length) en.impact = impact;
  return Object.keys(en).length ? en : null;
}

function impactOf(formData: FormData): Record<string, string | string[]> | null {
  const impact: Record<string, string | string[]> = {};
  for (const key of IMPACT_TEXTS) {
    const value = text(formData, `impact.${key}`);
    if (value) {
      impact[key] = value;
    }
  }
  const partners = text(formData, "impact.partners")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  if (partners.length) {
    impact.partners = partners;
  }
  return Object.keys(impact).length ? impact : null;
}

// Un entier est envoyé comme nombre ; toute autre saisie est laissée à l'API,
// qui la refuse avec son message.
function orderOf(raw: string): number | string {
  return /^-?\d+$/.test(raw) ? Number(raw) : raw;
}

export async function createAction(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  const values = formValues(formData, ["focusAreas"]);
  const returnTo = safeReturnPath(formData.get("retour"), BASE);
  const body: Record<string, unknown> = {
    title: text(formData, "title"),
    date: text(formData, "date"),
    rotaryYear: text(formData, "rotaryYear"),
  };
  for (const key of ["slug", "summary", "description"]) {
    const value = text(formData, key);
    if (value) {
      body[key] = value;
    }
  }
  if ((values.focusAreas as string[]).length) {
    body.focusAreas = values.focusAreas;
  }
  const impact = impactOf(formData);
  if (impact) {
    body.impact = impact;
  }
  const en = enOf(formData);
  if (en) {
    body.en = en;
  }
  if (formData.get("isPublished") === "true") {
    body.isPublished = true;
  }
  if (formData.get("highlighted") === "true") {
    body.highlighted = true;
  }
  const order = text(formData, "order");
  if (order) {
    body.order = orderOf(order);
  }
  try {
    await apiWrite(API, "POST", body);
  } catch (error) {
    return failure(error, values, SLUG_TAKEN);
  }
  revalidatePath(BASE, "layout");
  redirect(withNotice(returnTo, "cree"));
}

export async function updateAction(
  id: string,
  originalSlug: string,
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  const values = formValues(formData, ["focusAreas"]);
  const returnTo = safeReturnPath(formData.get("retour"), BASE);
  const order = text(formData, "order");
  const body: Record<string, unknown> = {
    title: text(formData, "title"),
    date: text(formData, "date"),
    rotaryYear: text(formData, "rotaryYear"),
    // Un champ vidé est effacé : null, jamais une chaîne vide.
    summary: text(formData, "summary") || null,
    description: text(formData, "description") || null,
    focusAreas: values.focusAreas,
    impact: impactOf(formData),
    en: enOf(formData),
    isPublished: formData.get("isPublished") === "true",
    highlighted: formData.get("highlighted") === "true",
    order: order ? orderOf(order) : null,
  };
  // Le slug n'est envoyé que s'il a changé.
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

export async function setActionPublished(
  id: string,
  isPublished: boolean,
  returnTo: string,
): Promise<ActionResult> {
  return setPublished(BASE, API, id, isPublished, returnTo);
}

export async function deleteAction(
  id: string,
  returnTo: string,
): Promise<ActionResult> {
  return remove(BASE, API, id, returnTo);
}
