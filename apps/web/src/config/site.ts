export interface SocialLink {
  id: "facebook" | "instagram";
  label: string;
  /** Adresse du compte. Vide tant que le club ne l'a pas fournie. */
  href: string;
}

const social: SocialLink[] = [
  { id: "facebook", label: "Facebook", href: "" },
  { id: "instagram", label: "Instagram", href: "" },
];

export const site = {
  name: "Rotaract Club Ivandry",
  /** Le nom en deux temps, pour la signature typographique. */
  nameLines: ["Rotaract", "Club Ivandry"],
  location: "Antananarivo, Madagascar",
  /** Signature du club, fond transparent (tirée de logo-club.png, dont le fond est blanc). */
  logo: { src: "/images/logo-club-transparent.png", width: 960, height: 299 },
  /** Réseaux sociaux. Une adresse vide affiche l'icône sans lien. */
  social,
  description: "Site du Rotaract Club Ivandry",
  lang: "fr",
  locale: "fr_FR",
} as const;
