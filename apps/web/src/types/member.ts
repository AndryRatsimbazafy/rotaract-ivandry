import type { Photo } from "./media";
import type { RotaryYear } from "./rotary-year";

/** Présence d'un membre au club pour une année Rotary donnée. */
export interface MemberMandate {
  rotaryYear: RotaryYear;
  /**
   * Fonctions exercées cette année-là. Un membre peut en cumuler plusieurs
   * au cours d'une même année ; la liste est vide pour un membre sans fonction.
   */
  roles: string[];
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
}
