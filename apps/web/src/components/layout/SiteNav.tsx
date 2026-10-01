import { mainNavigation } from "@/config/routes";
import { NavLink } from "./NavLink";
import styles from "./SiteNav.module.css";

interface SiteNavProps {
  /** Nom accessible du repère : distingue la navigation de l'en-tête de celle du pied de page. */
  label: string;
}

export function SiteNav({ label }: SiteNavProps) {
  return (
    <nav aria-label={label}>
      <ul className={styles.list}>
        {mainNavigation.map((item) => (
          <li key={item.href}>
            <NavLink href={item.href}>{item.label}</NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
