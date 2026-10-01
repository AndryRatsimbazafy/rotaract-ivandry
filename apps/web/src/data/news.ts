import type { NewsItem } from "@/types/news";
import type { RotaryYear } from "@/types/rotary-year";

// Aucune actualité n'est encore publiée. Ces fonctions seront remplacées par
// des appels à l'API sans que les pages aient à changer.
const news: NewsItem[] = [];

/** Année Rotary d'une date : elle commence le 1er juillet. */
export function rotaryYearOf(isoDate: string): RotaryYear {
  const date = new Date(isoDate);
  const year = date.getUTCFullYear();
  const start = date.getUTCMonth() >= 6 ? year : year - 1;

  return `${start}-${start + 1}`;
}

function newestFirst(items: NewsItem[]) {
  return [...items].sort((a, b) => b.date.localeCompare(a.date));
}

export async function getLatestNews(limit: number): Promise<NewsItem[]> {
  return newestFirst(news).slice(0, limit);
}

export interface NewsFilters {
  type?: string;
  rotaryYear?: string;
}

export async function getNews(filters: NewsFilters): Promise<NewsItem[]> {
  return newestFirst(news).filter(
    (item) =>
      (!filters.type || item.type === filters.type) &&
      (!filters.rotaryYear || rotaryYearOf(item.date) === filters.rotaryYear),
  );
}

export async function getNewsCount(): Promise<number> {
  return news.length;
}

/** Années Rotary qui ont au moins une actualité, avec leur nombre. */
export async function getNewsArchives(): Promise<
  { rotaryYear: RotaryYear; count: number }[]
> {
  const counts = new Map<RotaryYear, number>();
  for (const item of news) {
    const year = rotaryYearOf(item.date);
    counts.set(year, (counts.get(year) ?? 0) + 1);
  }

  return [...counts.entries()]
    .map(([rotaryYear, count]) => ({ rotaryYear, count }))
    .sort((a, b) => b.rotaryYear.localeCompare(a.rotaryYear));
}
