import type { Action } from "@/types/action";
import type { RotaryYear } from "@/types/rotary-year";
import { getActions } from "./actions";
import { getMembers, getMemberYears } from "./members";

/** Une année de la frise du club (fonctionnalité 015). */
export interface TimelineYear {
  year: RotaryYear;
  /** Présidents de l'année, tirés des mandats, dans l'ordre choisi par le club. */
  presidents: { id: string; firstName: string; lastName: string }[];
  /** Actions publiées marquées « marquante », dans l'ordre de la liste publique. */
  actions: Pick<Action, "id" | "slug" | "title" | "focusAreas" | "french">[];
}

// « 2025-2026 » : l'ordre alphabétique est l'ordre chronologique.
const newestFirst = (a: string, b: string) => b.localeCompare(a);

/**
 * La frise des années : présidents et actions marquantes de chaque année
 * Rotary, de la plus récente à la plus ancienne. Une année sans président
 * ni action marquante n'apparaît pas ; rien n'est inventé. Une lecture qui
 * échoue laisse sa part vide (les fonctions de src/data rendent alors une liste vide).
 */
export async function getClubTimeline(): Promise<TimelineYear[]> {
  const [memberYears, { actions }] = await Promise.all([getMemberYears(), getActions({})]);

  const presidentsByYear = new Map<string, TimelineYear["presidents"]>();
  await Promise.all(
    memberYears.map(async (year) => {
      const presidents = (await getMembers(year))
        .filter((member) => member.roles.includes("president"))
        .map(({ id, firstName, lastName }) => ({ id, firstName, lastName }));
      if (presidents.length > 0) presidentsByYear.set(year, presidents);
    }),
  );

  const actionsByYear = new Map<string, TimelineYear["actions"]>();
  for (const action of actions) {
    if (!action.highlighted) continue;
    const list = actionsByYear.get(action.rotaryYear) ?? [];
    list.push({
      id: action.id,
      slug: action.slug,
      title: action.title,
      focusAreas: action.focusAreas,
      french: action.french,
    });
    actionsByYear.set(action.rotaryYear, list);
  }

  const years = [...new Set([...presidentsByYear.keys(), ...actionsByYear.keys()])].sort(newestFirst);
  return years.map((year) => ({
    year: year as RotaryYear,
    presidents: presidentsByYear.get(year) ?? [],
    actions: actionsByYear.get(year) ?? [],
  }));
}
