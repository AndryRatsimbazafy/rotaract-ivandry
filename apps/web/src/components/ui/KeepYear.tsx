import { Fragment } from "react";
import styles from "./KeepYear.module.css";

const YEAR = /(\d{4}-\d{4})/;

/**
 * Texte où une année Rotary (« 2026-2027 ») ne se coupe jamais à son trait
 * d'union : sur téléphone, la une passe à la ligne avant l'année.
 */
export function KeepYear({ children }: { children: string }) {
  return children.split(YEAR).map((part, index) =>
    YEAR.test(part) ? (
      <span key={index} className={styles.year}>
        {part}
      </span>
    ) : (
      <Fragment key={index}>{part}</Fragment>
    ),
  );
}
