// News page texts, in English (feature 014). Same shape as content/fr/news.ts.
// Nothing is made up.

import { routes } from "@/config/routes";
import type { NewsType } from "@/types/news";
import { pendingLabel, rotaryYearLabel } from "./common";

export const newsTypeLabels: Record<NewsType, string> = {
  evenement: "Event",
  participation: "Participation",
  reunion: "Meeting",
  formation: "Training",
  annonce: "Announcement",
};

export const newsOpening = {
  label: "Club journal",
  titleLines: ["Inside", "the club"],
  lede: "Meetings, training sessions, gatherings, events: what happens at the club, throughout the year.",
  yearLabel: rotaryYearLabel,
  countLabel: "Published news",
};

export const newsFeature = {
  number: "01",
  label: "Featured",
  more: "Read more",
  locationLabel: "Location",
  photoBrief: "The highlight of this news item.",
  // Shown as long as no news is published.
  placeholder: {
    day: "00",
    month: "Month, year",
    type: "Category",
    title: "Title of the featured news",
    summary: "Short summary of the news.",
  },
};

export const newsRegister = {
  number: "02",
  label: "The feed",
  title: "All news",
  rubricsLabel: "Categories",
  /** Accessible label while the news is loading. */
  loadingLabel: "Loading news",
  allRubrics: "All",
  columns: { date: "Date", title: "News", type: "Category" },
  more: "Read more",
  thumbBrief: "Thumbnail.",
  empty: "No news has been published yet.",
  noMatch: "No news matches this choice.",
  reset: "See all news",
  onlyFeature: "The featured news is the only one published for this choice.",
};

export const newsArchives = {
  number: "03",
  label: "Archives",
  title: "By Rotary year",
  intro: "Each Rotary year starts on 1 July.",
  all: "All years",
  current: "Year shown",
  countOne: "news item",
  countMany: "news items",
  pending: pendingLabel,
};

export const newsOnward = {
  label: "Keep reading",
  links: [
    { href: routes.actions, label: "See our actions" },
    { href: routes.members, label: "Meet the members" },
  ],
};

// News page (DESIGN.md, section 10, “the article”).
export const newsPage = {
  yearLabel: rotaryYearLabel,
  locationLabel: "Location:",
  photosTitle: "In pictures",
  backLabel: "All news",
  onward: newsOnward,
};
