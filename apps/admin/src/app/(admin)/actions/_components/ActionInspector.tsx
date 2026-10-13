import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import ConfirmDialog from "@/components/ConfirmDialog";
import FieldList from "@/components/FieldList";
import {
  InspectorError,
  InspectorNotFound,
  InspectorPanel,
  InspectorSection,
} from "@/components/Inspector";
import ImageThumb from "@/components/ImageThumb";
import LinkButton from "@/components/LinkButton";
import RowAction from "@/components/RowAction";
import { PublishedMark } from "@/components/StatusMark";
import { formatDateTime, formatUtcDate } from "@/lib/dates";
import { readInspected } from "@/lib/inspector";
import { FOCUS_AREA_LABELS } from "@/lib/labels";
import { withSelection } from "@/lib/navigation";
import type { Action } from "@/types/action";
import { deleteAction, setActionPublished } from "../actions";

// Aperçu d'une action, lu à la sélection d'une ligne. returnTo : adresse de
// la liste, ligne choisie comprise.
export default async function ActionInspector({
  id,
  returnTo,
}: {
  id: string;
  returnTo: string;
}) {
  const read = await readInspected<Action>(`/admin/actions/${id}`);
  if (read.status === "not-found") {
    return <InspectorNotFound />;
  }
  if (read.status === "error") {
    return <InspectorError />;
  }
  const action = read.data;
  const impact = action.impact;
  const partners = impact?.partners?.join(", ");
  const impactFields = [
    { label: "Objectif", value: impact?.objective },
    { label: "Bénéficiaires", value: impact?.beneficiaries },
    { label: "Lieu", value: impact?.location },
    { label: "Période", value: impact?.period },
    { label: "Partenaires", value: partners },
    { label: "Résultats", value: impact?.results },
    // Rubriques renseignées seulement : pas de donnée, pas de ligne.
  ].filter(({ value }) => Boolean(value));

  return (
    <InspectorPanel
      title={action.title}
      marks={<PublishedMark isPublished={action.isPublished} />}
      actions={
        <>
          <LinkButton
            href={`/actions/${action.id}?retour=${encodeURIComponent(returnTo)}`}
            variant="contained"
            size="small"
          >
            Ouvrir la fiche
          </LinkButton>
          <RowAction
            label={action.isPublished ? "Dépublier" : "Publier"}
            ariaLabel={`${action.isPublished ? "Dépublier" : "Publier"} ${action.title}`}
            action={setActionPublished.bind(null, action.id, !action.isPublished, returnTo)}
          />
          <ConfirmDialog
            triggerLabel="Supprimer"
            ariaLabel={`Supprimer ${action.title}`}
            title="Confirmer la suppression"
            text={`L'action « ${action.title} » sera supprimée définitivement.`}
            action={deleteAction.bind(null, action.id, withSelection(returnTo, null))}
          />
        </>
      }
    >
      {action.photos[0] && (
        <Box sx={{ mb: 2 }}>
          <ImageThumb
            url={action.photos[0].url}
            alt={action.photos[0].alt}
            focus={action.photos[0].focus}
            ratio="3 / 2"
            sizes="360px"
          />
        </Box>
      )}
      <FieldList
        labelWidth={110}
        fields={[
          { label: "Date", value: formatUtcDate(action.date), numeric: true },
          { label: "Année", value: action.rotaryYear.label, numeric: true },
          {
            label: "Photographies",
            value: action.photos.length > 0 ? String(action.photos.length) : null,
            numeric: true,
          },
          {
            label: "Ordre",
            value: action.order === null ? null : String(action.order),
            numeric: true,
          },
          {
            label: "Première publication",
            value: action.publishedAt ? formatDateTime(action.publishedAt) : null,
            numeric: true,
          },
        ]}
      />
      {action.summary && (
        <InspectorSection label="Résumé">
          <Typography variant="body2">{action.summary}</Typography>
        </InspectorSection>
      )}
      {action.focusAreas.length > 0 && (
        <InspectorSection label="Domaines">
          <Box component="ul" sx={{ m: 0, pl: 2.25, typography: "body2" }}>
            {action.focusAreas.map((area) => (
              <li key={area}>{FOCUS_AREA_LABELS[area]}</li>
            ))}
          </Box>
        </InspectorSection>
      )}
      {impactFields.length > 0 && (
        <InspectorSection label="Impact">
          <FieldList labelWidth={110} fields={impactFields} />
        </InspectorSection>
      )}
    </InspectorPanel>
  );
}
