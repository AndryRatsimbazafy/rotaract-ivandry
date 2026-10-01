// Textes de la page d'accueil.
// Aucune donnée n'est inventée : quand une information manque, la page affiche
// un emplacement discret (voir les libellés « placeholder »).

import type { Photo } from "@/types/media";
import { rotaryYearLabel } from "./common";

export const opening = {
  label: "Journal du club",
  lede: "Un club de jeunes adultes engagés au service de leur communauté.",
  primaryAction: "Voir nos actions",
  continueReading: "Découvrir le club",
  photoBrief: "Une action du club, sur le terrain.",
  photo: {
    src: "/images/Image-16-9.jpeg",
    width: 6043,
    height: 3399,
    alt: "Deux jeunes hommes en t-shirt blanc versent l'eau d'un jerrican jaune, entourés d'habitants.",
    focus: "50% 32%",
  } satisfies Photo,
};

export const about = {
  number: "01",
  label: "Le club",
  title: "Qui sommes-nous ?",
  statement:
    "Le Rotaract Club Ivandry réunit de jeunes adultes qui donnent de leur temps pour mener des actions utiles autour d'eux.",
  paragraphs: [
    "Le Rotaract fait partie de la famille du Rotary, un réseau mondial de clubs de service.",
  ],
  // À remplacer par le texte du club.
  pending:
    "Présentation à compléter : année de création, club parrain, nombre de membres, lieu et rythme des réunions.",
  photoBrief: "La vie du club : une réunion, un moment d'équipe.",
};

export interface RotaryValue {
  name: string;
  description: string;
}

export const rotaryValues: {
  number: string;
  label: string;
  title: string;
  values: RotaryValue[];
} = {
  number: "02",
  label: "Nos valeurs",
  title: "Les valeurs du Rotary",
  values: [
    {
      name: "Service",
      description:
        "Servir d'abord l'intérêt général au sein de notre communauté.",
    },
    {
      name: "Camaraderie",
      description:
        "Créer des liens d'amitié solides entre jeunes professionnels.",
    },
    {
      name: "Leadership",
      description:
        "Développer des compétences et former les leaders de demain.",
    },
    {
      name: "Diversité",
      description: "Réunir des profils variés autour d'une cause commune.",
    },
    {
      name: "Intégrité",
      description: "Agir avec éthique, transparence et responsabilité.",
    },
  ],
};

export interface FocusArea {
  /** Identifiant stable, utilisé pour classer et filtrer les actions. */
  id: string;
  title: string;
  description?: string;
  href?: string;
}

export const focusAreas: {
  number: string;
  label: string;
  count: string;
  title: string;
  intro: string;
  areas: FocusArea[];
} = {
  number: "03",
  label: "Nos causes",
  count: "7",
  title: "axes stratégiques",
  intro: "Les causes sur lesquelles le Rotary concentre son action dans le monde.",
  areas: [
    { id: "paix", title: "Construction de paix et prévention des conflits" },
    { id: "maladies", title: "Prévention et traitement des maladies" },
    { id: "eau", title: "Eau, assainissement et hygiène" },
    { id: "sante", title: "Santé des mères et des enfants" },
    { id: "education", title: "Alphabétisation et éducation de base" },
    { id: "economie", title: "Développement économique local" },
    { id: "environnement", title: "Environnement" },
  ],
};

export const latestActions = {
  number: "04",
  label: "Sur le terrain",
  title: "Actions récentes",
  allLink: "Toutes les actions",
  yearLabel: rotaryYearLabel,
  impactLabel: "Impact",
  photoBrief: "Une action du club.",
  // Affiché tant qu'aucune action n'est publiée.
  placeholder: {
    meta: rotaryYearLabel,
    title: "Titre de l'action",
    summary: "Courte description de l'action.",
    impact: "Ce que l'action a changé, et pour qui.",
  },
};

export const latestNews = {
  number: "05",
  label: "Vie du club",
  title: "Actualités récentes",
  allLink: "Toutes les actualités",
};

export const membersPreview = {
  number: "06",
  label: "Le collectif",
  title: "Les membres",
  yearLabel: rotaryYearLabel,
  allLink: "Tous les membres",
  portraitBrief: "Portrait d'un membre.",
  // Affiché tant qu'aucun membre n'est publié.
  placeholder: {
    name: "Prénom Nom",
    roles: "Fonction",
  },
};

export const joinField = {
  number: "07",
  title: "Envie de vous engager ?",
  text: "Le club accueille les jeunes adultes qui veulent agir pour leur communauté.",
  pathLabel: "Le parcours d'adhésion",
  path: [
    "Candidature",
    "Invitation à une réunion ou une action",
    "Participation",
    "Devenir membre",
  ],
  photoBrief: "Un moment de camaraderie.",
};
