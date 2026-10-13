import type { Metadata } from "next";
import { ArrowLink } from "@/components/ui/ArrowLink";
import { notFoundPage } from "@/content/common";
import styles from "./system-page.module.css";

export const metadata: Metadata = {
  title: "Page introuvable",
};

/** Page introuvable du site : contenu retiré, non publié ou adresse inconnue. */
export default function NotFound() {
  return (
    <section className={styles.page} aria-labelledby="introuvable-titre">
      <div className={`container grid ${styles.layout}`}>
        <p className={styles.numeral} aria-hidden="true">
          {notFoundPage.code}
        </p>
        <div className={styles.body}>
          <h1 id="introuvable-titre" className={styles.title}>
            {notFoundPage.title}
          </h1>
          <p className={styles.text}>{notFoundPage.text}</p>
          <ul className={styles.links}>
            {notFoundPage.links.map((link) => (
              <li key={link.href}>
                <ArrowLink href={link.href}>{link.label}</ArrowLink>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
