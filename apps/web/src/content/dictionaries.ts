import type { Lang } from "@/lib/locale";
import * as frActions from "./fr/actions";
import * as frClub from "./fr/club";
import * as frCommon from "./fr/common";
import * as frHome from "./fr/home";
import * as frJoin from "./fr/join";
import * as frMembers from "./fr/members";
import * as frNews from "./fr/news";
import * as frPages from "./fr/pages";
import * as enActions from "./en/actions";
import * as enClub from "./en/club";
import * as enCommon from "./en/common";
import * as enHome from "./en/home";
import * as enJoin from "./en/join";
import * as enMembers from "./en/members";
import * as enNews from "./en/news";
import * as enPages from "./en/pages";

// Textes fixes du site, un dictionnaire par langue, de même forme
// (fonctionnalité 014). Les composants serveur lisent celui de la page par
// getContent() (content/index.ts) ; les actions serveur et les composants
// client reçoivent celui de contentFor(lang).

const fr = {
  actions: frActions,
  club: frClub,
  common: frCommon,
  home: frHome,
  join: frJoin,
  members: frMembers,
  news: frNews,
  pages: frPages,
};

export type Content = typeof fr;

// Même forme que le français : un texte anglais manquant casse la compilation.
const en = {
  actions: enActions,
  club: enClub,
  common: enCommon,
  home: enHome,
  join: enJoin,
  members: enMembers,
  news: enNews,
  pages: enPages,
} satisfies Content;

const dictionaries: Record<Lang, Content> = { fr, en };

export function contentFor(lang: Lang): Content {
  return dictionaries[lang];
}
