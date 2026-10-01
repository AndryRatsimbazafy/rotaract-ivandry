import type { Member, MemberRole } from "@/types/member";
import type { RotaryYear } from "@/types/rotary-year";

/** Année Rotary en cours : du 1er juillet 2026 au 30 juin 2027. */
export const currentRotaryYear: RotaryYear = "2026-2027";

// Aucun membre réel n'est encore publié. Ces profils de démonstration montrent
// la composition de la page et les cas à gérer (plusieurs fonctions, aucune
// fonction). Ils seront remplacés par les données de l'API, dans le même format.
// L'ordre du tableau est l'ordre d'affichage : c'est le club qui le choisit.
function demo(index: number, roles: MemberRole[]): Member {
  const number = String(index).padStart(2, "0");

  return {
    id: `demo-${number}`,
    firstName: "Profil",
    lastName: number,
    occupation: "Profession ou études",
    mandates: [{ rotaryYear: currentRotaryYear, roles }],
    isDemo: true,
  };
}

const members: Member[] = [
  demo(1, ["president", "responsable-image-publique"]),
  demo(2, ["vice-president"]),
  demo(3, ["secretaire", "protocole"]),
  demo(4, ["tresorier"]),
  demo(5, ["responsable-action", "responsable-fondation"]),
  demo(6, ["responsable-camaraderie", "responsable-effectif"]),
  demo(7, []),
];

/** Fonctions d'un membre pour une année donnée : aucune, une ou plusieurs. */
export function rolesForYear(member: Member, year: string): MemberRole[] {
  return member.mandates
    .filter((mandate) => mandate.rotaryYear === year)
    .flatMap((mandate) => mandate.roles);
}

/** Membres présents au club pendant une année Rotary, dans l'ordre d'affichage. */
export async function getMembers(year: string): Promise<Member[]> {
  return members.filter((member) =>
    member.mandates.some((mandate) => mandate.rotaryYear === year),
  );
}

/** Années Rotary qui ont au moins un membre, de la plus récente à la plus ancienne. */
export async function getMemberYears(): Promise<RotaryYear[]> {
  const years = members.flatMap((member) =>
    member.mandates.map((mandate) => mandate.rotaryYear),
  );

  return [...new Set(years)].sort().reverse();
}

/** Aperçu de l'accueil : seulement des membres réels. */
export async function getFeaturedMembers(limit: number): Promise<Member[]> {
  return members
    .filter(
      (member) =>
        !member.isDemo &&
        member.mandates.some(
          (mandate) => mandate.rotaryYear === currentRotaryYear,
        ),
    )
    .slice(0, limit);
}
