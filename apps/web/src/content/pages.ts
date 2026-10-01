// Plan des pages publiques qui ne sont pas encore conçues : textes d'identification et sections prévues.
// Structure provisoire, remplacée section par section lors de la conception des pages.

export interface SectionOutline {
  /** Ancre de la section dans la page. */
  id: string;
  title: string;
  /** Ce que la section devra contenir. */
  summary?: string;
}

export interface PageOutline {
  title: string;
  /** Description utilisée pour les métadonnées de la page. */
  description: string;
  objective: string;
  sections: SectionOutline[];
  /** Éléments prévus hors de cette page (pages de détail, par exemple). */
  later?: string[];
}

export const actionsPage: PageOutline = {
  title: "Actions",
  description: "Les actions du Rotaract Club Ivandry et leur impact.",
  objective: "Montrer les actions du club et leur impact.",
  sections: [
    { id: "presentation", title: "Ce qu'est une action du club" },
    { id: "filtres", title: "Filtres" },
    { id: "liste", title: "Liste des actions" },
    { id: "rejoindre", title: "Nous rejoindre" },
  ],
  later: [
    "Détail d'une action",
    "Plusieurs photos par action",
    "Informations d'impact",
  ],
};

export const newsPage: PageOutline = {
  title: "Actualités",
  description: "Les actualités et les événements du Rotaract Club Ivandry.",
  objective: "Communiquer sur les actualités et les événements du club.",
  sections: [
    {
      id: "liste",
      title: "Liste chronologique des actualités",
      summary: "Actualités du club et événements auxquels il a participé.",
    },
  ],
  later: [
    "Détail d'une actualité",
    "Plusieurs photos par actualité",
    "Informations relatives à l'événement",
  ],
};

export const membersPage: PageOutline = {
  title: "Membres",
  description: "Les membres du Rotaract Club Ivandry.",
  objective: "Présenter les membres du club et leurs fonctions.",
  sections: [
    { id: "annee", title: "Filtre par année Rotary" },
    {
      id: "liste",
      title: "Liste des membres",
      summary:
        "Prénom et nom, fonctions, profession ou études, année Rotary. Un membre peut avoir plusieurs fonctions au cours d'une même année.",
    },
  ],
};

export const joinPage: PageOutline = {
  title: "Nous rejoindre",
  description: "Le parcours pour rejoindre le Rotaract Club Ivandry.",
  objective:
    "Expliquer le parcours pour rejoindre le club et recueillir les candidatures.",
  sections: [
    { id: "introduction", title: "Introduction : le club" },
    { id: "actions", title: "Lien vers les actions" },
    { id: "acces-candidature", title: "Lien vers le formulaire de candidature" },
    { id: "four-way-test", title: "Les questions du Four-Way Test du Rotary" },
    { id: "valeurs", title: "Les valeurs Rotary" },
    {
      id: "parcours",
      title: "Le parcours d'adhésion",
      summary:
        "Candidature, invitation à une réunion ou une action, participation, devenir membre.",
    },
    {
      id: "sympathisant",
      title: "Le statut de sympathisant",
      summary:
        "Pas encore membre. Peut participer aux réunions, aux actions et aux moments de camaraderie. Devient membre après validation par l'Assemblée Générale.",
    },
    {
      id: "candidature",
      title: "Formulaire de candidature",
      summary:
        "Prénom, nom, email, téléphone, étudiant ou professionnel, CV.",
    },
    { id: "faq", title: "Questions fréquentes" },
  ],
};
