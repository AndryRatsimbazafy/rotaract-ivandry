import { SectionLabel } from "@/components/ui/SectionLabel";
import { getContent } from "@/content";
import styles from "./RotaryLink.module.css";

interface RotaryLinkProps {
  /** Club parrain saisi dans le Back Office. */
  sponsorClub?: string;
  /** Vrai quand une page anglaise l'affiche en français. */
  sponsorFrench?: boolean;
  number: string;
}

/** Le Rotaract dans le Rotary, en entrée de dictionnaire, puis le club parrain. */
export async function RotaryLink({ sponsorClub, sponsorFrench, number }: RotaryLinkProps) {
  const { rotary } = (await getContent()).club;

  return (
    <section className={styles.section} aria-labelledby="club-rotary">
      <SectionLabel number={number}>{rotary.label}</SectionLabel>
      <h2 id="club-rotary" className={styles.hidden}>
        {rotary.label}
      </h2>
      <dl className={styles.entry}>
        <dt className={styles.term}>
          <dfn>{rotary.term}</dfn>
          <span className={styles.grammar}>{rotary.grammar}</span>
        </dt>
        <dd className={styles.definition}>{rotary.definition}</dd>
      </dl>
      {sponsorClub ? (
        <p className={styles.sponsor}>
          <span className="label">{rotary.sponsorLabel}</span>
          <span className={styles.sponsorName} lang={sponsorFrench ? "fr" : undefined}>
            {sponsorClub}
          </span>
        </p>
      ) : null}
    </section>
  );
}
