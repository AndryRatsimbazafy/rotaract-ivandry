import { PhotoFrame } from "@/components/media/PhotoFrame";
import { formatDay, formatFullDate, formatMonthYear } from "@/lib/dates";
import type { NewsItem } from "@/types/news";
import styles from "./NewsArticle.module.css";
import { currentLang } from "@/lib/current-lang";
import { frenchLang, hasFrench, LangMark } from "@/components/ui/LangMark";
import { getContent } from "@/content";

/**
 * L'article (DESIGN.md, section 10) : la date domine. Le jour au trait dans la
 * marge, le titre, puis la photographie et le texte, les autres images en marge.
 */
export async function NewsArticle({ item }: { item: NewsItem }) {
  const content = await getContent();
  const lang = await currentLang();
  const { newsPage, newsTypeLabels } = content.news;
  const [main, ...more] = item.photos;

  return (
    <article aria-labelledby="actualite-titre">
      <header className={styles.opening}>
        <div className={`container grid ${styles.stage}`}>
          <time dateTime={item.date} className={styles.date}>
            <span className={styles.day} aria-hidden="true">
              {formatDay(item.date, lang)}
            </span>
            <span className={`label ${styles.month}`} aria-hidden="true">
              {formatMonthYear(item.date, lang)}
            </span>
            <span className={styles.hidden}>{formatFullDate(item.date, lang)}</span>
          </time>
          <div className={styles.head}>
            <p className={`label ${styles.type}`}>{newsTypeLabels[item.type]}</p>
            <LangMark show={hasFrench(item.french)} />
            <h1 id="actualite-titre" className={styles.title} lang={frenchLang(item.french?.title)}>
              {item.title}
            </h1>
            <ul className={`meta ${styles.meta}`}>
              {item.location ? (
                <li>
                  {newsPage.locationLabel}{" "}
                  <span lang={frenchLang(item.french?.location)}>{item.location}</span>
                </li>
              ) : null}
              <li>
                {newsPage.yearLabel} {item.rotaryYear}
              </li>
            </ul>
          </div>
        </div>
      </header>

      {main ? (
        <div className={styles.media}>
          <PhotoFrame
            photo={main}
            brief=""
            format="16:9"
            sizes="100vw"
            priority
            className={styles.frame}
          />
        </div>
      ) : null}

      {item.summary || item.body || more.length > 0 ? (
        <div className={styles.sheet}>
          <div className={`container grid ${styles.body}`}>
            <div className={styles.text}>
              {item.summary ? (
                <p className={styles.lede} lang={frenchLang(item.french?.summary)}>
                  {item.summary}
                </p>
              ) : null}
              {item.body?.map((paragraph, index) => (
                <p key={index} className={styles.paragraph} lang={frenchLang(item.french?.body)}>
                  {paragraph}
                </p>
              ))}
            </div>
            {more.length > 0 ? (
              <aside className={styles.photos} aria-labelledby="actualite-images">
                <h2 id="actualite-images" className={styles.hidden}>
                  {newsPage.photosTitle}
                </h2>
                <ul className={styles.photoList}>
                  {more.map((photo, index) => (
                    <li key={`${photo.src}-${index}`}>
                      <PhotoFrame
                        photo={photo}
                        brief=""
                        format="3:2"
                        sizes="(min-width: 1024px) 25vw, 100vw"
                        className={styles.photoFrame}
                      />
                    </li>
                  ))}
                </ul>
              </aside>
            ) : null}
          </div>
        </div>
      ) : null}
    </article>
  );
}
