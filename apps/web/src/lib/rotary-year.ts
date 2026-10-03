import type { RotaryYear } from "@/types/rotary-year";

/**
 * Année Rotary d'une date : elle commence le 1er juillet. Ne sert qu'au repli
 * de l'année en cours, quand l'API n'en fournit pas.
 */
export function rotaryYearOf(isoDate: string): RotaryYear {
  const date = new Date(isoDate);
  const year = date.getUTCFullYear();
  const start = date.getUTCMonth() >= 6 ? year : year - 1;

  return `${start}-${start + 1}`;
}
