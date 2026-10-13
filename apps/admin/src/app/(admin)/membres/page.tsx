import { Suspense } from "react";
import { InspectorPending } from "@/components/Inspector";
import LinkButton from "@/components/LinkButton";
import PageHeader from "@/components/PageHeader";
import { apiRead } from "@/lib/api";
import { formatDate } from "@/lib/dates";
import { MEMBER_ROLE_OPTIONS } from "@/lib/labels";
import { clampPage, readList, toSearch } from "@/lib/lists";
import { pickSelection } from "@/lib/inspector";
import { listPath, param } from "@/lib/navigation";
import type { Listed } from "@/types/api";
import type { Member } from "@/types/member";
import type { RotaryYear } from "@/types/rotary-year";
import MemberInspector from "./_components/MemberInspector";
import MembersTable from "./_components/MembersTable";

export default async function MembresPage({
  searchParams,
}: PageProps<"/membres">) {
  const params = await searchParams;
  const q = param(params, "q");
  const annee = param(params, "annee");
  const fonction = param(params, "fonction");
  const tri = param(params, "tri");
  const page = param(params, "page");

  const [{ list, errors }, years] = await Promise.all([
    readList<Member>("/admin/members", {
      q,
      year: annee,
      role: fonction,
      sort: tri,
      page,
    }),
    apiRead<Listed<RotaryYear>>("/admin/rotary-years"),
  ]);
  clampPage(list, "/membres", toSearch({ q, annee, fonction, tri, page }));

  const returnTo = listPath("/membres", params);
  const selected = pickSelection(
    params,
    list.data.map(({ id }) => id),
  );

  return (
    <>
      <PageHeader title="Membres">
        <LinkButton href="/membres/ordre" variant="outlined">
          Ordre d&apos;une année
        </LinkButton>
        <LinkButton href="/membres/nouveau" variant="contained">
          Nouveau membre
        </LinkButton>
      </PageHeader>
      <MembersTable
        rows={list.data.map((member) => ({
          id: member.id,
          firstName: member.firstName,
          lastName: member.lastName,
          occupation: member.occupation ?? "",
          email: member.email ?? "",
          phone: member.phone ?? "",
          createdAt: formatDate(member.createdAt),
        }))}
        filters={[
          {
            name: "annee",
            label: "Année",
            options: years.data.map(({ label }) => ({ value: label, label })),
          },
          { name: "fonction", label: "Fonction", options: MEMBER_ROLE_OPTIONS },
        ]}
        errors={errors}
        filtered={Boolean(q || annee || fonction)}
        page={list.meta.page}
        limit={list.meta.limit}
        total={list.meta.total}
        returnTo={returnTo}
        selected={selected}
        inspector={
          selected && (
            <Suspense key={selected} fallback={<InspectorPending />}>
              <MemberInspector id={selected} returnTo={returnTo} />
            </Suspense>
          )
        }
      />
    </>
  );
}
