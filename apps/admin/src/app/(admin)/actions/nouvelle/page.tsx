import PageHeader from "@/components/PageHeader";
import { apiRead } from "@/lib/api";
import { yearsForDateInput } from "@/lib/dates";
import { param, safeReturnPath } from "@/lib/navigation";
import type { Listed } from "@/types/api";
import type { RotaryYear } from "@/types/rotary-year";
import { createAction } from "../actions";
import ActionForm from "../_components/ActionForm";

export default async function NouvelleActionPage({
  searchParams,
}: PageProps<"/actions/nouvelle">) {
  const returnTo = safeReturnPath(param(await searchParams, "retour"), "/actions");
  const years = await apiRead<Listed<RotaryYear>>("/admin/rotary-years");
  return (
    <>
      <PageHeader title="Nouvelle action" />
      <ActionForm
        action={createAction}
        years={yearsForDateInput(years.data)}
        returnTo={returnTo}
      />
    </>
  );
}
