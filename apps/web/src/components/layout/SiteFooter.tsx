import { site } from "@/config/site";
import { SiteNav } from "./SiteNav";
import styles from "./SiteFooter.module.css";

export function SiteFooter() {
  return (
    <footer className={styles.footer}>
      {/* Emplacement de la signature officielle du club, version inversée. */}
      <p className={styles.brand}>{site.name}</p>
      <SiteNav label="Navigation du pied de page" />
    </footer>
  );
}
