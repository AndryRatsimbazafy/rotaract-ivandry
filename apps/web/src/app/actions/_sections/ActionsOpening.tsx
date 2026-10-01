import { PhotoFrame } from "@/components/media/PhotoFrame";
import { pendingLabel } from "@/content/home";
import { actionsOpening } from "@/content/actions";
import type { RotaryYear } from "@/types/rotary-year";
import styles from "./ActionsOpening.module.css";

interface ActionsOpeningProps {
  rotaryYear: RotaryYear;
  /** Nombre d'actions publiées. */
  count: number;
}

export function ActionsOpening({ rotaryYear, count }: ActionsOpeningProps) {
  const [lead, rest] = actionsOpening.titleLines;

  return (
    <section className={styles.opening} aria-labelledby="actions-titre">
      <div className={`container grid ${styles.layout}`}>
        <div className={styles.text}>
          <p className="label">{actionsOpening.label}</p>
          <h1 id="actions-titre" className={styles.title}>
            <span>{lead}</span> <span>{rest}</span>
          </h1>
          <p className={styles.lede}>{actionsOpening.lede}</p>
        </div>

        {/* Les repères de la page, en marge : l'année et le nombre d'actions. */}
        <dl className={styles.facts}>
          <div>
            <dt className="label">{actionsOpening.yearLabel}</dt>
            <dd>{rotaryYear}</dd>
          </div>
          <div>
            <dt className="label">{actionsOpening.countLabel}</dt>
            <dd>{count > 0 ? count : pendingLabel}</dd>
          </div>
        </dl>

        {/* Deux images : une verticale à bord perdu, un détail qui la chevauche. */}
        <div className={styles.photos}>
          <div className={styles.main}>
            <PhotoFrame
              brief={actionsOpening.mainPhotoBrief}
              format="4:5"
              sizes="(min-width: 1024px) 42vw, 78vw"
              priority
              tone="dark"
              className={styles.mainFrame}
            />
          </div>
          <div className={styles.detail}>
            <PhotoFrame
              brief={actionsOpening.detailPhotoBrief}
              format="3:2"
              sizes="(min-width: 1024px) 26vw, 50vw"
              tone="paper"
              className={styles.detailFrame}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
