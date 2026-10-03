import type { Metadata } from "next";
import { Suspense } from "react";
import { JoinReminder } from "@/components/sections/JoinReminder";
import { Onward } from "@/components/sections/Onward";
import { ListSkeleton } from "@/components/ui/PageSkeleton";
import { newsOnward, newsRegister } from "@/content/news";
import { newsPage } from "@/content/pages";
import {
  getNews,
  getNewsArchives,
  getNewsCount,
  type NewsList,
} from "@/data/news";
import { getCurrentRotaryYear } from "@/data/rotary-years";
import { single } from "@/lib/search-params";
import { NewsArchives } from "./_sections/NewsArchives";
import { NewsFeature } from "./_sections/NewsFeature";
import { NewsOpening } from "./_sections/NewsOpening";
import { NewsRegister, newsListKey } from "./_sections/NewsRegister";

export const metadata: Metadata = {
  title: newsPage.title,
  description: newsPage.description,
};

/** La plus récente du choix courant, à la une. */
async function Feature({
  list,
  isPending,
}: {
  list: Promise<NewsList>;
  isPending: boolean;
}) {
  const [feature] = (await list).news;

  return feature || isPending ? <NewsFeature item={feature} /> : null;
}

export default async function NewsPage(props: PageProps<"/actualites">) {
  const query = await props.searchParams;
  const filters = {
    type: single(query.rubrique),
    rotaryYear: single(query.annee),
  };

  // La liste n'est pas attendue ici : la une et le fil ont leur propre attente.
  const list = getNews(filters);
  const [archives, count, currentYear] = await Promise.all([
    getNewsArchives(),
    getNewsCount(),
    getCurrentRotaryYear(),
  ]);

  return (
    <>
      <NewsOpening rotaryYear={currentYear} count={count} />
      <Suspense
        key={newsListKey(filters)}
        fallback={
          <ListSkeleton
            label={newsRegister.loadingLabel}
            shape="feature"
            standalone
          />
        }
      >
        <Feature list={list} isPending={count === 0} />
      </Suspense>
      <NewsRegister list={list} isPending={count === 0} filters={filters} />
      <NewsArchives
        archives={archives}
        currentYear={currentYear}
        filters={filters}
      />
      <Onward label={newsOnward.label} links={newsOnward.links} />
      <JoinReminder />
    </>
  );
}
