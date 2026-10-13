"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef, type ReactNode } from "react";
import { mainNavigation, routes, type NavKey } from "@/config/routes";
import { langOf, localize, stripLang } from "@/lib/locale";
import styles from "./MobileMenu.module.css";

interface MobileMenuProps {
  /** Lieu et année, repris de la une. */
  dateline: string[];
  /** Les liens vers les réseaux sociaux, rendus par l'en-tête. */
  social: ReactNode;
  /** Le sélecteur de langue, rendu par l'en-tête. */
  languages: ReactNode;
  /** Libellés de la navigation, dans la langue de la page. */
  navigation: Record<NavKey, string>;
  labels: {
    open: string;
    title: string;
    close: string;
    dialogLabel: string;
    current: string;
    mainNav: string;
  };
}

function isCurrent(href: string, pathname: string) {
  const page = stripLang(pathname);
  return href === routes.home ? page === href : page === href || page.startsWith(`${href}/`);
}

/**
 * Menu du téléphone : le sommaire du journal, en plein écran.
 * L'élément dialog fournit le piège de focus et la fermeture par Échap.
 */
export function MobileMenu({ dateline, social, languages, navigation, labels }: MobileMenuProps) {
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
        {labels.open}
        <span className={styles.bars} aria-hidden="true" />
      </button>

      <dialog ref={dialog} className={styles.panel} aria-label={labels.dialogLabel}>
        <div className={styles.panelHead}>
          <p className="label">{labels.title}</p>
          <button
            type="button"
            className={`label ${styles.close}`}
            onClick={close}
          >
            {labels.close}
          </button>
        </div>
        <nav aria-label={labels.mainNav}>
          <ol className={styles.entries}>
            {mainNavigation.map((item, index) => (
              <li key={item.href}>
                <Link
                  href={localize(item.href, langOf(pathname))}
                  className={styles.entry}
                  aria-current={
                    isCurrent(item.href, pathname) ? "page" : undefined
                  }
                  onClick={close}
                >
                  <span className={`meta ${styles.index}`} aria-hidden="true">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span>{navigation[item.key]}</span>
                  {isCurrent(item.href, pathname) ? (
                    <span className={`label ${styles.here}`}>{labels.current}</span>
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
          <div className={styles.tools}>
            {languages}
            {social}
          </div>
        </div>
      </dialog>
    </div>
  );
}
