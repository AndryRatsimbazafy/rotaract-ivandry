// Members page texts, in English (feature 014). Same shape as
// content/fr/members.ts.

import { routes } from "@/config/routes";
import type { MemberRole } from "@/types/member";
import { rotaryYearLabel } from "./common";

/** The club's roles, in the order the club lists them. */
export const memberRoleLabels: Record<MemberRole, string> = {
  president: "President",
  "vice-president": "Vice-president",
  tresorier: "Treasurer",
  "responsable-action": "Service projects chair",
  "responsable-image-publique": "Public image chair",
  "responsable-camaraderie": "Fellowship chair",
  "responsable-effectif": "Membership chair",
  "responsable-fondation": "Foundation chair",
  protocole: "Sergeant-at-arms",
  secretaire: "Secretary",
};

export const membersOpening = {
  label: "The team",
  title: "Members",
  lede: "The Rotaract Club Ivandry brings together young professionals and students. They keep the club, its actions and its fellowship alive.",
  groupPhotoBrief: "The club members, together for the Rotary year.",
  yearsLabel: rotaryYearLabel,
  currentYear: "Year shown",
};

export const membersDirectory = {
  number: "01",
  label: "Directory",
  yearLabel: rotaryYearLabel,
  countOne: "member",
  countMany: "members",
  portraitBrief: "Portrait.",
  /** Accessible label while the directory is loading. */
  loadingLabel: "Loading members",
  /** Year notice, for example “… 2025-2026 have not been published yet.” */
  emptyBefore: "The members for the year",
  emptyAfter: "have not been published yet.",
  backToCurrent: "See the current year",
};

export const membersFunctions = {
  number: "02",
  label: "Roles",
  title: "Who does what",
  intro: "One person may hold several roles during a year.",
  vacant: "Vacant",
};

export const membersOnward = {
  label: "Keep reading",
  links: [
    { href: routes.actions, label: "See our actions" },
    { href: routes.news, label: "Read the news" },
  ],
};
