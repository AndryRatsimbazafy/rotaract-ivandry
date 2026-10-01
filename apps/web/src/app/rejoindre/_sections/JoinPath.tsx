import { ArrowLink } from "@/components/ui/ArrowLink";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { joinPath } from "@/content/join";
import styles from "./JoinPath.module.css";

export function JoinPath() {
  return (
    <section className={styles.sheet} aria-labelledby="parcours-titre">
      <div className={`container grid ${styles.layout}`}>
        <div className={styles.head}>
          <SectionLabel number={joinPath.number}>{joinPath.label}</SectionLabel>
          <h2 id="parcours-titre" className={styles.title}>
            {joinPath.title}
          </h2>
        </div>

        {/* Six étapes le long d'un filet : l'ordre est l'information. */}
        <ol className={styles.steps}>
          {joinPath.steps.map((step, index) => (
            <li key={step.title} className={styles.step}>
              <span className={styles.numeral} aria-hidden="true">
                {index + 1}
              </span>
              <div className={styles.body}>
                <h3 className={styles.name}>{step.title}</h3>
                {step.note ? (
                  <div className={styles.note}>
                    {step.note.map((paragraph) => (
                      <p key={paragraph}>{paragraph}</p>
                    ))}
                  </div>
                ) : null}
                {step.href && step.linkLabel ? (
                  <ArrowLink href={step.href} direction="down">
                    {step.linkLabel}
                  </ArrowLink>
                ) : null}
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
