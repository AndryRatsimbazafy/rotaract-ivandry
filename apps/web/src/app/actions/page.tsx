import type { Metadata } from "next";
import { JoinReminder } from "@/components/sections/JoinReminder";
import { actionsPage } from "@/content/pages";
import {
  getActionCount,
  getActions,
  getActionYears,
  getImpactIndicators,
} from "@/data/actions";
import { currentRotaryYear } from "@/lib/rotary-year";
import { single } from "@/lib/search-params";
import { ActionDefinition } from "./_sections/ActionDefinition";
import { ActionsIndex } from "./_sections/ActionsIndex";
import { ActionsOpening } from "./_sections/ActionsOpening";
import { ImpactLedger } from "./_sections/ImpactLedger";

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

  const [actions, publishedYears, count, indicators] = await Promise.all([
    getActions(filters),
    getActionYears(),
    getActionCount(),
    getImpactIndicators(),
  ]);
  // Tant qu'aucune action n'est publiée, seule l'année en cours est proposée.
  const years = publishedYears.length > 0 ? publishedYears : [currentRotaryYear];

  return (
    <>
      <ActionsOpening rotaryYear={currentRotaryYear} count={count} />
      <ActionDefinition />
      <ActionsIndex
        actions={actions}
        isPending={count === 0}
        years={years}
        filters={filters}
      />
      <ImpactLedger indicators={indicators} />
      <JoinReminder />
    </>
  );
}
