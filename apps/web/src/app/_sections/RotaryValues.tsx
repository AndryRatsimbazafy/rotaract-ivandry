import type { CSSProperties } from "react";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { rotaryValues } from "@/content/home";
import styles from "./RotaryValues.module.css";

export function RotaryValues() {
  return (
    <section className={styles.field} aria-labelledby="valeurs-titre">
      <div className="container">
        <div className={styles.head}>
          <SectionLabel number={rotaryValues.number}>
            {rotaryValues.label}
          </SectionLabel>
          <h2 id="valeurs-titre" className={styles.title}>
            {rotaryValues.title}
          </h2>
        </div>
        <ol className={styles.values}>
          {rotaryValues.values.map((value, index) => (
            <li
              key={value.name}
              className={styles.value}
              style={{ "--step": index } as CSSProperties}
            >
              <span className={`meta ${styles.index}`} aria-hidden="true">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3 className={styles.name}>{value.name}</h3>
              <p className={styles.description}>{value.description}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
