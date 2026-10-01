import { PhotoFrame } from "@/components/media/PhotoFrame";
import { ArrowLink } from "@/components/ui/ArrowLink";
import { routes } from "@/config/routes";
import { site } from "@/config/site";
import { rotaryYearLabel } from "@/content/common";
import { opening } from "@/content/home";
import type { RotaryYear } from "@/types/rotary-year";
import styles from "./Opening.module.css";

interface OpeningProps {
  rotaryYear: RotaryYear;
}

const [nameLead, nameRest] = site.nameLines;

export function Opening({ rotaryYear }: OpeningProps) {
  return (
    <section className={styles.opening} aria-labelledby="ouverture-titre">
      <div className={styles.stage}>
        <div className={styles.margin}>
          <p className="label">{opening.label}</p>
          <p className={`meta ${styles.issue}`}>
            {rotaryYearLabel}
            <br />
            {rotaryYear}
          </p>
        </div>
        <div className={styles.media}>
          <PhotoFrame
            photo={opening.photo}
            brief={opening.photoBrief}
            format="16:9"
            sizes="(min-width: 1024px) 84vw, 100vw"
            priority
            tone="dark"
            veiled
            className={styles.frame}
          />
        </div>
      </div>

      {/* La signature : une ligne sur la photographie, une ligne sur le blanc. */}
      <h1 id="ouverture-titre" className={`container ${styles.title}`}>
        <span className={styles.lead}>{nameLead}</span>{" "}
        <span className={styles.rest}>{nameRest}</span>
      </h1>

      <div className={`container grid ${styles.foot}`}>
        <p className={styles.continue}>
          <ArrowLink href="#club" direction="down">
            {opening.continueReading}
          </ArrowLink>
        </p>
        <p className={styles.lede}>{opening.lede}</p>
        <p className={styles.action}>
          <ArrowLink href={routes.actions}>{opening.primaryAction}</ArrowLink>
        </p>
      </div>
    </section>
  );
}
