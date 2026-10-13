// Actions page texts, in English (feature 014). Same shape as
// content/fr/actions.ts. Nothing is made up.

import { routes } from "@/config/routes";
import { rotaryYearLabel } from "./common";
import { latestActions } from "./home";

export const actionsOpening = {
  label: "In the field",
  titleLines: ["Our", "actions"],
  lede: "Each action answers a real need in the community. Here is what the club has undertaken, and what it changed.",
  yearLabel: rotaryYearLabel,
  countLabel: "Published actions",
  mainPhotoBrief: "An action under way: gestures, faces.",
  detailPhotoBrief: "A detail of the same action.",
};

export const actionDefinition = {
  number: "01",
  label: "Definition",
  title: "What is an action?",
  term: "Action",
  grammar: "noun",
  definition:
    "A project or activity led by the club to answer a real need and make an impact in the community.",
  // The three terms of the definition, with nothing added.
  criteria: [
    "A real need",
    "A project led by the club",
    "An impact in the community",
  ],
};

export const actionsIndex = {
  number: "02",
  label: "The projects",
  title: "All actions",
  filtersLabel: "Filter the actions",
  yearFilter: { label: rotaryYearLabel, all: "All" },
  areaFilter: { label: "Area of focus", all: "All areas" },
  yearLabel: rotaryYearLabel,
  moreLabel: "Read more",
  /** Accessible label while the list is loading. */
  loadingLabel: "Loading actions",
  photoBrief: "Main photograph of the action.",
  impactLabels: {
    objective: "Objective",
    beneficiaries: "Beneficiaries",
    location: "Location",
    period: "Period",
    partners: "Partners",
    results: "Results",
  },
  empty: "No action matches these filters.",
  reset: "See all actions",
  // Shown as long as no action is published: the same placeholder as on the home page.
  placeholder: latestActions.placeholder,
};

// Action page (DESIGN.md, section 10, “the report”).
export const actionPage = {
  label: "Action",
  yearLabel: rotaryYearLabel,
  photoBrief: "Main photograph of the action.",
  impactTitle: "Impact",
  partnersLabel: "Partners",
  plateTitle: "In the field",
  backLabel: "All actions",
  onward: {
    label: "Keep reading",
    links: [
      { href: routes.news, label: "Read the news" },
      { href: routes.members, label: "Meet the members" },
    ],
  },
};
