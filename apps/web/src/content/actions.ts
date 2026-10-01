// Textes de la page Actions.
// Aucune donnée n'est inventée : quand une information manque, la page affiche
// un emplacement discret.

import { rotaryYearLabel } from "./common";
import { latestActions } from "./home";

export const actionsOpening = {
  label: "Sur le terrain",
  titleLines: ["Nos", "actions"],
  lede: "Chaque action répond à un besoin concret de la communauté. Voici ce que le club a entrepris, et ce que cela a changé.",
  yearLabel: rotaryYearLabel,
  countLabel: "Actions publiées",
  mainPhotoBrief: "Une action en cours : des gestes, des visages.",
  detailPhotoBrief: "Un détail de la même action.",
};

export const actionDefinition = {
  number: "01",
  label: "Définition",
  title: "Qu'est-ce qu'une action ?",
  term: "Action",
  grammar: "nom féminin",
  definition:
    "Projet ou activité porté par le club pour répondre à un besoin concret et produire un impact dans la communauté.",
  // Les trois termes de la définition, sans rien y ajouter.
  criteria: [
    "Un besoin concret",
    "Un projet porté par le club",
    "Un impact dans la communauté",
  ],
};

export const actionsIndex = {
  number: "02",
  label: "Les projets",
  title: "Toutes les actions",
  filtersLabel: "Filtrer les actions",
  yearFilter: { label: rotaryYearLabel, all: "Toutes" },
  areaFilter: { label: "Domaine d'action", all: "Tous les domaines" },
  yearLabel: rotaryYearLabel,
  moreLabel: "Fiche de l'action",
  photoBrief: "Photographie principale de l'action.",
  impactLabels: {
    objective: "Objectif",
    beneficiaries: "Bénéficiaires",
    location: "Lieu",
    period: "Période",
    partners: "Partenaires",
    results: "Résultats",
  },
  empty: "Aucune action ne correspond à ces filtres.",
  reset: "Voir toutes les actions",
  // Affiché tant qu'aucune action n'est publiée : le même emplacement que sur l'accueil.
  placeholder: latestActions.placeholder,
};

export const impactLedger = {
  number: "03",
  label: "Impact",
  title: "Ce que les actions ont changé",
  intro: "Le cumul de toutes les actions du club, mis à jour à chaque publication.",
  pending: "Donnée à venir",
};
