import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Onward } from "@/components/sections/Onward";
import { ArrowLink } from "@/components/ui/ArrowLink";
import { newsItemPath, routes } from "@/config/routes";
import { getNewsBySlug } from "@/data/news";
import { languageAlternates } from "@/lib/page-metadata";
import { toExcerpt } from "@/lib/paragraphs";
import { shareImages } from "@/lib/share-image";
import { NewsArticle } from "./_sections/NewsArticle";
import styles from "./page.module.css";
import { getContent } from "@/content";

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/actualites/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const item = await getNewsBySlug(slug);
  if (!item) notFound();

  const description = toExcerpt(item.summary ?? item.body?.[0]);
  return {
    title: item.title,
    description,
    alternates: languageAlternates(newsItemPath(slug)),
    openGraph: {
      type: "article",
      title: item.title,
      description,
      images: await shareImages(item.photos[0]),
    },
  };
}

export default async function NewsItemPage({ params }: PageProps<"/[lang]/actualites/[slug]">) {
  const content = await getContent();
  const { newsPage } = content.news;
  // Rendue à la demande, à partir du cache de données, comme l'accueil. Hors
  // de toute attente : un contenu absent répond avec le statut 404.
  await connection();

  const { slug } = await params;
  const item = await getNewsBySlug(slug);
  if (!item) notFound();

  return (
    <>
      <NewsArticle item={item} />
      <div className={`container ${styles.back}`}>
        <ArrowLink href={routes.news}>{newsPage.backLabel}</ArrowLink>
      </div>
      <Onward label={newsPage.onward.label} links={newsPage.onward.links} />
    </>
  );
}
