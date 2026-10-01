export const routes = {
  home: "/",
  actions: "/actions",
  news: "/actualites",
  members: "/membres",
  join: "/rejoindre",
} as const;

export type RoutePath = (typeof routes)[keyof typeof routes];

export interface NavItem {
  href: RoutePath;
  label: string;
}

export const mainNavigation: NavItem[] = [
  { href: routes.home, label: "Accueil" },
  { href: routes.actions, label: "Actions" },
  { href: routes.news, label: "Actualités" },
  { href: routes.members, label: "Membres" },
  { href: routes.join, label: "Nous rejoindre" },
];
