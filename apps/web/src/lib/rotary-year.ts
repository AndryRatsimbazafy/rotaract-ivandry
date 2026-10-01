import type { RotaryYear } from "@/types/rotary-year";

/** Année Rotary en cours : du 1er juillet 2026 au 30 juin 2027. */
export const currentRotaryYear: RotaryYear = "2026-2027";

/** Année Rotary d'une date : elle commence le 1er juillet. */
export function rotaryYearOf(isoDate: string): RotaryYear {
  const date = new Date(isoDate);
  const year = date.getUTCFullYear();
  const start = date.getUTCMonth() >= 6 ? year : year - 1;

  return `${start}-${start + 1}`;
}
