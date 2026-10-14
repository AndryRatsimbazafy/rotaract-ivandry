import { LangMark } from "@/components/ui/LangMark";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { getContent } from "@/content";
import styles from "./ClubHistory.module.css";

interface ClubHistoryProps {
  /** Paragraphes saisis dans le Back Office, dans la langue de la page. */
  paragraphs: string[];
  /** Vrai quand une page anglaise affiche l'histoire en français. */
  french?: boolean;
  /** Numéro de la section, calculé par la page selon les sections présentes. */
  number: string;
}

/**
 * L'histoire du club, en voix de récit : la première phrase en chapeau.
 * Sans histoire saisie, la section n'existe pas (rien d'inventé).
 */
export async function ClubHistory({ paragraphs, french, number }: ClubHistoryProps) {
  const { history } = (await getContent()).club;
  if (paragraphs.length === 0) return null;
  const [first, ...rest] = paragraphs;
  const lang = french ? "fr" : undefined;

  return (
    <section className={styles.section} aria-labelledby="club-histoire">
      <div className={`container grid ${styles.layout}`}>
        <div className={styles.head}>
          <SectionLabel number={number}>{history.label}</SectionLabel>
          <h2 id="club-histoire" className={styles.title}>
            {history.title}
          </h2>
          {french ? <LangMark show /> : null}
        </div>
        <div className={styles.text}>
          <p className={styles.lede} lang={lang}>
            {first}
          </p>
          {rest.map((paragraph, index) => (
            <p key={index} className={styles.paragraph} lang={lang}>
              {paragraph}
            </p>
          ))}
        </div>
      </div>
    </section>
  );
}
