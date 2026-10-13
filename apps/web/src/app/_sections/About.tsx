import { PhotoFrame } from "@/components/media/PhotoFrame";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { about } from "@/content/home";
import type { Photo } from "@/types/media";
import type { ClubFacts } from "@/types/site-settings";
import styles from "./About.module.css";

interface AboutProps {
  /** Informations du club saisies dans le Back Office. */
  club: ClubFacts;
  photo?: Photo;
}

/** Années et nombres : en chiffres tabulaires dans la fiche. */
const numericFacts = new Set<keyof ClubFacts>(["foundedYear", "memberCount"]);

export function About({ club, photo }: AboutProps) {
  // Une information absente n'a pas de ligne.
  const facts = (Object.keys(about.facts) as (keyof ClubFacts)[]).flatMap((key) => {
    const value = club[key];
    return value === undefined || value === "" ? [] : [{ key, value: String(value) }];
  });

  return (
    <section id="club" className={styles.about} aria-labelledby="club-titre">
      <div className={`container grid ${styles.layout}`}>
        <span className={styles.numeral} aria-hidden="true">
          {about.number}
        </span>
        <div className={styles.head}>
          <SectionLabel>{about.label}</SectionLabel>
          <h2 id="club-titre" className={styles.title}>
            {about.title}
          </h2>
        </div>
        <p className={styles.statement}>{about.statement}</p>
        <div className={styles.body}>
          {about.paragraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
          {facts.length > 0 ? (
            <dl className={styles.facts}>
              {facts.map(({ key, value }) => (
                <div key={key} className={styles.fact}>
                  <dt className={`label ${styles.factLabel}`}>{about.facts[key]}</dt>
                  <dd
                    className={
                      numericFacts.has(key)
                        ? `${styles.factValue} ${styles.numeric}`
                        : styles.factValue
                    }
                  >
                    {value}
                  </dd>
                </div>
              ))}
            </dl>
          ) : (
            <p className={styles.pending}>{about.pending}</p>
          )}
        </div>
        <div className={styles.photo}>
          <PhotoFrame
            photo={photo}
            brief={about.photoBrief}
            format="4:5"
            sizes="(min-width: 1024px) 30vw, 70vw"
            className={styles.frame}
          />
        </div>
      </div>
    </section>
  );
}
