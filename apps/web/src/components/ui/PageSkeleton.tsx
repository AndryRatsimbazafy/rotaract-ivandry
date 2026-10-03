import styles from "./PageSkeleton.module.css";

/**
 * Forme des blocs d'attente, d'après la zone qu'ils remplacent : une action
 * (photographie et texte), une ligne du fil des actualités, l'actualité à la
 * une, ou l'annuaire (une personne en grand, puis trois portraits).
 */
type Shape = "entry" | "row" | "feature" | "directory";

const COUNTS: Record<Shape, number> = {
  entry: 2,
  row: 4,
  feature: 1,
  directory: 1,
};

interface ListSkeletonProps {
  /** Libellé accessible de l'attente. */
  label: string;
  shape: Shape;
  /** Vrai quand la zone remplacée est une section entière de la page. */
  standalone?: boolean;
  /**
   * Ancre de la section remplacée, que visent les liens de filtre : la page
   * se place sur l'attente, puis sur la section quand elle arrive.
   */
  id?: string;
}

/**
 * Attente d'une liste, pendant une nouvelle lecture (premier affichage ou
 * changement de filtre) : des blocs aux dimensions de la zone, sans texte ni
 * composition éditoriale. Purement technique.
 */
export function ListSkeleton({
  label,
  shape,
  standalone,
  id,
}: ListSkeletonProps) {
  const blocks = Array.from({ length: COUNTS[shape] }, (_, index) => index);
  const list = (
    <div role="status" aria-label={label} className={styles.list}>
      {shape === "directory" ? (
        <>
          <div className={styles.lead} />
          <div className={styles.plates}>
            <div />
            <div />
            <div />
          </div>
        </>
      ) : (
        blocks.map((block) => <div key={block} className={styles[shape]} />)
      )}
    </div>
  );

  return standalone ? (
    <div id={id} className={styles.standalone}>
      <div className="container">{list}</div>
    </div>
  ) : (
    list
  );
}

/**
 * État d'attente d'une page de liste à son premier affichage : l'ouverture,
 * puis le début de la liste, aux dimensions du contenu.
 */
export function PageSkeleton({ label, shape }: { label: string; shape: Shape }) {
  return (
    <div className={styles.skeleton}>
      <div className="container">
        <div className={styles.opening} />
        <ListSkeleton label={label} shape={shape} />
      </div>
    </div>
  );
}
