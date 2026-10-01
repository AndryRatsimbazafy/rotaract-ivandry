import Link from "next/link";
import { PhotoFrame } from "@/components/media/PhotoFrame";
import { routes } from "@/config/routes";
import { membersOpening } from "@/content/members";
import type { RotaryYear } from "@/types/rotary-year";
import styles from "./MembersOpening.module.css";

interface MembersOpeningProps {
  /** Années Rotary consultables, de la plus récente à la plus ancienne. */
  years: RotaryYear[];
  selectedYear: string;
}

export function MembersOpening({ years, selectedYear }: MembersOpeningProps) {
  return (
    <section className={styles.opening} aria-labelledby="membres-titre">
      <div className="container">
        <p className="label">{membersOpening.label}</p>
        <h1 id="membres-titre" className={styles.title}>
          {membersOpening.title}
        </h1>
        <p className={styles.lede}>{membersOpening.lede}</p>
      </div>

      <div className={`container grid ${styles.stage}`}>
        <div className={styles.photo}>
          <PhotoFrame
            brief={membersOpening.groupPhotoBrief}
            format="2:1"
            sizes="(min-width: 1024px) 75vw, 100vw"
            priority
            tone="dark"
            className={styles.frame}
          />
        </div>

        {/* Les années : chaque mandat se consulte, le plus récent en tête. */}
        <nav aria-label={membersOpening.yearsLabel} className={styles.years}>
          <p className={`label ${styles.yearsLabel}`}>
            {membersOpening.yearsLabel}
          </p>
          <ul className={styles.yearList}>
            {years.map((year) => {
              const isCurrent = year === selectedYear;

              return (
                <li key={year}>
                  <Link
                    href={`${routes.members}?annee=${year}#annuaire`}
                    className={styles.year}
                    aria-current={isCurrent ? "true" : undefined}
                  >
                    <span className={styles.yearName}>{year}</span>
                    {isCurrent ? (
                      <span className="label">
                        {membersOpening.currentYear}
                      </span>
                    ) : null}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </section>
  );
}
