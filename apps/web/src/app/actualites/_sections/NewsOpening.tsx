import { pendingLabel } from "@/content/common";
import { newsOpening } from "@/content/news";
import type { RotaryYear } from "@/types/rotary-year";
import styles from "./NewsOpening.module.css";

interface NewsOpeningProps {
  rotaryYear: RotaryYear;
  /** Nombre d'actualités publiées. */
  count: number;
}

export function NewsOpening({ rotaryYear, count }: NewsOpeningProps) {
  const [lead, rest] = newsOpening.titleLines;

  return (
    <section className={styles.opening} aria-labelledby="actualites-titre">
      <div className="container">
        {/* La manchette : le nom de la publication, et ses repères. */}
        <div className={styles.masthead}>
          <p className="label">{newsOpening.label}</p>
          <dl className={styles.facts}>
            <div>
              <dt className="label">{newsOpening.yearLabel}</dt>
              <dd>{rotaryYear}</dd>
            </div>
            <div>
              <dt className="label">{newsOpening.countLabel}</dt>
              <dd>{count > 0 ? count : pendingLabel}</dd>
            </div>
          </dl>
        </div>

        <h1 id="actualites-titre" className={styles.title}>
          <span className={styles.lead}>{lead}</span>{" "}
          <span className={styles.rest}>{rest}</span>
        </h1>
        <p className={styles.lede}>{newsOpening.lede}</p>
      </div>
    </section>
  );
}
