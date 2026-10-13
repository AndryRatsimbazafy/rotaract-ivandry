// Dates en français. Seul fichier du site à porter un fuseau : le jour et le
// mois d'une actualité sont ceux de Madagascar, quel que soit le serveur ou
// le visiteur. La date d'une action est une date sans heure : elle se lit
// telle qu'enregistrée, en temps universel. L'heure n'est jamais affichée.

const TIME_ZONE = "Indian/Antananarivo";

const day = new Intl.DateTimeFormat("fr-FR", {
  day: "2-digit",
  timeZone: TIME_ZONE,
});
const monthYear = new Intl.DateTimeFormat("fr-FR", {
  month: "long",
  year: "numeric",
  timeZone: TIME_ZONE,
});

/** « 14 » */
export function formatDay(isoDate: string) {
  return day.format(new Date(isoDate));
}

/** « mars 2026 » */
export function formatMonthYear(isoDate: string) {
  return monthYear.format(new Date(isoDate));
}

const fullDate = new Intl.DateTimeFormat("fr-FR", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: TIME_ZONE,
});
const calendarDate = new Intl.DateTimeFormat("fr-FR", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

/** « 14 mars 2026 », en heure de Madagascar (actualité). */
export function formatFullDate(isoDate: string) {
  return fullDate.format(new Date(isoDate));
}

/** « 14 mars 2026 », sans conversion de fuseau (date sans heure d'une action). */
export function formatCalendarDate(isoDate: string) {
  return calendarDate.format(new Date(isoDate));
}
