import DeleteSection from "@/components/DeleteSection";
import PageHeader from "@/components/PageHeader";
import PhotosSection from "@/components/PhotosSection";
import { PublishedMark } from "@/components/StatusMark";
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
import { addPhoto, removePhoto, reorderPhotos, updatePhoto } from "../images-actions";

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
      <PageHeader
        back={{ href: returnTo, label: "Actualités" }}
        title={news.title}
        marks={<PublishedMark isPublished={news.isPublished} />}
      />
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
      <PhotosSection
        photos={news.photos}
        addAction={addPhoto.bind(null, news.id)}
        updateAction={updatePhoto.bind(null, news.id)}
        removeAction={removePhoto.bind(null, news.id)}
        reorderAction={reorderPhotos.bind(null, news.id)}
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
