import type { NewsItem } from "@/types/news";

// Aucune actualité n'est encore publiée. Cette fonction sera remplacée par un
// appel à l'API sans que les pages aient à changer.
export async function getLatestNews(limit: number): Promise<NewsItem[]> {
  const news: NewsItem[] = [];
  return news.slice(0, limit);
}
