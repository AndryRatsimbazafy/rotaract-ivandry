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

/** Un membre du club, tel qu'il se présente pour une année Rotary donnée. */
export interface Member {
  id: string;
  firstName: string;
  lastName: string;
  /** Profession ou études. */
  occupation?: string;
  /** Absent tant que l'API ne fournit pas de portrait. */
  portrait?: Photo;
  /** L'année Rotary de ce mandat. */
  rotaryYear: RotaryYear;
  /**
   * Fonctions exercées cette année-là : aucune, une ou plusieurs. D'une année
   * à l'autre, elles peuvent changer.
   */
  roles: MemberRole[];
  /** Rang d'affichage dans l'année, choisi par le club. */
  order: number;
}
