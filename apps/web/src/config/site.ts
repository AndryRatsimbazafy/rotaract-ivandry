export interface SocialLink {
  id: "facebook" | "instagram";
  label: string;
}

/** Les adresses se saisissent dans le Back Office (réglages du site). */
const social: SocialLink[] = [
  { id: "facebook", label: "Facebook" },
  { id: "instagram", label: "Instagram" },
];

export const site = {
  name: "Rotaract Club Ivandry",
  /** Le nom en deux temps, pour la signature typographique. */
  nameLines: ["Rotaract", "Club Ivandry"],
  location: "Antananarivo, Madagascar",
  /** Signature du club, fond transparent (tirée de logo-club.png, dont le fond est blanc). */
  logo: { src: "/images/logo-club-transparent.png", width: 960, height: 299 },
  /** Réseaux sociaux ; sans adresse, l'icône s'affiche sans lien. */
  social,
  description: "Site du Rotaract Club Ivandry",
  lang: "fr",
  locale: "fr_FR",
} as const;
