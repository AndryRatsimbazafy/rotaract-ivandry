import { PhotoFrame } from "@/components/media/PhotoFrame";
import { ArrowLink } from "@/components/ui/ArrowLink";
import button from "@/components/ui/button.module.css";
import { routes } from "@/config/routes";
import { opening } from "@/content/home";
import { joinOpening } from "@/content/join";
import type { Photo } from "@/types/media";
import styles from "./JoinOpening.module.css";

// La photographie d'action du club, recadrée en hauteur sur les deux visages.
const photo: Photo = { ...opening.photo, focus: "55% 40%" };

export function JoinOpening() {
  const [lead, rest] = joinOpening.titleLines;

  return (
    <section className={styles.opening} aria-labelledby="rejoindre-titre">
      <div className={`container grid ${styles.layout}`}>
        <div className={styles.text}>
          <p className="label">{joinOpening.label}</p>
          <h1 id="rejoindre-titre" className={styles.title}>
            <span>{lead}</span> <span>{rest}</span>
          </h1>
          <p className={styles.lede}>{joinOpening.lede}</p>
          <div className={styles.actions}>
            <a
              href="#candidature"
              className={`${button.button} ${button.onField}`}
            >
              {joinOpening.primaryAction}
            </a>
            <ArrowLink href={routes.actions}>
              {joinOpening.secondaryAction}
            </ArrowLink>
          </div>
        </div>

        {/* La photographie recouvre le bord du champ et descend sous lui. */}
        <div className={styles.photo}>
          <PhotoFrame
            photo={photo}
            brief=""
            format="4:5"
            sizes="(min-width: 1024px) 42vw, 80vw"
            priority
            className={styles.frame}
          />
        </div>
      </div>
    </section>
  );
}
