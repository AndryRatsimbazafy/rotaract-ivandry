"use client";

import { ArrowLink } from "@/components/ui/ArrowLink";
import button from "@/components/ui/button.module.css";
import { usePathname } from "next/navigation";
import { contentFor } from "@/content/dictionaries";
import { langOf, localize } from "@/lib/locale";
import styles from "./system-page.module.css";

/**
 * Page d'erreur du site (DESIGN.md, section 9) : une phrase calme, la cause et
 * la correction. Aucun détail technique n'est affiché.
 */
export default function Error({ retry }: { error: Error & { digest?: string }; retry: () => void }) {
  // Composant client, sans paramètre de route : la langue vient de l'adresse.
  const lang = langOf(usePathname());
  const { errorPage } = contentFor(lang).common;
  return (
    <section className={styles.page} aria-labelledby="erreur-titre">
      <div className={`container grid ${styles.layout}`}>
        <div className={styles.body}>
          <h1 id="erreur-titre" className={styles.title}>
            {errorPage.title}
          </h1>
          <p className={styles.text}>{errorPage.text}</p>
          <button
            type="button"
            className={`${button.button} ${button.primary}`}
            onClick={() => retry()}
          >
            {errorPage.retry}
          </button>
          <ArrowLink href={localize("/", lang)}>{errorPage.home}</ArrowLink>
        </div>
      </div>
    </section>
  );
}
