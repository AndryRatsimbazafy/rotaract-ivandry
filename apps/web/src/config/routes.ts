export const routes = {
  home: "/",
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

export interface NavItem {
  href: RoutePath;
  label: string;
  /** Entrée vers le recrutement : mise en avant dans l'en-tête. */
  isRecruitment?: boolean;
}

export const mainNavigation: NavItem[] = [
  { href: routes.home, label: "Accueil" },
  { href: routes.actions, label: "Actions" },
  { href: routes.news, label: "Actualités" },
  { href: routes.members, label: "Membres" },
  { href: routes.join, label: "Nous rejoindre", isRecruitment: true },
];
