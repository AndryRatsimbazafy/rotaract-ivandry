import Typography from "@mui/material/Typography";
import ConfirmDialog from "@/components/ConfirmDialog";
import FieldList from "@/components/FieldList";
import {
  InspectorError,
  InspectorNotFound,
  InspectorPanel,
  InspectorSection,
} from "@/components/Inspector";
import LinkButton from "@/components/LinkButton";
import RowAction from "@/components/RowAction";
import { PublishedMark } from "@/components/StatusMark";
import { formatDateTime } from "@/lib/dates";
import { readInspected } from "@/lib/inspector";
import { NEWS_TYPE_LABELS } from "@/lib/labels";
import { withSelection } from "@/lib/navigation";
import type { News } from "@/types/news";
import { deleteNews, setNewsPublished } from "../actions";

// Aperçu d'une actualité, lu à la sélection d'une ligne. Date et heure en
// heure de Madagascar.
export default async function NewsInspector({
  id,
  returnTo,
}: {
  id: string;
  returnTo: string;
}) {
  const read = await readInspected<News>(`/admin/news/${id}`);
  if (read.status === "not-found") {
    return <InspectorNotFound />;
  }
  if (read.status === "error") {
    return <InspectorError />;
  }
  const news = read.data;

  return (
    <InspectorPanel
      title={news.title}
      marks={<PublishedMark isPublished={news.isPublished} />}
      actions={
        <>
          <LinkButton
            href={`/actualites/${news.id}?retour=${encodeURIComponent(returnTo)}`}
            variant="contained"
            size="small"
          >
            Ouvrir la fiche
          </LinkButton>
          <RowAction
            label={news.isPublished ? "Dépublier" : "Publier"}
            ariaLabel={`${news.isPublished ? "Dépublier" : "Publier"} ${news.title}`}
            action={setNewsPublished.bind(null, news.id, !news.isPublished, returnTo)}
          />
          <ConfirmDialog
            triggerLabel="Supprimer"
            ariaLabel={`Supprimer ${news.title}`}
            title="Confirmer la suppression"
            text={`L'actualité « ${news.title} » sera supprimée définitivement.`}
            action={deleteNews.bind(null, news.id, withSelection(returnTo, null))}
          />
        </>
      }
    >
      <FieldList
        labelWidth={110}
        fields={[
          { label: "Type", value: NEWS_TYPE_LABELS[news.type] },
          {
            label: "Date et heure",
            value: `${formatDateTime(news.date)} (Madagascar)`,
            numeric: true,
          },
          { label: "Année", value: news.rotaryYear.label, numeric: true },
          { label: "Lieu", value: news.location },
          {
            label: "Première publication",
            value: news.publishedAt ? formatDateTime(news.publishedAt) : null,
            numeric: true,
          },
        ]}
      />
      {news.summary && (
        <InspectorSection label="Résumé">
          <Typography variant="body2">{news.summary}</Typography>
        </InspectorSection>
      )}
    </InspectorPanel>
  );
}
