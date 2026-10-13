import { ApiError } from "./api";
import { failure } from "./form-errors";
import { text, type FormState, type FormValues } from "./form-state";

// Champs d'une image, partagés par les actions serveur des portraits et des
// photographies (specs/011-image-storage, contracts/api-images.md).

const IMAGE_FIELDS = ["alt", "caption", "credit", "focus"] as const;

// Corps multipart d'un envoi : l'image et ses champs. Un champ facultatif
// vide n'est pas envoyé.
export function imageUploadBody(formData: FormData): FormData {
  const body = new FormData();
  const image = formData.get("image");
  if (image instanceof File && image.size > 0) {
    body.append("image", image, image.name || "image");
  }
  for (const field of IMAGE_FIELDS) {
    const value = text(formData, field);
    if (value) {
      body.append(field, value);
    }
  }
  return body;
}

// Corps JSON d'une modification : une légende ou un crédit vide est retiré
// (null).
export function imageFieldsBody(formData: FormData): Record<string, string | null> {
  return {
    alt: text(formData, "alt"),
    caption: text(formData, "caption") || null,
    credit: text(formData, "credit") || null,
    ...(text(formData, "focus") ? { focus: text(formData, "focus") } : {}),
  };
}

// Erreur de l'API → état du panneau : poids et format sous le choix du
// fichier, les autres messages sous leur champ ou en tête.
export function imageFailure(error: unknown, values: FormValues): FormState {
  if (error instanceof ApiError && (error.status === 413 || error.status === 415)) {
    return {
      fieldErrors: {
        image:
          error.status === 413
            ? "L'image dépasse 5 Mo."
            : error.message,
      },
      values,
    };
  }
  return failure(error, values);
}
