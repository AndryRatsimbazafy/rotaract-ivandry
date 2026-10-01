import { PhotoFrame } from "@/components/media/PhotoFrame";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { newsTypeLabels } from "@/content/home";
import { newsFeature } from "@/content/news";
import { formatDay, formatMonthYear } from "@/lib/dates";
import type { NewsItem } from "@/types/news";
import styles from "./NewsFeature.module.css";

interface NewsFeatureProps {
  /** L'actualité la plus récente. Absente tant que rien n'est publié. */
  item?: NewsItem;
}

export function NewsFeature({ item }: NewsFeatureProps) {
  const placeholder = newsFeature.placeholder;
  const more = item?.photos.slice(1) ?? [];
  const hasDetail = Boolean(item?.body?.length) || more.length > 0;

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
          <PhotoFrame
            photo={item?.photos[0]}
            brief={newsFeature.photoBrief}
            format="16:9"
            sizes="(min-width: 1024px) 78vw, 100vw"
            priority
            tone="dark"
            className={styles.frame}
          />
        </div>

        {/* Le texte, sur un aplat blanc qui mord sur la photographie. */}
        <div className={styles.text}>
          <p className={`label ${styles.type}`}>
            {item ? newsTypeLabels[item.type] : placeholder.type}
          </p>
          <h2 id="une-titre" className={styles.title}>
            {item ? item.title : placeholder.title}
          </h2>
          <p className={styles.summary}>
            {item ? item.summary : placeholder.summary}
          </p>
          {item?.location ? (
            <p className={`meta ${styles.location}`}>
              <span className="label">{newsFeature.locationLabel}</span>{" "}
              {item.location}
            </p>
          ) : null}
          {item && hasDetail ? (
            <details className={styles.more}>
              <summary className={styles.moreSummary}>{newsFeature.more}</summary>
              {item.body?.map((paragraph) => (
                <p key={paragraph} className={styles.paragraph}>
                  {paragraph}
                </p>
              ))}
              {more.length > 0 ? (
                <div className={styles.plate}>
                  {more.map((photo) => (
                    <PhotoFrame
                      key={photo.src}
                      photo={photo}
                      brief={newsFeature.photoBrief}
                      format="3:2"
                      sizes="(min-width: 1024px) 22vw, 45vw"
                      className={styles.plateFrame}
                    />
                  ))}
                </div>
              ) : null}
            </details>
          ) : null}
        </div>
      </div>
    </section>
  );
}
