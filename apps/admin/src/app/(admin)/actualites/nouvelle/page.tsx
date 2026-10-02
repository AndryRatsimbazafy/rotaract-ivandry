import PageHeader from "@/components/PageHeader";
import { apiRead } from "@/lib/api";
import { yearsForMadagascarInput } from "@/lib/dates";
import { param, safeReturnPath } from "@/lib/navigation";
import type { Listed } from "@/types/api";
import type { RotaryYear } from "@/types/rotary-year";
import { createNews } from "../actions";
import NewsForm from "../_components/NewsForm";

export default async function NouvelleActualitePage({
  searchParams,
}: PageProps<"/actualites/nouvelle">) {
  const returnTo = safeReturnPath(
    param(await searchParams, "retour"),
    "/actualites",
  );
  const years = await apiRead<Listed<RotaryYear>>("/admin/rotary-years");
  return (
    <>
      <PageHeader title="Nouvelle actualité" />
      <NewsForm
        action={createNews}
        years={yearsForMadagascarInput(years.data)}
        returnTo={returnTo}
      />
    </>
  );
}
