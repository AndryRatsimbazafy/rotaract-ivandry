// Libellés partagés par toutes les pages : un mot par notion.

export const rotaryYearLabel = "Année Rotary";

/** Mention des emplacements sans contenu. */
export const pendingLabel = "Contenu à venir";
export const photoPendingLabel = "Photographie à venir";

/**
 * État technique exceptionnel, pas un contenu éditorial : une liste longue
 * dont une partie n'a pas pu être lue.
 */
export const incompleteLabel = "Cette liste est incomplète pour le moment.";

/** Page introuvable (DESIGN.md, section 9). */
export const notFoundPage = {
  code: "404",
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
