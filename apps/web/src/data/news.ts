import { apiGet, apiGetAll, apiGetOrNull } from "@/lib/api";
import { toParagraphs } from "@/lib/paragraphs";
import { currentLang } from "@/lib/current-lang";
import type { Lang } from "@/lib/locale";
import { picker } from "./localize";
import { toPhoto, type ApiImage } from "./media";
import type { NewsItem, NewsType } from "@/types/news";
import type { RotaryYear } from "@/types/rotary-year";

// Forme publique d'une actualité dans l'API. Un champ facultatif vide est absent.
interface ApiNews {
  id: string;
  slug: string;
  title: string;
  type: NewsType;
  date: string;
  rotaryYear: string;
  location?: string;
  summary?: string;
  content?: string;
  en?: { title?: string; summary?: string; content?: string; location?: string };
  photos: ApiImage[];
}

function toNewsItem(news: ApiNews, lang: Lang): NewsItem {
  const { french, take } = picker<"title" | "summary" | "body" | "location">(lang);
  const en = news.en;
  const body = toParagraphs(take("body", news.content, en?.content));

  return {
    id: news.id,
    slug: news.slug,
    title: take("title", news.title, en?.title) ?? news.title,
    type: news.type,
    date: news.date,
    rotaryYear: news.rotaryYear as RotaryYear,
    location: take("location", news.location, en?.location),
    summary: take("summary", news.summary, en?.summary),
    body: body.length > 0 ? body : undefined,
    // La première est la principale.
    photos: (news.photos ?? []).map((photo) => toPhoto(photo, lang)),
    ...(Object.keys(french).length ? { french } : {}),
  };
}

/** Une actualité publiée par son slug ; null si elle n'existe pas ou plus. */
/**
 * lang : seulement hors d'une page (images de partage, fonctionnalité 015),
 * où next/root-params n'est pas disponible.
 */
export async function getNewsBySlug(slug: string, forLang?: Lang): Promise<NewsItem | null> {
  const news = await apiGetOrNull<ApiNews>(`/news/${encodeURIComponent(slug)}`);
  const lang = forLang ?? (await currentLang());
  return news && toNewsItem(news, lang);
}

/** Les actualités les plus récentes. */
export async function getLatestNews(limit: number): Promise<NewsItem[]> {
  try {
    const { data } = await apiGet<{ data: ApiNews[] }>("/news", { limit });
    const lang = await currentLang();
    return data.map((item) => toNewsItem(item, lang));
  } catch {
    return [];
  }
}

export interface NewsFilters {
  type?: string;
  rotaryYear?: string;
}

export interface NewsList {
  news: NewsItem[];
  /** Faux quand une partie de la liste n'a pas pu être lue. */
  complete: boolean;
}

/** Toutes les actualités publiées du filtre, de la plus récente à la plus ancienne. */
export async function getNews(filters: NewsFilters): Promise<NewsList> {
  try {
    const { items, complete } = await apiGetAll<ApiNews>("/news", {
      type: filters.type,
      year: filters.rotaryYear,
    });
    const lang = await currentLang();
    return { news: items.map((item) => toNewsItem(item, lang)), complete };
  } catch {
    // API injoignable, ou filtre refusé : la page montre son état vide.
    return { news: [], complete: true };
  }
}

export async function getNewsCount(): Promise<number> {
  try {
    const { meta } = await apiGet<{ meta: { total: number } }>("/news", {
      limit: 1,
    });
    return meta.total;
  } catch {
    return 0;
  }
}

/** Années Rotary qui ont au moins une actualité publiée, avec leur nombre. */
export async function getNewsArchives(): Promise<
  { rotaryYear: RotaryYear; count: number }[]
> {
  try {
    const { data } = await apiGet<{
      data: { rotaryYear: { label: string }; count: number }[];
    }>("/news/archives");
    return data.map(({ rotaryYear, count }) => ({
      rotaryYear: rotaryYear.label as RotaryYear,
      count,
    }));
  } catch {
    return [];
  }
}
