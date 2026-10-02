import Alert from "@/components/InfoAlert";
import LinkButton from "@/components/LinkButton";
import PageHeader from "@/components/PageHeader";
import { apiRead, queryString } from "@/lib/api";
import { MEMBER_ROLE_LABELS } from "@/lib/labels";
import { param } from "@/lib/navigation";
import type { Listed, Paginated } from "@/types/api";
import type { Mandate, Member } from "@/types/member";
import type { RotaryYear } from "@/types/rotary-year";
import MandateOrderList from "../_components/MandateOrderList";
import OrderYearPicker from "../_components/OrderYearPicker";

// Un mandat ne porte que l'identifiant de son membre : les noms viennent de
// la liste des membres de l'année, lue page après page.
async function memberNames(label: string): Promise<Map<string, string>> {
  const names = new Map<string, string>();
  for (let page = 1; ; page++) {
    const { data, meta } = await apiRead<Paginated<Member>>(
      `/admin/members${queryString({ year: label, limit: 100, page })}`,
    );
    for (const member of data) {
      names.set(member.id, `${member.lastName} ${member.firstName}`);
    }
    if (page >= meta.totalPages) {
      return names;
    }
  }
}

export default async function OrdrePage({
  searchParams,
}: PageProps<"/membres/ordre">) {
  const annee = param(await searchParams, "annee");
  const years = await apiRead<Listed<RotaryYear>>("/admin/rotary-years");
  const year = years.data.find(({ label }) => label === annee);

  const header = (
    <>
      <PageHeader title="Ordre d'une année">
        <LinkButton href="/membres" variant="outlined">
          Retour aux membres
        </LinkButton>
      </PageHeader>
      <OrderYearPicker
        labels={years.data.map(({ label }) => label)}
        current={year?.label ?? ""}
      />
    </>
  );

  if (!year) {
    return (
      <>
        {header}
        <Alert>
          {years.data.length === 0
            ? "Créez d'abord une année Rotary."
            : "Choisissez une année pour régler l'ordre d'affichage de ses membres."}
        </Alert>
      </>
    );
  }

  const [mandates, names] = await Promise.all([
    apiRead<Listed<Mandate>>(
      `/admin/mandates${queryString({ year: year.label })}`,
    ),
    memberNames(year.label),
  ]);

  if (mandates.data.length === 0) {
    return (
      <>
        {header}
        <Alert>Aucun membre n&apos;a de mandat pour {year.label}.</Alert>
      </>
    );
  }

  const rows = mandates.data.map((mandate) => ({
    id: mandate.id,
    name: names.get(mandate.member) ?? "Membre",
    roles: mandate.roles.length
      ? mandate.roles.map((role) => MEMBER_ROLE_LABELS[role]).join(", ")
      : "Sans fonction",
  }));

  return (
    <>
      {header}
      <MandateOrderList
        key={rows.map(({ id }) => id).join()}
        rotaryYearId={year.id}
        rows={rows}
        returnTo={`/membres/ordre?annee=${year.label}`}
      />
    </>
  );
}
