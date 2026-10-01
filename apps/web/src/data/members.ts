import type { Member } from "@/types/member";
import type { RotaryYear } from "@/types/rotary-year";

/** Année Rotary en cours : du 1er juillet 2026 au 30 juin 2027. */
export const currentRotaryYear: RotaryYear = "2026-2027";

// Aucun membre n'est encore publié. Cette fonction sera remplacée par un
// appel à l'API sans que les pages aient à changer.
export async function getFeaturedMembers(limit: number): Promise<Member[]> {
  const members: Member[] = [];
  return members.slice(0, limit);
}

/** Fonctions d'un membre pour une année donnée : aucune, une ou plusieurs. */
export function rolesForYear(member: Member, year: RotaryYear): string[] {
  return member.mandates
    .filter((mandate) => mandate.rotaryYear === year)
    .flatMap((mandate) => mandate.roles);
}
