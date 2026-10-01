import Link from "next/link";
import { ArrowLink } from "@/components/ui/ArrowLink";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { routes } from "@/config/routes";
import { latestNews, newsTypeLabels, pendingLabel } from "@/content/home";
import type { NewsItem } from "@/types/news";
import styles from "./LatestNews.module.css";

const SLOTS = 3;

const dayFormat = new Intl.DateTimeFormat("fr-FR", {
  day: "2-digit",
  timeZone: "UTC",
});
const monthFormat = new Intl.DateTimeFormat("fr-FR", {
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

interface NewsRow {
  key: string;
  day: string;
  month: string;
  /** Date ISO, absente d'un emplacement sans contenu. */
  dateTime?: string;
  title: string;
  summary?: string;
  type: string;
  href?: string;
}

function toRow(item: NewsItem): NewsRow {
  const date = new Date(item.date);

  return {
    key: item.id,
    day: dayFormat.format(date),
    month: monthFormat.format(date),
    dateTime: item.date,
    title: item.title,
    summary: item.summary,
    type: newsTypeLabels[item.type],
    // La page de détail d'une actualité n'existe pas encore.
    href: routes.news,
  };
}

function placeholderRows(): NewsRow[] {
  return Array.from({ length: SLOTS }, (_, index) => ({
    key: `emplacement-${index}`,
    ...latestNews.placeholder,
  }));
}

interface LatestNewsProps {
  news: NewsItem[];
}

export function LatestNews({ news }: LatestNewsProps) {
  const isPending = news.length === 0;
  const rows = isPending ? placeholderRows() : news.map(toRow);

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

        <ol
          className={
            isPending ? `${styles.register} ${styles.pending}` : styles.register
          }
        >
          {rows.map((row) => (
            <li key={row.key} className={styles.row}>
              <p className={styles.date}>
                {row.dateTime ? (
                  <time dateTime={row.dateTime} className={styles.stack}>
                    <span className={styles.day}>{row.day}</span>
                    <span className={`label ${styles.month}`}>{row.month}</span>
                  </time>
                ) : (
                  <span className={styles.stack}>
                    <span className={styles.day}>{row.day}</span>
                    <span className={`label ${styles.month}`}>{row.month}</span>
                  </span>
                )}
              </p>
              <div className={styles.main}>
                <h3 className={styles.name}>
                  {row.href ? (
                    <Link href={row.href} className={styles.link}>
                      {row.title}
                    </Link>
                  ) : (
                    row.title
                  )}
                </h3>
                {row.summary ? (
                  <p className={styles.summary}>{row.summary}</p>
                ) : null}
              </div>
              <p className={`label ${styles.type}`}>
                {row.type}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
