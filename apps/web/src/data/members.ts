import { apiGet } from "@/lib/api";
import type { Member, MemberRole } from "@/types/member";
import type { RotaryYear } from "@/types/rotary-year";

// Forme publique d'un membre dans l'API : ni email, ni téléphone, ni portrait.
interface ApiMember {
  id: string;
  firstName: string;
  lastName: string;
  occupation?: string;
  rotaryYear: string;
  roles: MemberRole[];
  order: number;
}

function toMember(member: ApiMember): Member {
  return {
    id: member.id,
    firstName: member.firstName,
    lastName: member.lastName,
    occupation: member.occupation,
    rotaryYear: member.rotaryYear as RotaryYear,
    roles: member.roles,
    order: member.order,
  };
}

/**
 * Membres présents au club pendant une année Rotary, dans l'ordre que le club
 * a choisi : il n'est jamais retrié ici.
 */
export async function getMembers(year: string): Promise<Member[]> {
  try {
    const { data } = await apiGet<{ data: ApiMember[] }>("/members", { year });
    return data.map(toMember);
  } catch {
    return [];
  }
}

/** Années Rotary qui ont au moins un membre, de la plus récente à la plus ancienne. */
export async function getMemberYears(): Promise<RotaryYear[]> {
  try {
    const { data } = await apiGet<{ data: { label: string }[] }>(
      "/members/years",
    );
    return data.map((year) => year.label as RotaryYear);
  } catch {
    return [];
  }
}

/** Aperçu de l'accueil : les premiers membres de l'année en cours. */
export async function getFeaturedMembers(limit: number): Promise<Member[]> {
  try {
    const { data } = await apiGet<{ data: ApiMember[] }>("/members", { limit });
    return data.map(toMember);
  } catch {
    return [];
  }
}
