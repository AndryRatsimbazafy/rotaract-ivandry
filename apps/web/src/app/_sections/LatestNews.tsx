import Link from "next/link";
import { ArrowLink } from "@/components/ui/ArrowLink";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { routes } from "@/config/routes";
import { pendingLabel } from "@/content/common";
import { latestNews } from "@/content/home";
import { newsRegister, newsTypeLabels } from "@/content/news";
import { formatDay, formatMonthYear } from "@/lib/dates";
import type { NewsItem } from "@/types/news";
import styles from "./LatestNews.module.css";

interface NewsRow {
  key: string;
  day: string;
  month: string;
  dateTime: string;
  title: string;
  summary?: string;
  type: string;
  href: string;
}

function toRow(item: NewsItem): NewsRow {
  return {
    key: item.id,
    day: formatDay(item.date),
    month: formatMonthYear(item.date),
    dateTime: item.date,
    title: item.title,
    summary: item.summary,
    type: newsTypeLabels[item.type],
    // La page de détail d'une actualité n'existe pas encore.
    href: routes.news,
  };
}

interface LatestNewsProps {
  news: NewsItem[];
}

export function LatestNews({ news }: LatestNewsProps) {
  const isPending = news.length === 0;
  const rows = news.map(toRow);

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
                  <h3 className={styles.name}>
                    <Link href={row.href} className={styles.link}>
                      {row.title}
                    </Link>
                  </h3>
                  {row.summary ? (
                    <p className={styles.summary}>{row.summary}</p>
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
