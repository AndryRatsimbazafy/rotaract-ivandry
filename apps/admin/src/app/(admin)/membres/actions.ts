"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ApiError, apiWrite, isNotFound } from "@/lib/api";
import { failure, failureMessage } from "@/lib/form-errors";
import {
  formValues,
  text,
  type ActionResult,
  type FormState,
} from "@/lib/form-state";
import { safeReturnPath, withNotice } from "@/lib/navigation";

const LIST = "/membres";
const MANDATE_EXISTS = "Ce membre a déjà un mandat pour cette année.";
const ORDER_CHANGED =
  "La liste a changé. Rechargez-la avant d'enregistrer l'ordre.";
const OPTIONAL = ["occupation", "email", "phone"] as const;

// Ressource supprimée entre-temps : retour à la liste, avec le message.
function goneToList(error: unknown, returnTo: string): void {
  if (error instanceof ApiError && isNotFound(error)) {
    revalidatePath(LIST, "layout");
    redirect(withNotice(returnTo, "introuvable"));
  }
}

export async function createMember(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  const values = formValues(formData);
  const returnTo = safeReturnPath(formData.get("retour"), LIST);
  // Un champ facultatif vide n'est pas envoyé.
  const body: Record<string, string> = {
    firstName: text(formData, "firstName"),
    lastName: text(formData, "lastName"),
  };
  for (const key of OPTIONAL) {
    const value = text(formData, key);
    if (value) {
      body[key] = value;
    }
  }
  try {
    await apiWrite("/admin/members", "POST", body);
  } catch (error) {
    return failure(error, values);
  }
  revalidatePath(LIST, "layout");
  redirect(withNotice(returnTo, "cree"));
}

export async function updateMember(
  id: string,
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  const values = formValues(formData);
  const returnTo = safeReturnPath(formData.get("retour"), LIST);
  // Un champ facultatif vidé est effacé : null, jamais une chaîne vide.
  const body: Record<string, string | null> = {
    firstName: text(formData, "firstName"),
    lastName: text(formData, "lastName"),
  };
  for (const key of OPTIONAL) {
    body[key] = text(formData, key) || null;
  }
  try {
    await apiWrite(`/admin/members/${id}`, "PATCH", body);
  } catch (error) {
    goneToList(error, returnTo);
    return failure(error, values);
  }
  revalidatePath(LIST, "layout");
  redirect(withNotice(returnTo, "modifie"));
}

export async function deleteMember(
  id: string,
  returnTo: string,
): Promise<ActionResult> {
  const target = safeReturnPath(returnTo, LIST);
  try {
    await apiWrite(`/admin/members/${id}`, "DELETE");
  } catch (error) {
    goneToList(error, target);
    return { message: failureMessage(error) };
  }
  revalidatePath(LIST, "layout");
  redirect(withNotice(target, "supprime"));
}

// Mandats. L'ordre n'est jamais envoyé : l'API l'attribue à la création, et
// seul le réordonnancement d'une année le modifie.

export async function createMandate(
  memberId: string,
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  const values = formValues(formData, ["roles"]);
  try {
    await apiWrite("/admin/mandates", "POST", {
      member: memberId,
      rotaryYear: text(formData, "rotaryYear"),
      roles: values.roles,
    });
  } catch (error) {
    return failure(error, values, MANDATE_EXISTS);
  }
  revalidatePath(LIST, "layout");
  return { values: {}, ok: true };
}

export async function updateMandateRoles(
  mandateId: string,
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  const values = formValues(formData, ["roles"]);
  try {
    await apiWrite(`/admin/mandates/${mandateId}`, "PATCH", {
      roles: values.roles,
    });
  } catch (error) {
    return failure(error, values);
  }
  revalidatePath(LIST, "layout");
  return { values: {}, ok: true };
}

export async function deleteMandate(
  mandateId: string,
  returnTo: string,
): Promise<ActionResult> {
  const target = safeReturnPath(returnTo, LIST);
  try {
    await apiWrite(`/admin/mandates/${mandateId}`, "DELETE");
  } catch (error) {
    goneToList(error, target);
    return { message: failureMessage(error) };
  }
  revalidatePath(LIST, "layout");
  redirect(withNotice(target, "supprime"));
}

// Remplace l'ordre de toute l'année en une seule opération.
export async function reorderMandates(
  rotaryYearId: string,
  mandateIds: string[],
  returnTo: string,
): Promise<ActionResult> {
  const target = safeReturnPath(returnTo, `${LIST}/ordre`);
  try {
    await apiWrite("/admin/mandates/order", "PUT", {
      rotaryYear: rotaryYearId,
      mandateIds,
    });
  } catch (error) {
    if (
      error instanceof ApiError &&
      error.status === 400 &&
      error.details?.some(({ field }) => field === "mandateIds")
    ) {
      return { message: ORDER_CHANGED };
    }
    return { message: failureMessage(error) };
  }
  revalidatePath(LIST, "layout");
  redirect(withNotice(target, "ordre"));
}
