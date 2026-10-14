export const routes = {
  home: "/",
  club: "/club",
  actions: "/actions",
  news: "/actualites",
  members: "/membres",
  join: "/rejoindre",
} as const;

/** Page d'une action. */
export function actionPath(slug: string): string {
  return `${routes.actions}/${encodeURIComponent(slug)}`;
}

/** Page d'une actualité. */
export function newsItemPath(slug: string): string {
  return `${routes.news}/${encodeURIComponent(slug)}`;
}

export type RoutePath = (typeof routes)[keyof typeof routes];

export type NavKey = "home" | "club" | "actions" | "news" | "members" | "join";

export interface NavItem {
  key: NavKey;
  href: RoutePath;
  /** Entrée vers le recrutement : mise en avant dans l'en-tête. */
  isRecruitment?: boolean;
}

/** Libellés : chrome.navigation du dictionnaire de la langue. */
export const mainNavigation: NavItem[] = [
  { key: "home", href: routes.home },
  { key: "club", href: routes.club },
  { key: "actions", href: routes.actions },
  { key: "news", href: routes.news },
  { key: "members", href: routes.members },
  { key: "join", href: routes.join, isRecruitment: true },
];
