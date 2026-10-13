import { SectionLabel } from "@/components/ui/SectionLabel";
import { joinFaq } from "@/content/join";
import type { SiteSettings } from "@/types/site-settings";
import styles from "./JoinFaq.module.css";

interface JoinFaqProps {
  /** Réponses saisies dans le Back Office ; à défaut, celles du code. */
  answers: SiteSettings["faq"];
}

export function JoinFaq({ answers }: JoinFaqProps) {
  // Une question sans réponse validée par le club n'est pas affichée.
  const items = joinFaq.items.flatMap((item) => {
    const answer = answers[item.id] ?? item.answer;
    return answer?.length ? [{ ...item, answer }] : [];
  });
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
            <details key={item.id} className={`fold ${styles.item}`}>
              <summary className={styles.question}>
                <h3 className={styles.name}>{item.question}</h3>
                <span className={styles.sign} aria-hidden="true" />
              </summary>
              <div className={styles.answer}>
                {item.answer.map((paragraph) => (
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
