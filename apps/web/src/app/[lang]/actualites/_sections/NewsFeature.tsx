import Link from "@/components/ui/LocalLink";
import { PhotoFrame } from "@/components/media/PhotoFrame";
import { ArrowLink } from "@/components/ui/ArrowLink";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { newsItemPath } from "@/config/routes";
import { formatDay, formatMonthYear } from "@/lib/dates";
import type { NewsItem } from "@/types/news";
import styles from "./NewsFeature.module.css";
import { currentLang } from "@/lib/current-lang";
import { frenchLang, hasFrench, LangMark } from "@/components/ui/LangMark";
import { getContent } from "@/content";

interface NewsFeatureProps {
  /** L'actualité la plus récente. Absente tant que rien n'est publié. */
  item?: NewsItem;
}

export async function NewsFeature({ item }: NewsFeatureProps) {
  const content = await getContent();
  const lang = await currentLang();
  const { newsFeature, newsTypeLabels } = content.news;
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
          {/* Sans actualité, ni jour ni mois inventés. */}
          {item ? (
            <time dateTime={item.date} className={styles.stack}>
              <span className={styles.day}>{formatDay(item.date, lang)}</span>
              <span className={`label ${styles.month}`}>
                {formatMonthYear(item.date, lang)}
              </span>
            </time>
          ) : null}
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
          {item ? (
            <p className={`label ${styles.type}`}>{newsTypeLabels[item.type]}</p>
          ) : null}
          <LangMark show={hasFrench(item?.french)} />
          <h2 id="une-titre" className={styles.title} lang={frenchLang(item?.french?.title)}>
            {item && href ? (
              <Link href={href} className={styles.link}>
                {item.title}
              </Link>
            ) : (
              // Collection vide : une phrase calme, pas de titre inventé.
              newsFeature.empty
            )}
          </h2>
          {/* Une actualité sans résumé n'a pas de ligne de résumé. */}
          {item?.summary ? (
            <p className={styles.summary} lang={frenchLang(item.french?.summary)}>
              {item.summary}
            </p>
          ) : null}
          {item?.location ? (
            <p className={`meta ${styles.location}`}>
              <span className="label">{newsFeature.locationLabel}</span>{" "}
              <span lang={frenchLang(item.french?.location)}>{item.location}</span>
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
