import Link from "@/components/ui/LocalLink";
import { ArrowLink } from "@/components/ui/ArrowLink";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { newsItemPath, routes } from "@/config/routes";
import { formatDay, formatMonthYear } from "@/lib/dates";
import type { NewsItem } from "@/types/news";
import styles from "./LatestNews.module.css";
import { currentLang } from "@/lib/current-lang";
import type { Lang } from "@/lib/locale";
import { frenchLang, hasFrench, LangMark } from "@/components/ui/LangMark";
import { getContent, type Content } from "@/content";

interface NewsRow {
  key: string;
  day: string;
  month: string;
  dateTime: string;
  title: string;
  summary?: string;
  /** Passages affichés en français sur une page anglaise (014). */
  french?: NewsItem["french"];
  type: string;
  href: string;
}

function toRow(item: NewsItem, { newsTypeLabels }: Content["news"], lang: Lang): NewsRow {
  return {
    key: item.id,
    day: formatDay(item.date, lang),
    month: formatMonthYear(item.date, lang),
    dateTime: item.date,
    title: item.title,
    summary: item.summary,
    french: item.french,
    type: newsTypeLabels[item.type],
    href: newsItemPath(item.slug),
  };
}

interface LatestNewsProps {
  news: NewsItem[];
}

export async function LatestNews({ news }: LatestNewsProps) {
  const content = await getContent();
  const lang = await currentLang();
  const { pendingLabel } = content.common;
  const { latestNews } = content.home;
  const { newsRegister } = content.news;
  const isPending = news.length === 0;
  const rows = news.map((item) => toRow(item, content.news, lang));

  return (
    <section
      id="actualites"
      className={styles.section}
      aria-labelledby="actualites-titre"
    >
      <div className={`container grid ${styles.layout}`}>
        <div className={styles.head}>
          <SectionLabel number={latestNews.number}>
            {latestNews.label}
          </SectionLabel>
          <h2 id="actualites-titre" className={styles.title}>
            {latestNews.title}
          </h2>
          {isPending ? (
            <p className={`meta ${styles.note}`}>{pendingLabel}</p>
          ) : null}
          <p className={styles.all}>
            <ArrowLink href={routes.news}>{latestNews.allLink}</ArrowLink>
          </p>
        </div>

        {isPending ? (
          // Registre vide : ses colonnes, une phrase, ses filets. Pas de lignes fantômes.
          <div className={`${styles.register} ${styles.blank}`}>
            <p className={`label ${styles.columns}`} aria-hidden="true">
              <span>{newsRegister.columns.date}</span>
              <span>{newsRegister.columns.title}</span>
              <span>{newsRegister.columns.type}</span>
            </p>
            <p className={styles.blankText}>{newsRegister.empty}</p>
          </div>
        ) : (
          <ol className={styles.register}>
            {rows.map((row) => (
              <li key={row.key} className={styles.row}>
                <p>
                  <time dateTime={row.dateTime} className={styles.stack}>
                    <span className={styles.day}>{row.day}</span>
                    <span className={`label ${styles.month}`}>{row.month}</span>
                  </time>
                </p>
                <div>
                  <LangMark show={hasFrench(row.french)} />
                  <h3 className={styles.name} lang={frenchLang(row.french?.title)}>
                    <Link href={row.href} className={styles.link}>
                      {row.title}
                    </Link>
                  </h3>
                  {row.summary ? (
                    <p className={styles.summary} lang={frenchLang(row.french?.summary)}>
                      {row.summary}
                    </p>
                  ) : null}
                </div>
                <p className={`label ${styles.type}`}>{row.type}</p>
              </li>
            ))}
          </ol>
        )}
      </div>
    </section>
  );
}
