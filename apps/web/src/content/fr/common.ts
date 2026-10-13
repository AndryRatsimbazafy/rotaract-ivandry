// Libellés partagés par toutes les pages : un mot par notion.

export const rotaryYearLabel: string = "Année Rotary";

/** Mention des emplacements sans contenu. */
export const pendingLabel: string = "Contenu à venir";
export const photoPendingLabel: string = "Photographie à venir";

/**
 * État technique exceptionnel, pas un contenu éditorial : une liste longue
 * dont une partie n'a pas pu être lue.
 */
export const incompleteLabel: string = "Cette liste est incomplète pour le moment.";

/** Page introuvable (DESIGN.md, section 9). */
export const notFoundPage = {
  code: "404",
  metaTitle: "Page introuvable",
  title: "Cette page n'existe pas, ou plus.",
  text: "L'adresse est peut-être ancienne, ou le contenu a été retiré.",
  links: [
    { href: "/", label: "Revenir à l'accueil" },
    { href: "/actions", label: "Voir les actions" },
    { href: "/actualites", label: "Lire les actualités" },
  ],
};

/** Page d'erreur : une phrase calme, la cause et la correction. */
export const errorPage = {
  title: "Le contenu n'a pas pu être chargé.",
  text: "Réessayez dans un instant.",
  retry: "Réessayer",
  home: "Revenir à l'accueil",
};

/** Habillage du site : navigation, menus, liens partagés. */
export const chrome = {
  siteDescription: "Site du Rotaract Club Ivandry",
  skipLink: "Aller au contenu",
  navigation: {
    home: "Accueil",
    actions: "Actions",
    news: "Actualités",
    members: "Membres",
    join: "Nous rejoindre",
  },
  mainNavLabel: "Navigation principale",
  footerNavLabel: "Navigation du pied de page",
  menu: {
    open: "Menu",
    title: "Sommaire",
    close: "Fermer",
    dialogLabel: "Menu",
    current: "Page affichée",
  },
  social: {
    listLabel: "Réseaux sociaux du club",
    /** « Facebook du club » */
    linkLabel: (network: string) => `${network} du club`,
    pending: (network: string) => `${network} : lien à venir`,
  },
  languages: {
    label: "Langue",
    fr: "Version française",
    en: "English version",
  },
  learnMore: "En savoir plus",
  /** « Photo : Rova R. » */
  photoCredit: (credit: string) => `Photo : ${credit}.`,
  /** Repère d'un passage en français sur une page anglaise. */
  inFrench: "En français",
};
