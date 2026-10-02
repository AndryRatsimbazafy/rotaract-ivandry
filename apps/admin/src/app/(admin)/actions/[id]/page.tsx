import DeleteSection from "@/components/DeleteSection";
import PageHeader from "@/components/PageHeader";
import { apiRead } from "@/lib/api";
import { formatDateTime, isoToDateInput, yearsForDateInput } from "@/lib/dates";
import { param, safeReturnPath } from "@/lib/navigation";
import type { Action } from "@/types/action";
import type { Listed } from "@/types/api";
import type { RotaryYear } from "@/types/rotary-year";
import { deleteAction, updateAction } from "../actions";
import ActionForm from "../_components/ActionForm";

export default async function ActionPage({
  params,
  searchParams,
}: PageProps<"/actions/[id]">) {
  const { id } = await params;
  const returnTo = safeReturnPath(param(await searchParams, "retour"), "/actions");
  const [action, years] = await Promise.all([
    apiRead<Action>(`/admin/actions/${id}`),
    apiRead<Listed<RotaryYear>>("/admin/rotary-years"),
  ]);
  const impact = action.impact ?? {};

  return (
    <>
      <PageHeader title={action.title} />
      <ActionForm
        action={updateAction.bind(null, action.id, action.slug)}
        initial={{
          values: {
            title: action.title,
            slug: action.slug,
            summary: action.summary ?? "",
            description: action.description ?? "",
            date: isoToDateInput(action.date),
            rotaryYear: action.rotaryYear.id,
            order: action.order === null ? "" : String(action.order),
            "impact.objective": impact.objective ?? "",
            "impact.beneficiaries": impact.beneficiaries ?? "",
            "impact.location": impact.location ?? "",
            "impact.period": impact.period ?? "",
            "impact.results": impact.results ?? "",
            "impact.partners": (impact.partners ?? []).join("\n"),
          },
          focusAreas: action.focusAreas,
          isPublished: action.isPublished,
          publishedAt: action.publishedAt
            ? formatDateTime(action.publishedAt)
            : undefined,
        }}
        years={yearsForDateInput(years.data)}
        returnTo={returnTo}
      />
      <DeleteSection
        label="Supprimer cette action"
        title="Supprimer cette action ?"
        text={`L'action « ${action.title} » sera supprimée définitivement.`}
        action={deleteAction.bind(null, action.id, returnTo)}
      />
    </>
  );
}
