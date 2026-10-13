import Link from "next/link";
import { PhotoFrame } from "@/components/media/PhotoFrame";
import { ArrowLink } from "@/components/ui/ArrowLink";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { newsItemPath } from "@/config/routes";
import { newsFeature, newsTypeLabels } from "@/content/news";
import { formatDay, formatMonthYear } from "@/lib/dates";
import type { NewsItem } from "@/types/news";
import styles from "./NewsFeature.module.css";

interface NewsFeatureProps {
  /** L'actualité la plus récente. Absente tant que rien n'est publié. */
  item?: NewsItem;
}

export function NewsFeature({ item }: NewsFeatureProps) {
  const placeholder = newsFeature.placeholder;
  const href = item ? newsItemPath(item.slug) : undefined;

  return (
    <section
      className={item ? styles.feature : `${styles.feature} ${styles.pending}`}
      aria-labelledby="une-titre"
    >
      <div className={`container grid ${styles.layout}`}>
        {/* La date mène : le jour en chiffre monumental. */}
        <div className={styles.date}>
          <SectionLabel number={newsFeature.number}>
            {newsFeature.label}
          </SectionLabel>
          {item ? (
            <time dateTime={item.date} className={styles.stack}>
              <span className={styles.day}>{formatDay(item.date)}</span>
              <span className={`label ${styles.month}`}>
                {formatMonthYear(item.date)}
              </span>
            </time>
          ) : (
            <p className={styles.stack}>
              <span className={styles.day} aria-hidden="true">
                {placeholder.day}
              </span>
              <span className={`label ${styles.month}`}>{placeholder.month}</span>
            </p>
          )}
        </div>

        <div className={styles.media}>
          {href ? (
            // Doublon du lien du titre : hors de l'ordre du clavier.
            <Link href={href} tabIndex={-1} aria-hidden="true" className={styles.mediaLink}>
              <PhotoFrame
                photo={item?.photos[0]}
                brief={newsFeature.photoBrief}
                format="16:9"
                sizes="(min-width: 1024px) 78vw, 100vw"
                priority
                tone="dark"
                className={styles.frame}
              />
            </Link>
          ) : (
            <PhotoFrame
              brief={newsFeature.photoBrief}
              format="16:9"
              sizes="(min-width: 1024px) 78vw, 100vw"
              priority
              tone="dark"
              className={styles.frame}
            />
          )}
        </div>

        {/* Le texte, sur un aplat blanc qui mord sur la photographie. */}
        <div className={styles.text}>
          <p className={`label ${styles.type}`}>
            {item ? newsTypeLabels[item.type] : placeholder.type}
          </p>
          <h2 id="une-titre" className={styles.title}>
            {item && href ? (
              <Link href={href} className={styles.link}>
                {item.title}
              </Link>
            ) : (
              placeholder.title
            )}
          </h2>
          {/* Une actualité sans résumé n'a pas de ligne de résumé. */}
          {!item || item.summary ? (
            <p className={styles.summary}>
              {item ? item.summary : placeholder.summary}
            </p>
          ) : null}
          {item?.location ? (
            <p className={`meta ${styles.location}`}>
              <span className="label">{newsFeature.locationLabel}</span>{" "}
              {item.location}
            </p>
          ) : null}
          {href ? (
            <p className={styles.more}>
              <ArrowLink href={href}>{newsFeature.more}</ArrowLink>
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );
}
