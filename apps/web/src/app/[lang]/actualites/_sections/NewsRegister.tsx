import Link from "@/components/ui/LocalLink";
import { Suspense } from "react";
import { PhotoFrame } from "@/components/media/PhotoFrame";
import { ArrowLink } from "@/components/ui/ArrowLink";
import { ListSkeleton } from "@/components/ui/PageSkeleton";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { newsItemPath, routes } from "@/config/routes";
import type { NewsFilters, NewsList } from "@/data/news";
import { formatDay, formatMonthYear } from "@/lib/dates";
import type { NewsItem, NewsType } from "@/types/news";
import styles from "./NewsRegister.module.css";
import { currentLang } from "@/lib/current-lang";
import type { Lang } from "@/lib/locale";
import { frenchLang, hasFrench, LangMark } from "@/components/ui/LangMark";
import { getContent } from "@/content";

/** Adresse de la page pour un jeu de filtres : un filtre est un lien. */
export function newsHref(filters: NewsFilters, anchor = "fil") {
  const query = new URLSearchParams();
  if (filters.type) query.set("rubrique", filters.type);
  if (filters.rotaryYear) query.set("annee", filters.rotaryYear);
  const search = query.toString();

  return `${routes.news}${search ? `?${search}` : ""}#${anchor}`;
}

/** Regroupe les actualités par mois, dans l'ordre reçu. */
function byMonth(items: NewsItem[], lang: Lang) {
  const groups: { month: string; items: NewsItem[] }[] = [];
  for (const item of items) {
    const month = formatMonthYear(item.date, lang);
    const last = groups.at(-1);
    if (last?.month === month) last.items.push(item);
    else groups.push({ month, items: [item] });
  }

  return groups;
}

/** Clé d'un choix de rubrique et d'année : une frontière d'attente par choix. */
export function newsListKey(filters: NewsFilters) {
  return `${filters.type ?? ""}|${filters.rotaryYear ?? ""}`;
}

interface NewsRegisterProps {
  /**
   * La lecture des actualités du choix courant, attendue dans la seule zone
   * du fil ; la première est à la une, le fil commence à la suivante.
   */
  list: Promise<NewsList>;
  /** Vrai tant qu'aucune actualité n'est publiée, tous filtres confondus. */
  isPending: boolean;
  filters: NewsFilters;
}

/** La mention de liste incomplète, une fois la lecture terminée. */
async function IncompleteNote({ list }: { list: Promise<NewsList> }) {
  const { incompleteLabel } = (await getContent()).common;
  const { complete } = await list;

  return complete ? null : (
    <p className={`meta ${styles.note}`}>{incompleteLabel}</p>
  );
}

export async function NewsRegister({ list, isPending, filters }: NewsRegisterProps) {
  const content = await getContent();
  const { pendingLabel } = content.common;
  const { newsRegister, newsTypeLabels } = content.news;
  const rubrics = Object.keys(newsTypeLabels) as NewsType[];
  // À chaque changement de rubrique ou d'année, le fil montre son squelette
  // pendant la lecture ; le titre et les rubriques restent en place.
  const listKey = newsListKey(filters);

  return (
    <section id="fil" className={styles.sheet} aria-labelledby="fil-titre">
      <div className="container">
        <div className={styles.head}>
          <SectionLabel number={newsRegister.number}>
            {newsRegister.label}
          </SectionLabel>
          <h2 id="fil-titre" className={styles.title}>
            {newsRegister.title}
          </h2>
          {isPending ? (
            <p className={`meta ${styles.note}`}>{pendingLabel}</p>
          ) : null}
          <Suspense key={listKey} fallback={null}>
            <IncompleteNote list={list} />
          </Suspense>
        </div>

        {/* Les rubriques : un index sur une ligne, comme dans un journal. */}
        <nav aria-label={newsRegister.rubricsLabel} className={styles.rubrics}>
          <p className={`label ${styles.rubricsLabel}`}>
            {newsRegister.rubricsLabel}
          </p>
          <ul className={styles.options}>
            <li>
              <Link
                href={newsHref({ rotaryYear: filters.rotaryYear })}
                className={styles.option}
                aria-current={filters.type ? undefined : "true"}
              >
                {newsRegister.allRubrics}
              </Link>
            </li>
            {rubrics.map((rubric) => (
              <li key={rubric}>
                <Link
                  href={newsHref({ ...filters, type: rubric })}
                  className={styles.option}
                  aria-current={filters.type === rubric ? "true" : undefined}
                >
                  {newsTypeLabels[rubric]}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <Suspense
          key={listKey}
          fallback={
            <ListSkeleton label={newsRegister.loadingLabel} shape="row" />
          }
        >
          <NewsLines list={list} isPending={isPending} />
        </Suspense>
      </div>
    </section>
  );
}

/** Le fil, groupé par mois, ou le registre vide. */
async function NewsLines({
  list,
  isPending,
}: {
  list: Promise<NewsList>;
  isPending: boolean;
}) {
  const { newsRegister, newsTypeLabels } = (await getContent()).news;
  const lang = await currentLang();
  const [feature, ...items] = (await list).news;
  const groups = byMonth(items, lang);
  const emptyMessage = isPending
    ? newsRegister.empty
    : feature
      ? newsRegister.onlyFeature
      : newsRegister.noMatch;

  return (
    <>
      {groups.length === 0 ? (
        // Registre vide : ses colonnes, une phrase, ses filets.
        <div className={styles.blank}>
          <p className={`label ${styles.columns}`} aria-hidden="true">
            <span>{newsRegister.columns.date}</span>
            <span>{newsRegister.columns.title}</span>
            <span>{newsRegister.columns.type}</span>
          </p>
          <p className={styles.blankText}>{emptyMessage}</p>
          {isPending ? null : (
            <ArrowLink href={newsHref({})}>{newsRegister.reset}</ArrowLink>
          )}
          <div className={styles.blankRules} aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
        </div>
      ) : (
        groups.map((group) => (
          <div key={group.month} className={`grid ${styles.group}`}>
            {/* Le mois reste en marge pendant que ses lignes défilent. */}
            <h3 className={styles.month}>{group.month}</h3>
            <ol className={styles.rows}>
              {group.items.map((item) => {
                const href = newsItemPath(item.slug);

                return (
                  <li key={item.id} className={styles.row}>
                    <time dateTime={item.date} className={styles.day}>
                      {formatDay(item.date, lang)}
                    </time>
                    <div className={styles.main}>
                      <p className={`label ${styles.type}`}>
                        {newsTypeLabels[item.type]}
                        {item.location ? (
                          <span className={styles.location} lang={frenchLang(item.french?.location)}>
                            {item.location}
                          </span>
                        ) : null}
                      </p>
                      <LangMark show={hasFrench(item.french)} />
                      <h4 className={styles.name} lang={frenchLang(item.french?.title)}>
                        <Link href={href} className={styles.link}>
                          {item.title}
                        </Link>
                      </h4>
                      {item.summary ? (
                        <p className={styles.summary} lang={frenchLang(item.french?.summary)}>
                          {item.summary}
                        </p>
                      ) : null}
                      <p className={styles.more}>
                        <ArrowLink href={href}>{newsRegister.more}</ArrowLink>
                      </p>
                    </div>
                    {item.photos[0] ? (
                      <div className={styles.thumb}>
                        <PhotoFrame
                          photo={item.photos[0]}
                          brief={newsRegister.thumbBrief}
                          format="1:1"
                          sizes="128px"
                          className={styles.thumbFrame}
                        />
                      </div>
                    ) : null}
                  </li>
                );
              })}
            </ol>
          </div>
        ))
      )}
    </>
  );
}
