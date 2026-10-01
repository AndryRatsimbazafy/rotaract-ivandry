import { SectionLabel } from "@/components/ui/SectionLabel";
import { actionDefinition } from "@/content/actions";
import styles from "./ActionDefinition.module.css";

export function ActionDefinition() {
  return (
    <section className={styles.sheet} aria-labelledby="definition-titre">
      <div className={`container grid ${styles.layout}`}>
        <div className={styles.head}>
          <SectionLabel number={actionDefinition.number}>
            {actionDefinition.label}
          </SectionLabel>
          <h2 id="definition-titre" className={styles.title}>
            {actionDefinition.title}
          </h2>
        </div>

        {/* Une entrée de dictionnaire : le mot, sa nature, sa définition. */}
        <dl className={styles.entry}>
          <dt className={styles.term}>
            <dfn>{actionDefinition.term}</dfn>
            <span className={styles.grammar}>{actionDefinition.grammar}</span>
          </dt>
          <dd className={styles.definition}>{actionDefinition.definition}</dd>
        </dl>

        <ol className={styles.criteria}>
          {actionDefinition.criteria.map((criterion, index) => (
            <li key={criterion} className={styles.criterion}>
              <span className={`meta ${styles.index}`} aria-hidden="true">
                {String(index + 1).padStart(2, "0")}
              </span>
              {criterion}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
