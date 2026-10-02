"use client";

import { useEffect, useRef } from "react";
import type { FormState } from "@/lib/form-state";

// Après un refus, le focus va au premier champ en erreur.
export function useFocusFirstError(state: FormState) {
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (state.fieldErrors) {
      ref.current
        ?.querySelector<HTMLElement>('[aria-invalid="true"]')
        ?.focus();
    }
  }, [state]);
  return ref;
}
