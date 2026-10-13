import type { Metadata } from "next";
import { ArrowLink } from "@/components/ui/ArrowLink";
import styles from "./system-page.module.css";
import { getContent } from "@/content";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getContent()).common.notFoundPage.metaTitle };
}

/** Page introuvable du site : contenu retiré, non publié ou adresse inconnue. */
export default async function NotFound() {
  const content = await getContent();
  const { notFoundPage } = content.common;
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
