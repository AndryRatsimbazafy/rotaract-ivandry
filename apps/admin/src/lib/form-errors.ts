import { ApiError, GENERIC_ERROR } from "./api";
import type { FormState, FormValues } from "./form-state";

// Erreur de l'API → état du formulaire : chaque message sous son champ, un
// conflit en tête, le reste en message générique. La saisie est conservée.
export function failure(
  error: unknown,
  values: FormValues,
  conflictMessage?: string,
): FormState {
  if (!(error instanceof ApiError)) {
    throw error;
  }
  if (error.status === 400 && error.details?.length) {
    const fieldErrors: Record<string, string> = {};
    for (const { field, message } of error.details) {
      fieldErrors[field] ??= message;
    }
    return { fieldErrors, values };
  }
  if (error.status === 409 && conflictMessage) {
    return { message: conflictMessage, values };
  }
  return { message: error.message || GENERIC_ERROR, values };
}

// La même erreur pour une action sans formulaire.
export function failureMessage(error: unknown, conflictMessage?: string): string {
  if (!(error instanceof ApiError)) {
    throw error;
  }
  if (error.status === 409 && conflictMessage) {
    return conflictMessage;
  }
  return error.details?.[0]?.message ?? (error.message || GENERIC_ERROR);
}
