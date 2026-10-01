import Link from "next/link";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { mainNavigation, routes } from "@/config/routes";
import { joinField } from "@/content/home";
import styles from "./JoinReminder.module.css";

// Un libellé par intention : le même que dans la navigation.
const joinLabel =
  mainNavigation.find((item) => item.href === routes.join)?.label ?? "";

/**
 * Rappel cranberry : la conclusion des pages autres que l'accueil.
 * Une bande basse, la question et l'appel. Le champ entier reste sur l'accueil.
 */
export function JoinReminder() {
  return (
    <section className={styles.band} aria-labelledby="rappel-titre">
      <div className={`container grid ${styles.layout}`}>
        <div className={styles.head}>
          <SectionLabel>{joinLabel}</SectionLabel>
          <h2 id="rappel-titre" className={styles.title}>
            {joinField.title}
          </h2>
        </div>
        <Link href={routes.join} className={styles.action}>
          <span>{joinLabel}</span>
          <svg
            className={styles.arrow}
            viewBox="0 0 20 20"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            aria-hidden="true"
          >
            <path d="M3 10h14M11.5 4.5 17 10l-5.5 5.5" />
          </svg>
        </Link>
      </div>
    </section>
  );
}
