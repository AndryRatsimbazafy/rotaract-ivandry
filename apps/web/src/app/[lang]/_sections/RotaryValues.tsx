import { ArrowLink } from "@/components/ui/ArrowLink";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { routes } from "@/config/routes";
import styles from "./RotaryValues.module.css";
import { getContent } from "@/content";

/**
 * 02 : forme courte (DESIGN.md, section 6). Les cinq noms sur une ligne qui
 * passe à la ligne ; les définitions vivent sur la page Nous rejoindre.
 */
export async function RotaryValues() {
  const content = await getContent();
  const { rotaryValues } = content.home;
  return (
    <section className={styles.field} aria-labelledby="valeurs-titre">
      <div className="container">
        <div className={styles.head}>
          <SectionLabel number={rotaryValues.number}>
            {rotaryValues.label}
          </SectionLabel>
          <h2 id="valeurs-titre" className={styles.title}>
            {rotaryValues.title}
          </h2>
        </div>
        <ul className={styles.values}>
          {rotaryValues.values.map((value) => (
            <li key={value.name} className={styles.value}>
              {value.name}
            </li>
          ))}
        </ul>
        <p className={styles.more}>
          <ArrowLink href={`${routes.join}#valeurs`}>{rotaryValues.more}</ArrowLink>
        </p>
      </div>
    </section>
  );
}
