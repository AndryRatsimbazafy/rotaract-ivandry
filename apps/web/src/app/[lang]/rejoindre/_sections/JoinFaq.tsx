import { SectionLabel } from "@/components/ui/SectionLabel";
import type { SiteSettings } from "@/types/site-settings";
import styles from "./JoinFaq.module.css";
import { frenchLang, LangMark } from "@/components/ui/LangMark";
import { contentFor, getContent } from "@/content";
import { currentLang } from "@/lib/current-lang";

interface JoinFaqProps {
  /** Réponses saisies dans le Back Office ; à défaut, celles du code. */
  answers: SiteSettings["faq"];
  /** Réponses anglaises saisies dans le Back Office (fonctionnalité 014). */
  answersEn: SiteSettings["faqEn"];
}

const same = (a: string[] | undefined, b: string[] | undefined) =>
  (a ?? []).join("\n") === (b ?? []).join("\n");

export async function JoinFaq({ answers, answersEn }: JoinFaqProps) {
  const content = await getContent();
  const lang = await currentLang();
  const { joinFaq } = content.join;
  const frenchItems = contentFor("fr").join.joinFaq.items;
  // Une question sans réponse validée par le club n'est pas affichée. Sur la
  // page anglaise : la réponse anglaise saisie, sinon la traduction du code
  // tant que la réponse française n'a pas changé, sinon la réponse française.
  const items = joinFaq.items.flatMap((item) => {
    const saved = answers[item.id];
    if (lang === "fr") {
      const answer = saved ?? item.answer;
      return answer?.length ? [{ ...item, answer, french: false }] : [];
    }
    const codeFrench = frenchItems.find(({ id }) => id === item.id)?.answer;
    const answer =
      answersEn[item.id] ?? (!saved || same(saved, codeFrench) ? item.answer : undefined);
    if (answer?.length) return [{ ...item, answer, french: false }];
    return saved?.length ? [{ ...item, answer: saved, french: true }] : [];
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
                  <p key={paragraph} lang={frenchLang(item.french)}>
                    {paragraph}
                  </p>
                ))}
                <LangMark show={item.french} />
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
