// État renvoyé par chaque Server Action de formulaire.
export type FormValues = Record<string, string | string[]>;

export type FormState = {
  message?: string;
  fieldErrors?: Record<string, string>;
  values: FormValues;
  // Vrai après un succès, pour un formulaire en dialogue qui doit se fermer.
  ok?: boolean;
};

export const EMPTY_FORM_STATE: FormState = { values: {} };

// Résultat d'une action sans formulaire (suppression, publication, ordre).
export type ActionResult = { message: string } | undefined;

export const NOT_FOUND_MESSAGE = "Ressource introuvable.";

// Valeurs saisies, renvoyées pour être réaffichées après un échec.
export function formValues(formData: FormData, multiple: string[] = []): FormValues {
  const values: FormValues = {};
  for (const key of new Set(formData.keys())) {
    if (key.startsWith("$ACTION")) {
      continue;
    }
    const all = formData.getAll(key).filter((v) => typeof v === "string");
    values[key] = multiple.includes(key) ? all : (all[0] ?? "");
  }
  for (const key of multiple) {
    values[key] ??= [];
  }
  return values;
}

export function text(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

// Valeur à réafficher : celle de la dernière saisie, sinon la valeur d'origine.
export function fieldValue(
  state: FormState,
  initial: Record<string, string | undefined>,
  name: string,
): string {
  const value = state.values[name];
  return typeof value === "string" ? value : (initial[name] ?? "");
}
