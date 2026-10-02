import PageHeader from "@/components/PageHeader";
import { formatDateTime, madagascarDayEnd, madagascarDayStart } from "@/lib/dates";
import { APPLICANT_STATUS_LABELS } from "@/lib/labels";
import { clampPage, readList, toSearch } from "@/lib/lists";
import { listPath, param } from "@/lib/navigation";
import type { Application } from "@/types/application";
import ApplicationsTable from "./_components/ApplicationsTable";

export default async function CandidaturesPage({
  searchParams,
}: PageProps<"/candidatures">) {
  const params = await searchParams;
  const q = param(params, "q");
  const du = param(params, "du");
  const au = param(params, "au");
  const tri = param(params, "tri");
  const page = param(params, "page");

  // « Du » et « Au » sont des jours de Madagascar, comme les dates affichées.
  // Une valeur mal formée est transmise telle quelle : l'API la refuse avec
  // son message.
  const { list, errors } = await readList<Application>("/admin/applications", {
    q,
    from: du ? (madagascarDayStart(du) ?? du) : undefined,
    to: au ? (madagascarDayEnd(au) ?? au) : undefined,
    sort: tri,
    page,
  });
  clampPage(list, "/candidatures", toSearch({ q, du, au, tri, page }));

  return (
    <>
      <PageHeader title="Candidatures" />
      <ApplicationsTable
        rows={list.data.map((application) => ({
          id: application.id,
          firstName: application.firstName,
          lastName: application.lastName,
          email: application.email,
          status: APPLICANT_STATUS_LABELS[application.applicantStatus],
          createdAt: formatDateTime(application.createdAt),
        }))}
        errors={errors}
        filtered={Boolean(q || du || au)}
        page={list.meta.page}
        limit={list.meta.limit}
        total={list.meta.total}
        returnTo={listPath("/candidatures", params)}
      />
    </>
  );
}
