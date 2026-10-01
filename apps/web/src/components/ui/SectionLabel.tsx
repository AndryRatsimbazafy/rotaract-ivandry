import styles from "./SectionLabel.module.css";

interface SectionLabelProps {
  /** Numéro de la section dans la page. */
  number?: string;
  children: string;
}

/** Étiquette de section : un numéro, un filet, quelques mots. */
export function SectionLabel({ number, children }: SectionLabelProps) {
  return (
    <p className={`label ${styles.sectionLabel}`}>
      {number ? <span className={styles.number}>{number}</span> : null}
      <span className={styles.rule} aria-hidden="true" />
      <span>{children}</span>
    </p>
  );
}
