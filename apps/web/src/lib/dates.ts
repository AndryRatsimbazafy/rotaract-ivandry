import type { Lang } from "./locale";

// Dates en français et en anglais. Seul fichier du site à porter un fuseau :
// le jour et le mois d'une actualité sont ceux de Madagascar, quel que soit le
// serveur ou le visiteur. La date d'une action est une date sans heure : elle
// se lit telle qu'enregistrée, en temps universel. L'heure n'est jamais
// affichée.

const TIME_ZONE = "Indian/Antananarivo";
const LOCALES: Record<Lang, string> = { fr: "fr-FR", en: "en-GB" };

function formatter(lang: Lang, options: Intl.DateTimeFormatOptions, timeZone = TIME_ZONE) {
  return new Intl.DateTimeFormat(LOCALES[lang], { ...options, timeZone });
}

/** « 14 » */
export function formatDay(isoDate: string, lang: Lang) {
  return formatter(lang, { day: "2-digit" }).format(new Date(isoDate));
}

/** « mars 2026 », « March 2026 » */
export function formatMonthYear(isoDate: string, lang: Lang) {
  return formatter(lang, { month: "long", year: "numeric" }).format(new Date(isoDate));
}

/** « 14 mars 2026 », « 14 March 2026 », en heure de Madagascar (actualité). */
export function formatFullDate(isoDate: string, lang: Lang) {
  return formatter(lang, { day: "numeric", month: "long", year: "numeric" }).format(
    new Date(isoDate),
  );
}

/** « 14 mars 2026 », sans conversion de fuseau (date sans heure d'une action). */
export function formatCalendarDate(isoDate: string, lang: Lang) {
  return formatter(lang, { day: "numeric", month: "long", year: "numeric" }, "UTC").format(
    new Date(isoDate),
  );
}
