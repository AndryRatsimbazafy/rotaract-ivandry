import type { Action, ImpactIndicator } from "@/types/action";
import type { RotaryYear } from "@/types/rotary-year";

// Aucune action n'est encore publiée. Ces fonctions seront remplacées par des
// appels à l'API sans que les pages aient à changer.
const actions: Action[] = [];

export async function getLatestActions(limit: number): Promise<Action[]> {
  return actions.slice(0, limit);
}

export interface ActionFilters {
  rotaryYear?: string;
  focusArea?: string;
}

export async function getActions(filters: ActionFilters): Promise<Action[]> {
  return actions.filter(
    (action) =>
      (!filters.rotaryYear || action.rotaryYear === filters.rotaryYear) &&
      (!filters.focusArea || action.focusArea === filters.focusArea),
  );
}

/** Années Rotary pour lesquelles au moins une action est publiée. */
export async function getActionYears(): Promise<RotaryYear[]> {
  return [...new Set(actions.map((action) => action.rotaryYear))]
    .sort()
    .reverse();
}

export async function getActionCount(): Promise<number> {
  return actions.length;
}

// Indicateurs proposés. Les valeurs viendront du Back Office : aucune n'est
// estimée ici.
export async function getImpactIndicators(): Promise<ImpactIndicator[]> {
  return [
    { id: "personnes", label: "Personnes accompagnées" },
    { id: "beneficiaires", label: "Bénéficiaires" },
    { id: "benevoles", label: "Bénévoles mobilisés" },
    { id: "partenaires", label: "Partenaires" },
    { id: "ressources", label: "Ressources distribuées" },
  ];
}
