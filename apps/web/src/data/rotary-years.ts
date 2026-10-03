import { apiGet } from "@/lib/api";
import { rotaryYearOf } from "@/lib/rotary-year";
import type { RotaryYear } from "@/types/rotary-year";

interface ApiRotaryYear {
  label: string;
  isCurrent: boolean;
}

/**
 * Année Rotary en cours selon l'API. Sans année en cours, ou si l'API ne
 * répond pas : l'année du calendrier, qui est un fait et non un contenu.
 */
export async function getCurrentRotaryYear(): Promise<RotaryYear> {
  try {
    const { data } = await apiGet<{ data: ApiRotaryYear[] }>("/rotary-years");
    const current = data.find((year) => year.isCurrent);
    if (current) return current.label as RotaryYear;
  } catch {
    // Repli ci-dessous.
  }

  return rotaryYearOf(new Date().toISOString());
}
