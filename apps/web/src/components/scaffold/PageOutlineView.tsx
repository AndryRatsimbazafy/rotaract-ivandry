import { PageSection } from "@/components/layout/PageSection";
import type { PageOutline } from "@/content/pages";
import styles from "./PageOutlineView.module.css";

interface PageOutlineViewProps {
  outline: PageOutline;
}

/**
 * Affichage provisoire du plan d'une page : son nom, son objectif et ses
 * sections prévues. À retirer d'une page dès que celle-ci est conçue.
 */
export function PageOutlineView({ outline }: PageOutlineViewProps) {
  return (
    <div className={styles.outline}>
      <header>
        <h1>{outline.title}</h1>
        <p className={styles.lede}>{outline.objective}</p>
        <p>Structure provisoire : cette page n&apos;est pas encore conçue.</p>
      </header>

      {outline.sections.map((section) => (
        <PageSection key={section.id} id={section.id} title={section.title}>
          {section.summary ? <p>{section.summary}</p> : null}
        </PageSection>
      ))}

      {outline.later ? (
        <PageSection id="prevu-plus-tard" title="Prévu plus tard">
          <ul>
            {outline.later.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </PageSection>
      ) : null}
    </div>
  );
}
