import { routes } from "@/config/routes";

// "The club" page (feature 015). The history is entered in the Back Office;
// fixed texts only here, with no invented figure or date.

export const opening = {
  title: "The club",
  lede: "Who we are, where we come from, and the years that shaped the club.",
  photoBrief: "Club life: a meeting, a team moment.",
};

export const history = {
  label: "History",
  title: "Our story",
};

export const rotary = {
  label: "Rotaract and Rotary",
  term: "Rotaract",
  grammar: "noun",
  definition:
    "A Rotary International programme for young adults. Each Rotaract club is sponsored by a Rotary club that supports it; its members choose and carry out their own service projects in their community, and take part in the life of the Rotary network.",
  sponsorLabel: "Sponsor club",
};

export const figures = {
  label: "In figures",
  title: "The club in figures",
  labels: {
    foundedYear: "Founded",
    memberCount: "Members",
    actionCount: "Published actions",
    yearCount: "Rotary years on the timeline",
  },
};

export const timeline = {
  label: "The years",
  title: "The club's years",
  intro: "For each Rotary year, the presidency and the actions that marked it.",
  presidency: (count: number): string => (count > 1 ? "Shared presidency" : "Presidency"),
  actionsLabel: "Key actions",
  /** Readable name of the year, doubling the outlined numerals. */
  yearTitle: (year: string) => `Rotary year ${year}`,
};

export const onward = {
  label: "Keep exploring",
  links: [
    { href: routes.actions, label: "See the actions" },
    { href: routes.members, label: "Meet the members" },
  ],
};
