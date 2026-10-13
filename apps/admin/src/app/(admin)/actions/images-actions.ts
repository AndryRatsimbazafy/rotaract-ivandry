"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { apiUpload, apiWrite } from "@/lib/api";
import { goneToList } from "@/lib/content-actions";
import { failureMessage } from "@/lib/form-errors";
import {
  formValues,
  type ActionResult,
  type FormState,
} from "@/lib/form-state";
import { imageFailure, imageFieldsBody, imageUploadBody } from "@/lib/image-forms";
import { safeReturnPath, withNotice } from "@/lib/navigation";

// Photographies d'un contenu (contracts/api-images.md). here : adresse de la
// fiche, où l'on revient après une opération.
const BASE = "/actions";
const API = "/admin/actions";

export async function addPhoto(
  id: string,
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  const values = formValues(formData);
  try {
    await apiUpload(`${API}/${id}/photos`, "POST", imageUploadBody(formData));
  } catch (error) {
    return imageFailure(error, values);
  }
  revalidatePath(BASE, "layout");
  return { values: {}, ok: true };
}

export async function updatePhoto(
  id: string,
  photoId: string,
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  const values = formValues(formData);
  try {
    await apiWrite(`${API}/${id}/photos/${photoId}`, "PATCH", imageFieldsBody(formData));
  } catch (error) {
    return imageFailure(error, values);
  }
  revalidatePath(BASE, "layout");
  return { values: {}, ok: true };
}

export async function removePhoto(
  id: string,
  photoId: string,
  here: string,
): Promise<ActionResult> {
  const target = safeReturnPath(here, BASE);
  try {
    await apiWrite(`${API}/${id}/photos/${photoId}`, "DELETE");
  } catch (error) {
    goneToList(error, BASE, target);
    return { message: failureMessage(error) };
  }
  revalidatePath(BASE, "layout");
  redirect(withNotice(target, "supprime"));
}

export async function reorderPhotos(
  id: string,
  photoIds: string[],
  here: string,
): Promise<ActionResult> {
  const target = safeReturnPath(here, BASE);
  try {
    await apiWrite(`${API}/${id}/photos/order`, "PUT", { photoIds });
  } catch (error) {
    goneToList(error, BASE, target);
    return { message: failureMessage(error) };
  }
  revalidatePath(BASE, "layout");
  redirect(withNotice(target, "ordre"));
}
