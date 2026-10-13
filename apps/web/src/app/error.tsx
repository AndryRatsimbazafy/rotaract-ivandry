"use client";

import { ArrowLink } from "@/components/ui/ArrowLink";
import button from "@/components/ui/button.module.css";
import { errorPage } from "@/content/common";
import styles from "./system-page.module.css";

/**
 * Page d'erreur du site (DESIGN.md, section 9) : une phrase calme, la cause et
 * la correction. Aucun détail technique n'est affiché.
 */
export default function Error({ retry }: { error: Error & { digest?: string }; retry: () => void }) {
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
          <ArrowLink href="/">{errorPage.home}</ArrowLink>
        </div>
      </div>
    </section>
  );
}
