import { PhotoFrame } from "@/components/media/PhotoFrame";
import { getContent } from "@/content";
import type { Photo } from "@/types/media";
import styles from "./ClubOpening.module.css";

/**
 * Ouverture de « Le club » (DESIGN.md, section 17) : le titre en signature sur
 * le fond de page, une photographie verticale à bord perdu à droite.
 */
export async function ClubOpening({ photo }: { photo?: Photo }) {
  const { opening } = (await getContent()).club;

  return (
    <section className={styles.opening} aria-labelledby="club-titre">
      <div className={`container grid ${styles.layout}`}>
        <div className={styles.text}>
          <h1 id="club-titre" className={styles.title}>
            {opening.title}
          </h1>
          <p className={styles.lede}>{opening.lede}</p>
        </div>
        <div className={styles.photo}>
          <PhotoFrame
            photo={photo}
            brief={opening.photoBrief}
            format="4:5"
            sizes="(min-width: 1024px) 40vw, 80vw"
            priority
            tone="paper"
            className={styles.frame}
          />
        </div>
      </div>
    </section>
  );
}
