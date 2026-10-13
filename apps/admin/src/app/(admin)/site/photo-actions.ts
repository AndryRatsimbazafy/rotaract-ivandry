"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ApiError, apiUpload, apiWrite, isNotFound } from "@/lib/api";
import { failureMessage } from "@/lib/form-errors";
import { formValues, type ActionResult, type FormState } from "@/lib/form-state";
import { imageFailure, imageFieldsBody, imageUploadBody } from "@/lib/image-forms";
import { withNotice } from "@/lib/navigation";
import type { SitePhotoSlot } from "@/types/site-settings";

// Photographies fixes du site (contracts/api-site-settings.md), sur le modèle
// du portrait d'un membre.
const PAGE = "/site";

const photoPath = (slot: SitePhotoSlot) => `/admin/site-settings/photos/${slot}`;

export async function setSitePhoto(
  slot: SitePhotoSlot,
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  const values = formValues(formData);
  try {
    await apiUpload(photoPath(slot), "PUT", imageUploadBody(formData));
  } catch (error) {
    return imageFailure(error, values);
  }
  revalidatePath(PAGE);
  return { values: {}, ok: true };
}

export async function updateSitePhoto(
  slot: SitePhotoSlot,
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  const values = formValues(formData);
  try {
    await apiWrite(photoPath(slot), "PATCH", imageFieldsBody(formData));
  } catch (error) {
    return imageFailure(error, values);
  }
  revalidatePath(PAGE);
  return { values: {}, ok: true };
}

export async function removeSitePhoto(slot: SitePhotoSlot): Promise<ActionResult> {
  try {
    await apiWrite(photoPath(slot), "DELETE");
  } catch (error) {
    if (error instanceof ApiError && isNotFound(error)) {
      revalidatePath(PAGE);
      redirect(withNotice(PAGE, "introuvable"));
    }
    return { message: failureMessage(error) };
  }
  revalidatePath(PAGE);
  redirect(withNotice(PAGE, "supprime"));
}
