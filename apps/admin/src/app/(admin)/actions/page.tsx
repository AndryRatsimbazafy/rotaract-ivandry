import ContentTable from "@/components/ContentTable";
import LinkButton from "@/components/LinkButton";
import PageHeader from "@/components/PageHeader";
import { apiRead } from "@/lib/api";
import { formatDate, formatUtcDate } from "@/lib/dates";
import { FOCUS_AREA_OPTIONS, PUBLISHED_OPTIONS } from "@/lib/labels";
import { clampPage, readList, toSearch } from "@/lib/lists";
import { listPath, param } from "@/lib/navigation";
import type { Action } from "@/types/action";
import type { Listed } from "@/types/api";
import type { RotaryYear } from "@/types/rotary-year";
import { deleteAction, setActionPublished } from "./actions";

export default async function ActionsPage({
  searchParams,
}: PageProps<"/actions">) {
  const params = await searchParams;
  const q = param(params, "q");
  const annee = param(params, "annee");
  const domaine = param(params, "domaine");
  const publie = param(params, "publie");
  const tri = param(params, "tri");
  const page = param(params, "page");

  const [{ list, errors }, years] = await Promise.all([
    readList<Action>("/admin/actions", {
      q,
      year: annee,
      focusArea: domaine,
      published: publie,
      sort: tri,
      page,
    }),
    apiRead<Listed<RotaryYear>>("/admin/rotary-years"),
  ]);
  clampPage(list, "/actions", toSearch({ q, annee, domaine, publie, tri, page }));

  return (
    <>
      <PageHeader title="Actions">
        <LinkButton href="/actions/nouvelle" variant="contained">
          Nouvelle action
        </LinkButton>
      </PageHeader>
      <ContentTable
        base="/actions"
        newHref="/actions/nouvelle"
        newLabel="Nouvelle action"
        emptyText="Aucune action."
        itemName="L'action"
        extraLabel="Ordre"
        dateLabel="Date"
        rows={list.data.map((action) => ({
          id: action.id,
          title: action.title,
          // Date sans heure : le jour enregistré.
          date: formatUtcDate(action.date),
          year: action.rotaryYear.label,
          isPublished: action.isPublished,
          createdAt: formatDate(action.createdAt),
          extra: action.order === null ? "" : String(action.order),
        }))}
        filters={[
          {
            name: "annee",
            label: "Année",
            options: years.data.map(({ label }) => ({ value: label, label })),
          },
          { name: "domaine", label: "Domaine", options: FOCUS_AREA_OPTIONS },
          { name: "publie", label: "Publication", options: PUBLISHED_OPTIONS },
        ]}
        errors={errors}
        filtered={Boolean(q || annee || domaine || publie)}
        page={list.meta.page}
        limit={list.meta.limit}
        total={list.meta.total}
        returnTo={listPath("/actions", params)}
        publishAction={setActionPublished}
        deleteAction={deleteAction}
      />
    </>
  );
}
