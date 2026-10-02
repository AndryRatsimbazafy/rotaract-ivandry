import type { YearRef } from "./rotary-year";

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

export type Member = {
  id: string;
  firstName: string;
  lastName: string;
  occupation: string | null;
  email: string | null;
  phone: string | null;
  createdAt: string;
  updatedAt: string;
};

export type MemberMandate = {
  id: string;
  rotaryYear: YearRef;
  roles: MemberRole[];
  order: number;
};

export type MemberWithMandates = Member & { mandates: MemberMandate[] };

export type Mandate = {
  id: string;
  member: string;
  rotaryYear: YearRef;
  roles: MemberRole[];
  order: number;
  createdAt: string;
  updatedAt: string;
};
