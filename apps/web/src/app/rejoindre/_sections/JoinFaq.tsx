import { SectionLabel } from "@/components/ui/SectionLabel";
import { joinFaq } from "@/content/join";
import styles from "./JoinFaq.module.css";

// Une question sans réponse validée par le club n'est pas affichée.
const items = joinFaq.items.filter((item) => item.answer?.length);

export function JoinFaq() {
  if (items.length === 0) return null;

  return (
    <section className={styles.section} aria-labelledby="questions-frequentes-titre">
      <div className={`container grid ${styles.layout}`}>
        <div className={styles.head}>
          <SectionLabel number={joinFaq.number}>{joinFaq.label}</SectionLabel>
          <h2 id="questions-frequentes-titre" className={styles.title}>
            {joinFaq.title}
          </h2>
        </div>
        <div className={styles.list}>
          {items.map((item) => (
            <details key={item.id} className={styles.item}>
              <summary className={styles.question}>
                <h3 className={styles.name}>{item.question}</h3>
                <span className={styles.sign} aria-hidden="true" />
              </summary>
              <div className={styles.answer}>
                {item.answer?.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
