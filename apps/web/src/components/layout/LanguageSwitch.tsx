"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { LANGS, langOf, switchLanguage, type Lang } from "@/lib/locale";
import styles from "./LanguageSwitch.module.css";

interface LanguageSwitchProps {
  /** Nom du groupe, et nom de chaque version dans sa propre langue. */
  labels: { label: string; fr: string; en: string };
  /** Sur le champ encre du sommaire du téléphone. */
  onField?: boolean;
}

const SHORT: Record<Lang, string> = { fr: "FR", en: "EN" };

function Switch({ labels, onField, search }: LanguageSwitchProps & { search: string }) {
  const pathname = usePathname();
  const current = langOf(pathname);

  return (
    <ul className={onField ? `${styles.list} ${styles.onField}` : styles.list} aria-label={labels.label}>
      {LANGS.map((lang) => (
        <li key={lang}>
          {lang === current ? (
            <span className={`label ${styles.current}`} aria-current="true" lang={lang} title={labels[lang]}>
              {SHORT[lang]}
            </span>
          ) : (
            <Link
              href={switchLanguage(pathname, search, lang)}
              className={`label ${styles.link}`}
              hrefLang={lang}
              lang={lang}
              aria-label={labels[lang]}
            >
              {SHORT[lang]}
            </Link>
          )}
        </li>
      ))}
    </ul>
  );
}

function WithSearch(props: LanguageSwitchProps) {
  return <Switch {...props} search={useSearchParams().toString()} />;
}

/**
 * Sélecteur de langue (DESIGN.md, section 9) : la même page dans l'autre
 * langue, filtres compris. Sans paramètres encore lus, le lien mène à la page
 * sans ses filtres.
 */
export function LanguageSwitch(props: LanguageSwitchProps) {
  return (
    <Suspense fallback={<Switch {...props} search="" />}>
      <WithSearch {...props} />
    </Suspense>
  );
}
