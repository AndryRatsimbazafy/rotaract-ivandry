import { mainNavigation } from "@/config/routes";
import { NavLink } from "./NavLink";
import styles from "./SiteNav.module.css";

interface SiteNavProps {
  /** Nom accessible du repère : distingue la navigation de l'en-tête de celle du pied de page. */
  label: string;
  variant: "header" | "footer";
}

export function SiteNav({ label, variant }: SiteNavProps) {
  return (
    <nav aria-label={label} className={styles[variant]}>
      <ul className={styles.list}>
        {mainNavigation.map((item) => (
          <li key={item.href}>
            <NavLink
              href={item.href}
              className={
                variant === "header" && item.isRecruitment
                  ? styles.join
                  : styles.link
              }
            >
              <span className={styles.text}>{item.label}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
