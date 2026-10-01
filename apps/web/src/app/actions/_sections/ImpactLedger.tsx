import { SectionLabel } from "@/components/ui/SectionLabel";
import { impactLedger } from "@/content/actions";
import type { ImpactIndicator } from "@/types/action";
import styles from "./ImpactLedger.module.css";

interface ImpactLedgerProps {
  indicators: ImpactIndicator[];
}

export function ImpactLedger({ indicators }: ImpactLedgerProps) {
  return (
    <section className={styles.field} aria-labelledby="impact-titre">
      <div className={`container grid ${styles.layout}`}>
        <div className={styles.head}>
          <SectionLabel number={impactLedger.number}>
            {impactLedger.label}
          </SectionLabel>
          <h2 id="impact-titre" className={styles.title}>
            {impactLedger.title}
          </h2>
          <p className={styles.intro}>{impactLedger.intro}</p>
        </div>

        {/* Un registre : une ligne par indicateur, jamais des tuiles de chiffres. */}
        <dl className={styles.ledger}>
          {indicators.map((indicator) => (
            <div key={indicator.id} className={styles.row}>
              <dt className={styles.name}>{indicator.label}</dt>
              {indicator.value ? (
                <dd className={styles.value}>{indicator.value}</dd>
              ) : (
                <dd className={`label ${styles.pending}`}>
                  {impactLedger.pending}
                </dd>
              )}
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
