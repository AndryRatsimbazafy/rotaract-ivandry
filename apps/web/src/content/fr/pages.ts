// Titre et description de chaque page, pour l'onglet et les moteurs de recherche.

export interface PageMeta {
  title: string;
  description: string;
}

export const actionsPage: PageMeta = {
  title: "Actions",
  description: "Les actions du Rotaract Club Ivandry et leur impact.",
};

export const newsPage: PageMeta = {
  title: "Actualités",
  description: "Les actualités et les événements du Rotaract Club Ivandry.",
};

export const membersPage: PageMeta = {
  title: "Membres",
  description: "Les membres du Rotaract Club Ivandry.",
};

export const joinPage: PageMeta = {
  title: "Nous rejoindre",
  description: "Le parcours pour rejoindre le Rotaract Club Ivandry.",
};
