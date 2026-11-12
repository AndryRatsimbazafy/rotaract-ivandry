import styles from "./EmptyNote.module.css";

interface EmptyNoteProps {
  /** Une phrase calme : rien n'est encore publié. */
  children: string;
  className?: string;
}

/**
 * Collection vide (DESIGN.md, section 8) : une phrase entre deux filets, à la
 * place des entrées. Aucune entrée fantôme, rien d'inventé.
 */
export function EmptyNote({ children, className }: EmptyNoteProps) {
  return (
    <div className={className ? `${styles.note} ${className}` : styles.note}>
      <p className={styles.text}>{children}</p>
    </div>
  );
}
