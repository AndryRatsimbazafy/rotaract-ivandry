import { ArrowLink } from "@/components/ui/ArrowLink";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { focusAreas } from "@/content/home";
import styles from "./FocusAreas.module.css";

export function FocusAreas() {
  return (
    <section className={styles.section} aria-labelledby="axes-titre">
      <div className={`container grid ${styles.layout}`}>
        <div className={styles.head}>
          <SectionLabel number={focusAreas.number}>
            {focusAreas.label}
          </SectionLabel>
          <h2 id="axes-titre" className={styles.title}>
            <span className={styles.count}>{focusAreas.count}</span>{" "}
            <span className={styles.words}>{focusAreas.title}</span>
          </h2>
          <p className={styles.intro}>{focusAreas.intro}</p>
        </div>
        <ol className={styles.areas}>
          {focusAreas.areas.map((area, index) => (
            <li key={area.title} className={styles.area}>
              <span className={`meta ${styles.index}`} aria-hidden="true">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3 className={styles.name}>{area.title}</h3>
              {area.description ? (
                <p className={styles.description}>{area.description}</p>
              ) : null}
              {area.href ? (
                <ArrowLink href={area.href}>En savoir plus</ArrowLink>
              ) : null}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
