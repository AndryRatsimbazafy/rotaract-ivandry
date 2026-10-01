import Link from "next/link";
import styles from "./Onward.module.css";

interface OnwardProps {
  label: string;
  links: { href: string; label: string }[];
}

/** Sortie de page : deux ou trois liens en grand, sur une ligne chacun. */
export function Onward({ label, links }: OnwardProps) {
  return (
    <nav aria-label={label} className={styles.onward}>
      <div className="container">
        <p className={`label ${styles.label}`}>{label}</p>
        <ul className={styles.links}>
          {links.map((link) => (
            <li key={link.href}>
              <Link href={link.href} className={styles.link}>
                <span>{link.label}</span>
                <svg
                  className={styles.arrow}
                  viewBox="0 0 20 20"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  aria-hidden="true"
                >
                  <path d="M3 10h14M11.5 4.5 17 10l-5.5 5.5" />
                </svg>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
