import { mainNavigation } from "@/config/routes";
import { getContent } from "@/content";
import { NavLink } from "./NavLink";
import styles from "./SiteNav.module.css";

interface SiteNavProps {
  /** Nom accessible du repère : distingue la navigation de l'en-tête de celle du pied de page. */
  label: string;
  variant: "header" | "footer";
}

export async function SiteNav({ label, variant }: SiteNavProps) {
  const { navigation } = (await getContent()).common.chrome;
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
              <span className={styles.text}>{navigation[item.key]}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
