import PageHeader from "@/components/PageHeader";
import { apiRead } from "@/lib/api";
import { formatDateTime } from "@/lib/dates";
import { APPLICANT_STATUS_LABELS } from "@/lib/labels";
import { param, safeReturnPath } from "@/lib/navigation";
import type { Application } from "@/types/application";
import ApplicationDetail from "../_components/ApplicationDetail";

const CV_ERRORS: Record<string, string> = {
  introuvable: "Le fichier du CV est introuvable.",
  indisponible: "Service indisponible.",
};

const CV_TYPES: Record<string, string> = {
  "application/pdf": "PDF",
  "application/msword": "Word (DOC)",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
    "Word (DOCX)",
};

function fileSize(bytes: number): string {
  const format = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 1 });
  return bytes < 1024 * 1024
    ? `${format.format(Math.max(1, Math.round(bytes / 1024)))} Ko`
    : `${format.format(bytes / (1024 * 1024))} Mo`;
}

export default async function CandidaturePage({
  params,
  searchParams,
}: PageProps<"/candidatures/[id]">) {
  const { id } = await params;
  const query = await searchParams;
  const returnTo = safeReturnPath(param(query, "retour"), "/candidatures");
  const application = await apiRead<Application>(`/admin/applications/${id}`);
  const name = `${application.firstName} ${application.lastName}`;

  return (
    <>
      <PageHeader title={`Candidature de ${name}`} />
      <ApplicationDetail
        application={{
          id: application.id,
          name,
          email: application.email,
          fields: [
            { label: "Prénom", value: application.firstName },
            { label: "Nom", value: application.lastName },
            { label: "Email", value: application.email },
            { label: "Téléphone", value: application.phone },
            {
              label: "Situation",
              value: APPLICANT_STATUS_LABELS[application.applicantStatus],
            },
            {
              label: "Date de candidature",
              value: formatDateTime(application.createdAt),
            },
          ],
          cv: {
            name: application.cv.name,
            type: CV_TYPES[application.cv.mimeType] ?? "Document",
            size: fileSize(application.cv.size),
          },
        }}
        cvError={CV_ERRORS[param(query, "cv")]}
        returnTo={returnTo}
      />
    </>
  );
}
