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
import { withNotice } from "@/lib/navigation";

const YEAR_IN_USE =
  "Cette année ne peut pas être supprimée : des mandats, des actions ou des actualités s'y rattachent.";

export async function createYear(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  const values = formValues(formData);
  const raw = text(formData, "startYear");
  // L'API attend un nombre : un texte, même numérique, est refusé.
  const startYear = /^-?\d+$/.test(raw) ? Number(raw) : raw;
  try {
    await apiWrite("/admin/rotary-years", "POST", { startYear });
  } catch (error) {
    // Le message du doublon est celui de l'API.
    return failure(error, values);
  }
  revalidatePath("/annees");
  return { values: {}, ok: true };
}

export async function deleteYear(id: string): Promise<ActionResult> {
  try {
    await apiWrite(`/admin/rotary-years/${id}`, "DELETE");
  } catch (error) {
    if (error instanceof ApiError && isNotFound(error)) {
      revalidatePath("/annees");
      redirect(withNotice("/annees", "introuvable"));
    }
    return { message: failureMessage(error, YEAR_IN_USE) };
  }
  revalidatePath("/annees");
  redirect(withNotice("/annees", "supprime"));
}
