"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef, type ReactNode } from "react";
import { mainNavigation, routes } from "@/config/routes";
import styles from "./MobileMenu.module.css";

interface MobileMenuProps {
  /** Lieu et année, repris de la une. */
  dateline: string[];
  /** Les liens vers les réseaux sociaux, rendus par l'en-tête. */
  social: ReactNode;
}

function isCurrent(href: string, pathname: string) {
  return href === routes.home
    ? pathname === href
    : pathname === href || pathname.startsWith(`${href}/`);
}

/**
 * Menu du téléphone : le sommaire du journal, en plein écran.
 * L'élément dialog fournit le piège de focus et la fermeture par Échap.
 */
export function MobileMenu({ dateline, social }: MobileMenuProps) {
  const dialog = useRef<HTMLDialogElement>(null);
  const pathname = usePathname();
  const close = () => dialog.current?.close();

  return (
    <div className={styles.menu}>
      <button
        type="button"
        className={`label ${styles.trigger}`}
        aria-haspopup="dialog"
        onClick={() => dialog.current?.showModal()}
      >
        Menu
        <span className={styles.bars} aria-hidden="true" />
      </button>

      <dialog ref={dialog} className={styles.panel} aria-label="Menu">
        <div className={styles.panelHead}>
          <p className="label">Sommaire</p>
          <button
            type="button"
            className={`label ${styles.close}`}
            onClick={close}
          >
            Fermer
          </button>
        </div>
        <nav aria-label="Navigation principale">
          <ol className={styles.entries}>
            {mainNavigation.map((item, index) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={styles.entry}
                  aria-current={
                    isCurrent(item.href, pathname) ? "page" : undefined
                  }
                  onClick={close}
                >
                  <span className={`meta ${styles.index}`} aria-hidden="true">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span>{item.label}</span>
                  {isCurrent(item.href, pathname) ? (
                    <span className={`label ${styles.here}`}>Page affichée</span>
                  ) : null}
                </Link>
              </li>
            ))}
          </ol>
        </nav>
        <div className={styles.foot}>
          <p className={`label ${styles.dateline}`}>
            {dateline.map((item) => (
              <span key={item}>{item}</span>
            ))}
          </p>
          {social}
        </div>
      </dialog>
    </div>
  );
}
