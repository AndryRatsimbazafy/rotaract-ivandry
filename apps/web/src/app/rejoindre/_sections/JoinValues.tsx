import { SectionLabel } from "@/components/ui/SectionLabel";
import { rotaryValues } from "@/content/home";
import { joinValues } from "@/content/join";
import styles from "./JoinValues.module.css";

export function JoinValues() {
  return (
    <section className={styles.section} aria-labelledby="valeurs-titre">
      <div className="container">
        <SectionLabel number={joinValues.number}>{joinValues.label}</SectionLabel>
        <h2 id="valeurs-titre" className={styles.title}>
          {joinValues.title}
        </h2>

        {/* De part et d'autre d'un axe : le nom à gauche, la définition à droite. */}
        <dl className={styles.values}>
          {rotaryValues.values.map((value) => (
            <div key={value.name} className={`grid ${styles.value}`}>
              <dt className={styles.name}>{value.name}</dt>
              <dd className={styles.description}>{value.description}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
