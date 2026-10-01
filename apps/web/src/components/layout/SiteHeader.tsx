import Link from "next/link";
import { routes } from "@/config/routes";
import { site } from "@/config/site";
import { SiteNav } from "./SiteNav";
import styles from "./SiteHeader.module.css";

export function SiteHeader() {
  return (
    <header className={styles.header}>
      {/* Emplacement de la signature officielle du club. */}
      <Link href={routes.home} className={styles.brand}>
        {site.name}
      </Link>
      <SiteNav label="Navigation principale" />
    </header>
  );
}
