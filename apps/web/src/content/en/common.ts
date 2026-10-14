// Shared labels for every page, in English (feature 014). Same shape as
// content/fr/common.ts.

export const rotaryYearLabel: string = "Rotary year";

/** Placeholders for content not provided yet. */
export const pendingLabel: string = "Content to come";
export const photoPendingLabel: string = "Photograph to come";

/** Exceptional technical state: part of a long list could not be read. */
export const incompleteLabel: string = "This list is incomplete for now.";

/** Not found page (DESIGN.md, section 9). */
export const notFoundPage = {
  code: "404",
  metaTitle: "Page not found",
  title: "This page does not exist, or no longer does.",
  text: "The address may be out of date, or the content has been removed.",
  links: [
    { href: "/", label: "Back to the home page" },
    { href: "/actions", label: "See our actions" },
    { href: "/actualites", label: "Read the news" },
  ],
};

/** Error page: one calm sentence, the cause and the fix. */
export const errorPage = {
  title: "The content could not be loaded.",
  text: "Please try again in a moment.",
  retry: "Try again",
  home: "Back to the home page",
};

/** Site chrome: navigation, menus, shared links. */
export const chrome = {
  siteDescription: "Website of the Rotaract Club Ivandry",
  skipLink: "Skip to content",
  navigation: {
    home: "Home",
    club: "The club",
    actions: "Actions",
    news: "News",
    members: "Members",
    join: "Join us",
  },
  mainNavLabel: "Main navigation",
  footerNavLabel: "Footer navigation",
  menu: {
    open: "Menu",
    title: "Contents",
    close: "Close",
    dialogLabel: "Menu",
    current: "Current page",
  },
  social: {
    listLabel: "The club on social media",
    /** “The club on Facebook” */
    linkLabel: (network: string) => `The club on ${network}`,
    pending: (network: string) => `${network}: link to come`,
  },
  languages: {
    label: "Language",
    fr: "Version française",
    en: "English version",
  },
  learnMore: "Learn more",
  /** “Photo: Rova R.” */
  photoCredit: (credit: string) => `Photo: ${credit}.`,
  /** Marks a French passage on an English page. */
  inFrench: "In French",
  /** Full-screen gallery of the detail pages (feature 015). */
  gallery: {
    open: (alt: string) => `Enlarge photograph: ${alt}`,
    dialog: (title: string) => `Photographs of ${title}`,
    previous: "Previous photograph",
    next: "Next photograph",
    close: "Close",
    /** Template read by the gallery: {n} and {total} are replaced. */
    announce: "Photograph {n} of {total}",
  },
};
