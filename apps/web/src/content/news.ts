// Textes de la page Actualités.
// Aucune donnée n'est inventée : quand une information manque, la page affiche
// un emplacement discret.

export const newsOpening = {
  label: "Journal du club",
  titleLines: ["Dans la vie", "du club"],
  lede: "Réunions, formations, rencontres, événements : ce qui se passe au club, au fil de l'année.",
  yearLabel: "Année Rotary",
  countLabel: "Actualités publiées",
};

export const newsFeature = {
  number: "01",
  label: "À la une",
  more: "Lire la suite",
  locationLabel: "Lieu",
  photoBrief: "Le moment fort de cette actualité.",
  // Affiché tant qu'aucune actualité n'est publiée.
  placeholder: {
    day: "00",
    month: "Mois, année",
    type: "Rubrique",
    title: "Titre de l'actualité à la une",
    summary: "Court résumé de l'actualité.",
  },
};

export const newsRegister = {
  number: "02",
  label: "Le fil",
  title: "Toutes les actualités",
  rubricsLabel: "Rubriques",
  allRubrics: "Tout",
  columns: { date: "Date", title: "Actualité", type: "Rubrique" },
  more: "Lire la suite",
  thumbBrief: "Vignette.",
  empty: "Aucune actualité n'est encore publiée.",
  noMatch: "Aucune actualité ne correspond à ce choix.",
  reset: "Voir toutes les actualités",
  onlyFeature: "L'actualité à la une est la seule publiée pour ce choix.",
};

export const newsArchives = {
  number: "03",
  label: "Archives",
  title: "Par année Rotary",
  intro: "Chaque année Rotary commence le 1er juillet.",
  all: "Toutes les années",
  current: "Année affichée",
  countOne: "actualité",
  countMany: "actualités",
  pending: "Contenu à venir",
};

export const newsOnward = {
  label: "Poursuivre",
  links: [
    { href: "/actions", label: "Voir nos actions" },
    { href: "/membres", label: "Rencontrer les membres" },
  ],
};
