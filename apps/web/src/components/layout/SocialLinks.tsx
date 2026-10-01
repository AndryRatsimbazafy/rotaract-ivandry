import { site, type SocialLink } from "@/config/site";
import styles from "./SocialLinks.module.css";

/** Deux pictogrammes au trait, dans le même dessin que les flèches du site. */
const icons: Record<SocialLink["id"], React.ReactNode> = {
  facebook: (
    <path d="M12.5 17.5v-6.25h2.1l.4-2.5h-2.5V7.4c0-.8.4-1.4 1.5-1.4H15V3.7c-.5-.1-1.2-.2-1.9-.2-2.1 0-3.4 1.3-3.4 3.5v1.75H7.5v2.5h2.2v6.25" />
  ),
  instagram: (
    <>
      <rect x="3" y="3" width="14" height="14" rx="3.5" />
      <circle cx="10" cy="10" r="3.25" />
      <path d="M14.25 5.75h.01" strokeLinecap="round" />
    </>
  ),
};

/**
 * Liens vers les réseaux sociaux du club. Tant qu'une adresse n'est pas
 * renseignée dans la configuration, le pictogramme s'affiche sans lien.
 */
export function SocialLinks() {
  return (
    <ul className={styles.list} aria-label="Réseaux sociaux du club">
      {site.social.map((network) => {
        const icon = (
          <svg
            className={styles.icon}
            viewBox="0 0 20 20"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            {icons[network.id]}
          </svg>
        );

        return (
          <li key={network.id}>
            {network.href ? (
              <a
                href={network.href}
                className={styles.link}
                aria-label={`${network.label} du club`}
                rel="noopener noreferrer"
                target="_blank"
              >
                {icon}
              </a>
            ) : (
              <span className={styles.link} title={`${network.label} : lien à venir`}>
                {icon}
                <span className={styles.hidden}>
                  {network.label} : lien à venir
                </span>
              </span>
            )}
          </li>
        );
      })}
    </ul>
  );
}
