import Link from "next/link";
import type { ReactNode } from "react";
import styles from "./ArrowLink.module.css";

interface ArrowLinkProps {
  href: string;
  /** Vers le bas pour un lien qui mène plus loin dans la même page. */
  direction?: "right" | "down";
  children: ReactNode;
}

/** Lien d'action isolé : la forme d'appel par défaut du site. */
export function ArrowLink({
  href,
  direction = "right",
  children,
}: ArrowLinkProps) {
  return (
    <Link href={href} className={styles.link}>
      <span className={styles.label}>{children}</span>
      <svg
        className={direction === "down" ? styles.arrowDown : styles.arrow}
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        aria-hidden="true"
      >
        <path d="M3 10h14M11.5 4.5 17 10l-5.5 5.5" />
      </svg>
    </Link>
  );
}
