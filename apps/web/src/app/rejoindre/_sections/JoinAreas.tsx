import { ArrowLink } from "@/components/ui/ArrowLink";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { routes } from "@/config/routes";
import { focusAreas } from "@/content/home";
import { joinAreas } from "@/content/join";
import styles from "./JoinAreas.module.css";

export function JoinAreas() {
  return (
    <section className={styles.field} aria-labelledby="domaines-titre">
      <div className="container">
        <div className={`grid ${styles.head}`}>
          <div className={styles.heading}>
            <SectionLabel number={joinAreas.number}>{joinAreas.label}</SectionLabel>
            <h2 id="domaines-titre" className={styles.title}>
              {joinAreas.title}
            </h2>
          </div>
          <div className={styles.aside}>
            <p className={styles.intro}>{joinAreas.intro}</p>
            <ArrowLink href={routes.actions}>{joinAreas.link}</ArrowLink>
          </div>
        </div>

        {/* Sept lignes en grand, tour à tour à gauche et à droite. */}
        <ol className={styles.areas}>
          {focusAreas.areas.map((area, index) => (
            <li key={area.id} className={styles.area}>
              <span className={`meta ${styles.index}`} aria-hidden="true">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className={styles.name}>{area.title}</span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
