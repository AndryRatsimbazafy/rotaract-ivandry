import { apiGet, apiGetAll } from "@/lib/api";
import { toParagraphs } from "@/lib/paragraphs";
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
}

function toNewsItem(news: ApiNews): NewsItem {
  const body = toParagraphs(news.content);

  return {
    id: news.id,
    slug: news.slug,
    title: news.title,
    type: news.type,
    date: news.date,
    rotaryYear: news.rotaryYear as RotaryYear,
    location: news.location,
    summary: news.summary,
    body: body.length > 0 ? body : undefined,
    // L'API ne fournit aucune photographie.
    photos: [],
  };
}

/** Les actualités les plus récentes. */
export async function getLatestNews(limit: number): Promise<NewsItem[]> {
  try {
    const { data } = await apiGet<{ data: ApiNews[] }>("/news", { limit });
    return data.map(toNewsItem);
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
    return { news: items.map(toNewsItem), complete };
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
