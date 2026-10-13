"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ApiError, apiUpload, apiWrite, isNotFound } from "@/lib/api";
import { failureMessage } from "@/lib/form-errors";
import {
  formValues,
  type ActionResult,
  type FormState,
} from "@/lib/form-state";
import { imageFailure, imageFieldsBody, imageUploadBody } from "@/lib/image-forms";
import { safeReturnPath, withNotice } from "@/lib/navigation";

// Portrait d'un membre (contracts/api-images.md). here : adresse de la fiche.
const LIST = "/membres";

export async function setPortrait(
  id: string,
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  const values = formValues(formData);
  try {
    await apiUpload(`/admin/members/${id}/portrait`, "PUT", imageUploadBody(formData));
  } catch (error) {
    return imageFailure(error, values);
  }
  revalidatePath(LIST, "layout");
  return { values: {}, ok: true };
}

export async function updatePortrait(
  id: string,
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  const values = formValues(formData);
  try {
    await apiWrite(`/admin/members/${id}/portrait`, "PATCH", imageFieldsBody(formData));
  } catch (error) {
    return imageFailure(error, values);
  }
  revalidatePath(LIST, "layout");
  return { values: {}, ok: true };
}

export async function removePortrait(id: string, here: string): Promise<ActionResult> {
  const target = safeReturnPath(here, LIST);
  try {
    await apiWrite(`/admin/members/${id}/portrait`, "DELETE");
  } catch (error) {
    if (error instanceof ApiError && isNotFound(error)) {
      revalidatePath(LIST, "layout");
      redirect(withNotice(target, "introuvable"));
    }
    return { message: failureMessage(error) };
  }
  revalidatePath(LIST, "layout");
  redirect(withNotice(target, "supprime"));
}
