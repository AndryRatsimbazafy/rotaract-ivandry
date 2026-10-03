import type { Metadata } from "next";
import { JoinReminder } from "@/components/sections/JoinReminder";
import { actionsPage } from "@/content/pages";
import { getActionCount, getActions, getActionYears } from "@/data/actions";
import { getCurrentRotaryYear } from "@/data/rotary-years";
import { single } from "@/lib/search-params";
import { ActionDefinition } from "./_sections/ActionDefinition";
import { ActionsIndex } from "./_sections/ActionsIndex";
import { ActionsOpening } from "./_sections/ActionsOpening";

export const metadata: Metadata = {
  title: actionsPage.title,
  description: actionsPage.description,
};

export default async function ActionsPage(props: PageProps<"/actions">) {
  const query = await props.searchParams;
  const filters = {
    rotaryYear: single(query.annee),
    focusArea: single(query.domaine),
  };

  // La liste n'est pas attendue ici : sa zone a sa propre attente.
  const list = getActions(filters);
  const [publishedYears, count, currentYear] = await Promise.all([
    getActionYears(),
    getActionCount(),
    getCurrentRotaryYear(),
  ]);
  // Tant qu'aucune action n'est publiée, seule l'année en cours est proposée.
  const years = publishedYears.length > 0 ? publishedYears : [currentYear];

  return (
    <>
      <ActionsOpening rotaryYear={currentYear} count={count} />
      <ActionDefinition />
      <ActionsIndex
        list={list}
        isPending={count === 0}
        years={years}
        filters={filters}
      />
      <JoinReminder />
    </>
  );
}
