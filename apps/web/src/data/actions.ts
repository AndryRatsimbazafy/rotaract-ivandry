import { apiGet, apiGetAll } from "@/lib/api";
import { toParagraphs } from "@/lib/paragraphs";
import type { Action, ActionImpact } from "@/types/action";
import type { RotaryYear } from "@/types/rotary-year";

// Forme publique d'une action dans l'API. Un champ facultatif vide est absent.
interface ApiAction {
  id: string;
  slug: string;
  title: string;
  summary?: string;
  description?: string;
  date: string;
  rotaryYear: string;
  focusAreas: string[];
  impact?: ActionImpact;
}

function toAction(action: ApiAction): Action {
  const description = toParagraphs(action.description);

  return {
    id: action.id,
    slug: action.slug,
    title: action.title,
    summary: action.summary,
    description: description.length > 0 ? description : undefined,
    date: action.date,
    rotaryYear: action.rotaryYear as RotaryYear,
    focusAreas: action.focusAreas,
    impact: action.impact,
    // L'API ne fournit aucune photographie : les cadres restent des gabarits.
    photos: [],
  };
}

/** Les premières actions, dans l'ordre que le club a choisi. */
export async function getLatestActions(limit: number): Promise<Action[]> {
  try {
    const { data } = await apiGet<{ data: ApiAction[] }>("/actions", { limit });
    return data.map(toAction);
  } catch {
    return [];
  }
}

export interface ActionFilters {
  rotaryYear?: string;
  focusArea?: string;
}

export interface ActionList {
  actions: Action[];
  /** Faux quand une partie de la liste n'a pas pu être lue. */
  complete: boolean;
}

/** Toutes les actions publiées du filtre, dans l'ordre de l'API. */
export async function getActions(filters: ActionFilters): Promise<ActionList> {
  try {
    const { items, complete } = await apiGetAll<ApiAction>("/actions", {
      year: filters.rotaryYear,
      focusArea: filters.focusArea,
    });
    return { actions: items.map(toAction), complete };
  } catch {
    // API injoignable, ou filtre refusé : la page montre son état vide.
    return { actions: [], complete: true };
  }
}

/** Années Rotary pour lesquelles au moins une action est publiée. */
export async function getActionYears(): Promise<RotaryYear[]> {
  try {
    const { data } = await apiGet<{ data: { label: string }[] }>(
      "/actions/years",
    );
    return data.map((year) => year.label as RotaryYear);
  } catch {
    return [];
  }
}

export async function getActionCount(): Promise<number> {
  try {
    const { meta } = await apiGet<{ meta: { total: number } }>("/actions", {
      limit: 1,
    });
    return meta.total;
  } catch {
    return 0;
  }
}
