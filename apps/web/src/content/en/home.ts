// Home page texts, in English (feature 014). Same shape as content/fr/home.ts.
// Nothing is made up: missing information keeps a discreet placeholder.

import type { Photo } from "@/types/media";
import type { FocusArea, RotaryValue } from "../fr/home";
import { rotaryYearLabel } from "./common";

export type { FocusArea, RotaryValue };

export const opening = {
  label: "Club journal",
  lede: "A club of committed young adults serving their community.",
  primaryAction: "See our actions",
  continueReading: "Discover the club",
  photoBrief: "A club action, in the field.",
  photo: {
    src: "/images/Image-16-9.jpeg",
    width: 6043,
    height: 3399,
    alt: "Two young men in white T-shirts pour water from a yellow jerrycan, surrounded by local residents.",
    focus: "50% 32%",
  } satisfies Photo,
};

export const about = {
  number: "01",
  label: "The club",
  title: "Who are we?",
  statement:
    "The Rotaract Club Ivandry brings together young adults who give their time to carry out useful actions around them.",
  paragraphs: [
    "Rotaract is part of the Rotary family, a worldwide network of service clubs.",
  ],
  // Shown as long as no club information has been entered in the Back Office.
  pending:
    "Introduction to come: founding year, sponsor club, number of members, meeting place and rhythm.",
  /** Labels of the club facts sheet, in display order (DESIGN.md, section 6). */
  facts: {
    foundedYear: "Founded",
    sponsorClub: "Sponsor club",
    memberCount: "Members",
    meetingPlace: "Meetings",
    meetingRhythm: "Rhythm",
  },
  photoBrief: "Club life: a meeting, a team moment.",
};

export const rotaryValues: {
  number: string;
  label: string;
  title: string;
  values: RotaryValue[];
} = {
  number: "02",
  label: "Our values",
  title: "Rotary values",
  values: [
    {
      name: "Service",
      description: "Putting the common good of our community first.",
    },
    {
      name: "Fellowship",
      description: "Building strong friendships between young professionals.",
    },
    {
      name: "Leadership",
      description: "Developing skills and training the leaders of tomorrow.",
    },
    {
      name: "Diversity",
      description: "Bringing different profiles together around a shared cause.",
    },
    {
      name: "Integrity",
      description: "Acting with ethics, transparency and responsibility.",
    },
  ],
};

export const focusAreas: {
  number: string;
  label: string;
  count: string;
  title: string;
  intro: string;
  areas: FocusArea[];
} = {
  number: "03",
  label: "Our causes",
  count: "7",
  title: "areas of focus",
  intro: "The causes on which Rotary concentrates its work around the world.",
  areas: [
    { id: "paix", title: "Peacebuilding and conflict prevention" },
    { id: "maladies", title: "Disease prevention and treatment" },
    { id: "eau", title: "Water, sanitation and hygiene" },
    { id: "sante", title: "Maternal and child health" },
    { id: "education", title: "Basic education and literacy" },
    { id: "economie", title: "Community economic development" },
    { id: "environnement", title: "Environment" },
  ],
};

export const latestActions = {
  number: "04",
  label: "In the field",
  title: "Recent actions",
  allLink: "All actions",
  yearLabel: rotaryYearLabel,
  impactLabel: "Impact",
  photoBrief: "A club action.",
  // Shown as long as no action is published.
  placeholder: {
    meta: rotaryYearLabel,
    title: "Action title",
    summary: "Short description of the action.",
    impact: "What the action changed, and for whom.",
  },
};

export const latestNews = {
  number: "05",
  label: "Club life",
  title: "Recent news",
  allLink: "All news",
};

export const membersPreview = {
  number: "06",
  label: "The team",
  title: "Members",
  yearLabel: rotaryYearLabel,
  allLink: "All members",
  portraitBrief: "Portrait of a member.",
  // Shown as long as no member is published.
  placeholder: {
    name: "First name Last name",
    roles: "Role",
  },
};

export const joinField = {
  number: "07",
  title: "Want to get involved?",
  text: "The club welcomes young adults who want to act for their community.",
  pathLabel: "How to become a member",
  path: [
    "Application",
    "Invitation to a meeting or an action",
    "Taking part",
    "Becoming a member",
  ],
  photoBrief: "A moment of fellowship.",
};
