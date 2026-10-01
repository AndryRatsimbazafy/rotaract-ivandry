import type { Metadata } from "next";
import { JoinReminder } from "@/components/sections/JoinReminder";
import { Onward } from "@/components/sections/Onward";
import { newsOnward } from "@/content/news";
import { newsPage } from "@/content/pages";
import { getNews, getNewsArchives, getNewsCount } from "@/data/news";
import { currentRotaryYear } from "@/lib/rotary-year";
import { single } from "@/lib/search-params";
import { NewsArchives } from "./_sections/NewsArchives";
import { NewsFeature } from "./_sections/NewsFeature";
import { NewsOpening } from "./_sections/NewsOpening";
import { NewsRegister } from "./_sections/NewsRegister";

export const metadata: Metadata = {
  title: newsPage.title,
  description: newsPage.description,
};

export default async function NewsPage(props: PageProps<"/actualites">) {
  const query = await props.searchParams;
  const filters = {
    type: single(query.rubrique),
    rotaryYear: single(query.annee),
  };

  const [news, archives, count] = await Promise.all([
    getNews(filters),
    getNewsArchives(),
    getNewsCount(),
  ]);
  // La plus récente est à la une, les suivantes forment le fil.
  const [feature, ...rest] = news;

  return (
    <>
      <NewsOpening rotaryYear={currentRotaryYear} count={count} />
      {feature || count === 0 ? <NewsFeature item={feature} /> : null}
      <NewsRegister
        items={rest}
        isPending={count === 0}
        hasFeature={Boolean(feature)}
        filters={filters}
      />
      <NewsArchives
        archives={archives}
        currentYear={currentRotaryYear}
        filters={filters}
      />
      <Onward label={newsOnward.label} links={newsOnward.links} />
      <JoinReminder />
    </>
  );
}
