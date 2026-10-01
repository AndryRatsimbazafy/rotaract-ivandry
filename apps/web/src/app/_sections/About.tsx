import { PhotoFrame } from "@/components/media/PhotoFrame";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { about } from "@/content/home";
import styles from "./About.module.css";

export function About() {
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
          <p className={styles.pending}>{about.pending}</p>
        </div>
        <div className={styles.photo}>
          <PhotoFrame
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
