import DeleteSection from "@/components/DeleteSection";
import PageHeader from "@/components/PageHeader";
import { apiRead } from "@/lib/api";
import {
  formatDateTime,
  isoToMadagascarInput,
  yearsForMadagascarInput,
} from "@/lib/dates";
import { param, safeReturnPath } from "@/lib/navigation";
import type { Listed } from "@/types/api";
import type { News } from "@/types/news";
import type { RotaryYear } from "@/types/rotary-year";
import { deleteNews, updateNews } from "../actions";
import NewsForm from "../_components/NewsForm";

export default async function ActualitePage({
  params,
  searchParams,
}: PageProps<"/actualites/[id]">) {
  const { id } = await params;
  const returnTo = safeReturnPath(
    param(await searchParams, "retour"),
    "/actualites",
  );
  const [news, years] = await Promise.all([
    apiRead<News>(`/admin/news/${id}`),
    apiRead<Listed<RotaryYear>>("/admin/rotary-years"),
  ]);

  return (
    <>
      <PageHeader title={news.title} />
      <NewsForm
        action={updateNews.bind(null, news.id, news.slug)}
        initial={{
          values: {
            title: news.title,
            slug: news.slug,
            type: news.type,
            // L'instant enregistré, exprimé en heure de Madagascar.
            date: isoToMadagascarInput(news.date),
            rotaryYear: news.rotaryYear.id,
            location: news.location ?? "",
            summary: news.summary ?? "",
            content: news.content ?? "",
          },
          isPublished: news.isPublished,
          publishedAt: news.publishedAt
            ? formatDateTime(news.publishedAt)
            : undefined,
        }}
        years={yearsForMadagascarInput(years.data)}
        returnTo={returnTo}
      />
      <DeleteSection
        label="Supprimer cette actualité"
        title="Supprimer cette actualité ?"
        text={`L'actualité « ${news.title} » sera supprimée définitivement.`}
        action={deleteNews.bind(null, news.id, returnTo)}
      />
    </>
  );
}
