import { SectionLabel } from "@/components/ui/SectionLabel";
import { getContent } from "@/content";
import styles from "./ClubFigures.module.css";

export interface ClubFigureValues {
  foundedYear?: number;
  memberCount?: number;
  actionCount?: number;
  yearCount?: number;
}

const ORDER = ["foundedYear", "memberCount", "actionCount", "yearCount"] as const;

/**
 * Chiffres clés, tous tirés de données réelles (FR-013) : un chiffre absent
 * ou nul n'a pas de ligne, et la section disparaît sans chiffre. Aucun compteur
 * animé (DESIGN.md, section 12).
 */
/** Vrai quand au moins un chiffre existe : la section s'affiche. */
export function hasFigures(values: ClubFigureValues): boolean {
  return ORDER.some((key) => Boolean(values[key]));
}

export async function ClubFigures({ values, number }: { values: ClubFigureValues; number: string }) {
  const { figures } = (await getContent()).club;
  const rows = ORDER.flatMap((key) => {
    const value = values[key];
    return value ? [{ key, value }] : [];
  });
  if (rows.length === 0) return null;

  return (
    <section className={styles.section} aria-labelledby="club-chiffres">
      <SectionLabel number={number}>{figures.label}</SectionLabel>
      <h2 id="club-chiffres" className={styles.title}>
        {figures.title}
      </h2>
      <dl className={styles.list}>
        {rows.map(({ key, value }) => (
          <div key={key} className={styles.row}>
            <dt className={`label ${styles.name}`}>{figures.labels[key]}</dt>
            <dd className={styles.value}>{value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
