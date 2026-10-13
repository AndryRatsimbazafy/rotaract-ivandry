import { PhotoFrame } from "@/components/media/PhotoFrame";
import button from "@/components/ui/button.module.css";
import { opening } from "@/content/home";
import { joinOpening } from "@/content/join";
import type { Photo } from "@/types/media";
import styles from "./JoinOpening.module.css";

// À défaut d'une photographie propre à la page : l'ouverture de l'accueil
// saisie dans le Back Office, sinon la photographie livrée avec le site,
// recadrée en hauteur sur les deux visages.
const fallback: Photo = { ...opening.photo, focus: "55% 40%" };

interface JoinOpeningProps {
  photo?: Photo;
  homeOpening?: Photo;
}

export function JoinOpening({ photo, homeOpening }: JoinOpeningProps) {
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
          {/* Un seul appel : l'accès au formulaire. */}
          <p className={styles.actions}>
            <a
              href="#candidature"
              className={`${button.button} ${button.onField}`}
            >
              {joinOpening.primaryAction}
            </a>
          </p>
        </div>

        {/* La photographie recouvre le bord du champ et descend sous lui. */}
        <div className={styles.photo}>
          <PhotoFrame
            photo={photo ?? homeOpening ?? fallback}
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
