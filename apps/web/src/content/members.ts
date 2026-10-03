// Textes de la page Membres.

import { routes } from "@/config/routes";
import type { MemberRole } from "@/types/member";
import { rotaryYearLabel } from "./common";

/** Les fonctions du club, dans l'ordre où le club les énonce. */
export const memberRoleLabels: Record<MemberRole, string> = {
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

export const membersOpening = {
  label: "Le collectif",
  title: "Les membres",
  lede: "Le Rotaract Club Ivandry rassemble de jeunes professionnels et des étudiants. Ils font vivre le club, ses actions et sa camaraderie.",
  groupPhotoBrief: "Les membres du club, réunis pour l'année Rotary.",
  yearsLabel: rotaryYearLabel,
  currentYear: "Année affichée",
};

export const membersDirectory = {
  number: "01",
  label: "L'annuaire",
  yearLabel: rotaryYearLabel,
  countOne: "membre",
  countMany: "membres",
  portraitBrief: "Portrait.",
  /** Libellé accessible de l'attente pendant la lecture de l'annuaire. */
  loadingLabel: "Chargement des membres",
  /** Suivi de l'année, par exemple « … 2025-2026 ne sont pas encore publiés. » */
  emptyBefore: "Les membres de l'année",
  emptyAfter: "ne sont pas encore publiés.",
  backToCurrent: "Voir l'année en cours",
};

export const membersFunctions = {
  number: "02",
  label: "Les fonctions",
  title: "Qui fait quoi",
  intro: "Une même personne peut tenir plusieurs fonctions au cours d'une année.",
  vacant: "Non attribuée",
};

export const membersOnward = {
  label: "Poursuivre",
  links: [
    { href: routes.actions, label: "Voir nos actions" },
    { href: routes.news, label: "Lire les actualités" },
  ],
};
