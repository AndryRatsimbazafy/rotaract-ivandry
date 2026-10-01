import Link from "next/link";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { newsArchives } from "@/content/news";
import type { NewsFilters } from "@/data/news";
import type { RotaryYear } from "@/types/rotary-year";
import { newsHref } from "./NewsRegister";
import styles from "./NewsArchives.module.css";

interface NewsArchivesProps {
  /** Années Rotary qui ont du contenu. Vide tant que rien n'est publié. */
  archives: { rotaryYear: RotaryYear; count: number }[];
  currentYear: RotaryYear;
  filters: NewsFilters;
}

export function NewsArchives({
  archives,
  currentYear,
  filters,
}: NewsArchivesProps) {
  // Sans aucune actualité, seule l'année en cours figure : rien n'est inventé.
  const years =
    archives.length > 0 ? archives : [{ rotaryYear: currentYear, count: 0 }];

  return (
    <section className={styles.field} aria-labelledby="archives-titre">
      <div className={`container grid ${styles.layout}`}>
        <div className={styles.head}>
          <SectionLabel number={newsArchives.number}>
            {newsArchives.label}
          </SectionLabel>
          <h2 id="archives-titre" className={styles.title}>
            {newsArchives.title}
          </h2>
          <p className={styles.intro}>{newsArchives.intro}</p>
        </div>

        {/* Les années comme les volumes d'une collection. */}
        <nav aria-label={newsArchives.label} className={styles.volumes}>
          <ul className={styles.years}>
            {years.map((year) => (
              <li key={year.rotaryYear}>
                <Link
                  href={newsHref({ type: filters.type, rotaryYear: year.rotaryYear })}
                  className={styles.year}
                  aria-current={
                    filters.rotaryYear === year.rotaryYear ? "true" : undefined
                  }
                >
                  <span className={styles.yearName}>{year.rotaryYear}</span>
                  <span className={`label ${styles.meta}`}>
                    {filters.rotaryYear === year.rotaryYear ? (
                      <span className={styles.current}>
                        {newsArchives.current}
                      </span>
                    ) : null}
                    <span className={styles.count}>
                      {year.count > 0
                        ? `${year.count} ${year.count > 1 ? newsArchives.countMany : newsArchives.countOne}`
                        : newsArchives.pending}
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          {filters.rotaryYear ? (
            <Link
              href={newsHref({ type: filters.type })}
              className={styles.all}
            >
              {newsArchives.all}
            </Link>
          ) : null}
        </nav>
      </div>
    </section>
  );
}
