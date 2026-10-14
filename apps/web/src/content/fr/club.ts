import { routes } from "@/config/routes";

// Page « Le club » (fonctionnalité 015). L'histoire est saisie dans le Back
// Office ; ici, les textes fixes seulement, sans chiffre ni date inventés.

export const opening = {
  title: "Le club",
  lede: "Qui nous sommes, d'où nous venons, et les années qui ont fait le club.",
  photoBrief: "La vie du club : une réunion, un moment d'équipe.",
};

export const history = {
  label: "Histoire",
  title: "Notre histoire",
};

export const rotary = {
  label: "Rotaract et Rotary",
  term: "Rotaract",
  grammar: "nom masculin",
  definition:
    "Programme du Rotary International pour les jeunes adultes. Chaque club Rotaract est parrainé par un Rotary club, qui l'accompagne ; ses membres choisissent et mènent leurs propres actions au service de leur communauté, et prennent part à la vie du réseau Rotary.",
  sponsorLabel: "Club parrain",
};

export const figures = {
  label: "En chiffres",
  title: "Le club en chiffres",
  labels: {
    foundedYear: "Année de création",
    memberCount: "Membres",
    actionCount: "Actions publiées",
    yearCount: "Années Rotary sur la frise",
  },
};

export const timeline = {
  label: "Les années",
  title: "Les années du club",
  intro: "Pour chaque année Rotary, la présidence et les actions qui l'ont marquée.",
  presidency: (count: number): string => (count > 1 ? "Présidence partagée" : "Présidence"),
  actionsLabel: "Actions marquantes",
  /** Nom lisible de l'année, doublant le chiffre au trait. */
  yearTitle: (year: string) => `Année Rotary ${year}`,
};

export const onward = {
  label: "Poursuivre",
  links: [
    { href: routes.actions, label: "Voir les actions" },
    { href: routes.members, label: "Rencontrer les membres" },
  ],
};
