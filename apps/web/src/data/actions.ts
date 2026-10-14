import { apiGet, apiGetAll, apiGetOrNull } from "@/lib/api";
import { toParagraphs } from "@/lib/paragraphs";
import { currentLang } from "@/lib/current-lang";
import type { Lang } from "@/lib/locale";
import { picker } from "./localize";
import { toPhoto, type ApiImage } from "./media";
import type { Action, ActionImpact, ActionTextField } from "@/types/action";
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
  en?: {
    title?: string;
    summary?: string;
    description?: string;
    impact?: Omit<ActionImpact, "partners">;
  };
  photos: ApiImage[];
  /** Présent seulement pour une action marquante (fonctionnalité 015). */
  highlighted?: true;
}

const IMPACT_KEYS = ["objective", "beneficiaries", "location", "period", "results"] as const;

function toAction(action: ApiAction, lang: Lang): Action {
  const { french, take } = picker<ActionTextField>(lang);
  const en = action.en;
  const description = toParagraphs(take("description", action.description, en?.description));
  let impact: ActionImpact | undefined;
  if (action.impact) {
    impact = { ...action.impact };
    for (const key of IMPACT_KEYS) {
      impact[key] = take(key, action.impact[key], en?.impact?.[key]);
    }
  }

  return {
    id: action.id,
    slug: action.slug,
    title: take("title", action.title, en?.title) ?? action.title,
    summary: take("summary", action.summary, en?.summary),
    description: description.length > 0 ? description : undefined,
    date: action.date,
    rotaryYear: action.rotaryYear as RotaryYear,
    focusAreas: action.focusAreas,
    impact,
    ...(action.highlighted ? { highlighted: true } : {}),
    // La première est la principale ; sans photographie, les cadres restent
    // des gabarits.
    photos: (action.photos ?? []).map((photo) => toPhoto(photo, lang)),
    ...(Object.keys(french).length ? { french } : {}),
  };
}

/** Une action publiée par son slug ; null si elle n'existe pas ou plus. */
export async function getActionBySlug(slug: string, forLang?: Lang): Promise<Action | null> {
  const action = await apiGetOrNull<ApiAction>(`/actions/${encodeURIComponent(slug)}`);
  // forLang : hors d'une page (images de partage), next/root-params n'existe pas.
  const lang = forLang ?? (await currentLang());
  return action && toAction(action, lang);
}

/** Les premières actions, dans l'ordre que le club a choisi. */
export async function getLatestActions(limit: number): Promise<Action[]> {
  try {
    const { data } = await apiGet<{ data: ApiAction[] }>("/actions", { limit });
    const lang = await currentLang();
    return data.map((action) => toAction(action, lang));
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
    const lang = await currentLang();
    return { actions: items.map((action) => toAction(action, lang)), complete };
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
