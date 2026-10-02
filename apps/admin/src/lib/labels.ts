import type { FocusArea } from "@/types/action";
import type { ApplicantStatus } from "@/types/application";
import type { MemberRole } from "@/types/member";
import type { NewsType } from "@/types/news";

// Libellés d'ARCHITECTURE.md, section 1. La valeur technique n'est jamais
// affichée.
export const MEMBER_ROLE_LABELS: Record<MemberRole, string> = {
  president: "Président",
  "vice-president": "Vice président",
  tresorier: "Trésorier",
  "responsable-action": "Responsable action",
  "responsable-image-publique": "Responsable Image publique",
  "responsable-camaraderie": "Responsable camaraderie",
  "responsable-effectif": "Responsable effectif",
  "responsable-fondation": "Responsable fondation",
  protocole: "Protocole",
  secretaire: "Secrétaire",
};

export const FOCUS_AREA_LABELS: Record<FocusArea, string> = {
  paix: "Construction de paix et prévention des conflits",
  maladies: "Prévention et traitement des maladies",
  eau: "Eau, assainissement et hygiène",
  sante: "Santé des mères et des enfants",
  education: "Alphabétisation et éducation de base",
  economie: "Développement économique local",
  environnement: "Environnement",
};

export const NEWS_TYPE_LABELS: Record<NewsType, string> = {
  evenement: "Événement",
  participation: "Participation",
  reunion: "Réunion",
  formation: "Formation",
  annonce: "Annonce",
};

export const APPLICANT_STATUS_LABELS: Record<ApplicantStatus, string> = {
  etudiant: "Étudiant",
  professionnel: "Professionnel",
};

export type Option = { value: string; label: string };

function options<T extends string>(labels: Record<T, string>): Option[] {
  return (Object.keys(labels) as T[]).map((value) => ({
    value,
    label: labels[value],
  }));
}

export const MEMBER_ROLE_OPTIONS = options(MEMBER_ROLE_LABELS);
export const FOCUS_AREA_OPTIONS = options(FOCUS_AREA_LABELS);
export const NEWS_TYPE_OPTIONS = options(NEWS_TYPE_LABELS);

export const PUBLISHED_OPTIONS: Option[] = [
  { value: "true", label: "Publié" },
  { value: "false", label: "Brouillon" },
];
