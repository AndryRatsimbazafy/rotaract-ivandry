import type { FaqQuestionId, SitePhotoSlot } from "@/types/site-settings";
import { PHOTO_MIN_WIDTH } from "@/types/media";

// Écran « Site » : description des emplacements photographiques fixes du site
// public. Les descriptions reprennent celles des gabarits du Front Office
// (apps/web/src/content/*.ts).

// Largeur conseillée d'une photographie à bord perdu (DESIGN.md, section 7).
const WIDE_MIN_WIDTH = 2400;

export type SitePhotoSlotInfo = {
  slot: SitePhotoSlot;
  page: string;
  label: string;
  // Rapport du cadre, en syntaxe CSS.
  ratio: string;
  format: string;
  recommendedWidth: number;
  brief: string;
  emptyText: string;
};

export const SITE_PHOTO_SLOTS: SitePhotoSlotInfo[] = [
  {
    slot: "accueil-ouverture",
    page: "Accueil",
    label: "Ouverture",
    ratio: "16 / 9",
    format: "16:9",
    recommendedWidth: WIDE_MIN_WIDTH,
    brief: "Une action du club, sur le terrain.",
    emptyText: "Photographie livrée avec le site.",
  },
  {
    slot: "accueil-club",
    page: "Accueil",
    label: "Le club",
    ratio: "4 / 5",
    format: "4:5",
    recommendedWidth: PHOTO_MIN_WIDTH,
    brief: "La vie du club : une réunion, un moment d'équipe.",
    emptyText: "Aucune photographie.",
  },
  {
    slot: "accueil-rejoindre",
    page: "Accueil",
    label: "Appel Nous rejoindre",
    ratio: "4 / 5",
    format: "4:5",
    recommendedWidth: PHOTO_MIN_WIDTH,
    brief: "Un moment de camaraderie.",
    emptyText: "Aucune photographie.",
  },
  {
    slot: "actions-ouverture",
    page: "Actions",
    label: "Ouverture, grande",
    ratio: "4 / 5",
    format: "4:5",
    recommendedWidth: PHOTO_MIN_WIDTH,
    brief: "Une action en cours : des gestes, des visages.",
    emptyText: "Aucune photographie.",
  },
  {
    slot: "actions-detail",
    page: "Actions",
    label: "Ouverture, détail",
    ratio: "3 / 2",
    format: "3:2",
    recommendedWidth: PHOTO_MIN_WIDTH,
    brief: "Un détail de la même action.",
    emptyText: "Aucune photographie.",
  },
  {
    slot: "membres-ouverture",
    page: "Membres",
    label: "Ouverture",
    ratio: "2 / 1",
    format: "2:1",
    recommendedWidth: WIDE_MIN_WIDTH,
    brief: "Les membres du club, réunis pour l'année Rotary.",
    emptyText: "Aucune photographie.",
  },
  {
    slot: "rejoindre-ouverture",
    page: "Nous rejoindre",
    label: "Ouverture",
    ratio: "4 / 5",
    format: "4:5",
    recommendedWidth: PHOTO_MIN_WIDTH,
    brief: "Une image propre au recrutement.",
    emptyText: "Reprend l'ouverture de l'accueil.",
  },
];

// Questions fréquentes de « Nous rejoindre ». Copie des intitulés et des
// réponses de apps/web/src/content/join.ts : ils servent d'intitulés des champs
// et de valeur initiale tant que rien n'est enregistré. Les quatre réponses
// déjà publiées ne se vident pas.
export type FaqQuestionInfo = {
  id: FaqQuestionId;
  question: string;
  currentAnswer: string;
  required: boolean;
};

export const FAQ_QUESTIONS: FaqQuestionInfo[] = [
  { id: "qui", question: "Qui peut candidater ?", currentAnswer: "", required: false },
  {
    id: "rencontre",
    question: "Comment se déroule une première rencontre ?",
    currentAnswer:
      "Après votre candidature, le club vous invite à une réunion ou à une action.",
    required: true,
  },
  {
    id: "sympathisant",
    question: "Qu'est-ce qu'un sympathisant ?",
    currentAnswer:
      "Un sympathisant n'est pas encore membre du club, mais il peut participer aux réunions, aux actions et aux moments de camaraderie.\n\nAprès validation par l'Assemblée Générale, il devient membre.",
    required: true,
  },
  {
    id: "avant",
    question: "Peut-on participer aux actions avant de devenir membre ?",
    currentAnswer:
      "Oui. Un sympathisant peut participer aux réunions, aux actions et aux moments de camaraderie.",
    required: true,
  },
  {
    id: "membre",
    question: "Comment devient-on officiellement membre ?",
    currentAnswer:
      "Le sympathisant devient membre après validation par l'Assemblée Générale.",
    required: true,
  },
  {
    id: "frequence",
    question: "À quelle fréquence le club se réunit-il ?",
    currentAnswer: "",
    required: false,
  },
];

export const FAQ_REQUIRED_MESSAGE = "Cette question a besoin d'une réponse.";
