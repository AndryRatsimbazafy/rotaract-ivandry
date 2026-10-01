import type { Photo } from "./media";
import type { RotaryYear } from "./rotary-year";

/** Les fonctions du club. Aucune hiérarchie entre elles. */
export type MemberRole =
  | "president"
  | "vice-president"
  | "tresorier"
  | "responsable-action"
  | "responsable-image-publique"
  | "responsable-camaraderie"
  | "responsable-effectif"
  | "responsable-fondation"
  | "protocole"
  | "secretaire";

/** Présence d'un membre au club pour une année Rotary donnée. */
export interface MemberMandate {
  rotaryYear: RotaryYear;
  /**
   * Fonctions exercées cette année-là. Un membre peut en cumuler plusieurs
   * au cours d'une même année ; la liste est vide pour un membre sans fonction.
   * D'une année à l'autre, elles peuvent changer.
   */
  roles: MemberRole[];
}

export interface Member {
  id: string;
  firstName: string;
  lastName: string;
  /** Profession ou études. */
  occupation?: string;
  portrait?: Photo;
  /** Une entrée par année Rotary. */
  mandates: MemberMandate[];
  /** Profil fictif, montré comme un emplacement et jamais comme une personne. */
  isDemo?: boolean;
}
