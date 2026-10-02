import ContentTable from "@/components/ContentTable";
import LinkButton from "@/components/LinkButton";
import PageHeader from "@/components/PageHeader";
import { apiRead } from "@/lib/api";
import { formatDate, formatDateTime } from "@/lib/dates";
import {
  NEWS_TYPE_LABELS,
  NEWS_TYPE_OPTIONS,
  PUBLISHED_OPTIONS,
} from "@/lib/labels";
import { clampPage, readList, toSearch } from "@/lib/lists";
import { listPath, param } from "@/lib/navigation";
import type { Listed } from "@/types/api";
import type { News } from "@/types/news";
import type { RotaryYear } from "@/types/rotary-year";
import { deleteNews, setNewsPublished } from "./actions";

export default async function ActualitesPage({
  searchParams,
}: PageProps<"/actualites">) {
  const params = await searchParams;
  const q = param(params, "q");
  const annee = param(params, "annee");
  const type = param(params, "type");
  const publie = param(params, "publie");
  const tri = param(params, "tri");
  const page = param(params, "page");

  const [{ list, errors }, years] = await Promise.all([
    readList<News>("/admin/news", {
      q,
      year: annee,
      type,
      published: publie,
      sort: tri,
      page,
    }),
    apiRead<Listed<RotaryYear>>("/admin/rotary-years"),
  ]);
  clampPage(list, "/actualites", toSearch({ q, annee, type, publie, tri, page }));

  return (
    <>
      <PageHeader title="Actualités">
        <LinkButton href="/actualites/nouvelle" variant="contained">
          Nouvelle actualité
        </LinkButton>
      </PageHeader>
      <ContentTable
        base="/actualites"
        newHref="/actualites/nouvelle"
        newLabel="Nouvelle actualité"
        emptyText="Aucune actualité."
        itemName="L'actualité"
        extraLabel="Type"
        dateLabel="Date et heure (Madagascar)"
        rows={list.data.map((news) => ({
          id: news.id,
          title: news.title,
          date: formatDateTime(news.date),
          year: news.rotaryYear.label,
          isPublished: news.isPublished,
          createdAt: formatDate(news.createdAt),
          extra: NEWS_TYPE_LABELS[news.type],
        }))}
        filters={[
          {
            // Les archives se consultent par ce filtre, brouillons compris.
            name: "annee",
            label: "Année",
            options: years.data.map(({ label }) => ({ value: label, label })),
          },
          { name: "type", label: "Type", options: NEWS_TYPE_OPTIONS },
          { name: "publie", label: "Publication", options: PUBLISHED_OPTIONS },
        ]}
        errors={errors}
        filtered={Boolean(q || annee || type || publie)}
        page={list.meta.page}
        limit={list.meta.limit}
        total={list.meta.total}
        returnTo={listPath("/actualites", params)}
        publishAction={setNewsPublished}
        deleteAction={deleteNews}
      />
    </>
  );
}
