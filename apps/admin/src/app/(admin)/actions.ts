"use server";

import { redirect, unstable_rethrow } from "next/navigation";
import { apiRead, queryString } from "@/lib/api";
import { formatDate } from "@/lib/dates";
import { NEWS_TYPE_LABELS } from "@/lib/labels";
import { clearSession } from "@/lib/session";
import type { Action } from "@/types/action";
import type { Paginated } from "@/types/api";
import type { Application } from "@/types/application";
import type { Member } from "@/types/member";
import type { News } from "@/types/news";

// Déconnexion : le jeton est sans état, il suffit d'effacer le cookie.
export async function logout(): Promise<void> {
  await clearSession();
  redirect("/connexion");
}

export type QuickHit = {
  id: string;
  primary: string;
  secondary?: string;
  href: string;
};

export type QuickSearchResult = {
  members: QuickHit[];
  actions: QuickHit[];
  news: QuickHit[];
  applications: QuickHit[];
};

const EMPTY: QuickSearchResult = {
  members: [],
  actions: [],
  news: [],
  applications: [],
};

// Une nature en échec donne une liste vide ; la fin de session (redirection)
// est relancée.
async function search<T>(
  path: string,
  q: string,
  toHit: (item: T) => QuickHit,
): Promise<QuickHit[]> {
  try {
    const { data } = await apiRead<Paginated<T>>(
      `${path}${queryString({ q, limit: 5 })}`,
    );
    return data.map(toHit);
  } catch (error) {
    unstable_rethrow(error);
    return [];
  }
}

// Recherche rapide (Ctrl+K) : les recherches existantes de l'API, lues par le
// serveur. Le navigateur n'appelle jamais l'API ; le terme ne passe par
// aucune adresse.
export async function quickSearch(text: string): Promise<QuickSearchResult> {
  const q = typeof text === "string" ? text.trim() : "";
  if (q.length < 2) {
    return EMPTY;
  }
  const [members, actions, news, applications] = await Promise.all([
    search<Member>("/admin/members", q, (member) => ({
      id: member.id,
      primary: `${member.firstName} ${member.lastName}`,
      secondary: member.email ?? undefined,
      href: `/membres/${member.id}`,
    })),
    search<Action>("/admin/actions", q, (action) => ({
      id: action.id,
      primary: action.title,
      secondary: `${action.rotaryYear.label} · ${action.isPublished ? "Publié" : "Brouillon"}`,
      href: `/actions/${action.id}`,
    })),
    search<News>("/admin/news", q, (item) => ({
      id: item.id,
      primary: item.title,
      secondary: `${NEWS_TYPE_LABELS[item.type]} · ${item.rotaryYear.label}`,
      href: `/actualites/${item.id}`,
    })),
    search<Application>("/admin/applications", q, (application) => ({
      id: application.id,
      primary: `${application.firstName} ${application.lastName}`,
      secondary: formatDate(application.createdAt),
      href: `/candidatures/${application.id}`,
    })),
  ]);
  return { members, actions, news, applications };
}
