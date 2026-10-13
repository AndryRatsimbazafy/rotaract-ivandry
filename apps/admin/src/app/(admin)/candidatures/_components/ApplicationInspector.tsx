import Button from "@mui/material/Button";
import FieldList from "@/components/FieldList";
import {
  InspectorError,
  InspectorNotFound,
  InspectorPanel,
  InspectorSection,
} from "@/components/Inspector";
import LinkButton from "@/components/LinkButton";
import { formatDateTime } from "@/lib/dates";
import { readInspected } from "@/lib/inspector";
import { APPLICANT_STATUS_LABELS } from "@/lib/labels";
import type { Application } from "@/types/application";
import { cvType, fileSize } from "./cv";

// Aperçu d'une candidature : coordonnées, situation, CV. Le CV se télécharge
// par le Back Office, jamais par une adresse de stockage.
export default async function ApplicationInspector({
  id,
  returnTo,
}: {
  id: string;
  returnTo: string;
}) {
  const read = await readInspected<Application>(`/admin/applications/${id}`);
  if (read.status === "not-found") {
    return <InspectorNotFound />;
  }
  if (read.status === "error") {
    return <InspectorError />;
  }
  const application = read.data;

  return (
    <InspectorPanel
      title={`${application.firstName} ${application.lastName}`}
      actions={
        <>
          <Button
            component="a"
            href={`/candidatures/${application.id}/cv`}
            variant="contained"
            size="small"
          >
            Télécharger le CV
          </Button>
          <Button
            component="a"
            href={`mailto:${application.email}`}
            variant="outlined"
            size="small"
          >
            Contacter par email
          </Button>
          <LinkButton
            href={`/candidatures/${application.id}?retour=${encodeURIComponent(returnTo)}`}
            size="small"
          >
            Ouvrir la fiche
          </LinkButton>
        </>
      }
    >
      <FieldList
        labelWidth={110}
        fields={[
          { label: "Email", value: application.email },
          { label: "Téléphone", value: application.phone, numeric: true },
          {
            label: "Situation",
            value: APPLICANT_STATUS_LABELS[application.applicantStatus],
          },
          {
            label: "Date de candidature",
            value: formatDateTime(application.createdAt),
            numeric: true,
          },
        ]}
      />
      <InspectorSection label="CV">
        <FieldList
          labelWidth={110}
          fields={[
            { label: "Fichier", value: application.cv.name },
            { label: "Type", value: cvType(application.cv.mimeType) },
            { label: "Taille", value: fileSize(application.cv.size), numeric: true },
          ]}
        />
      </InspectorSection>
    </InspectorPanel>
  );
}
