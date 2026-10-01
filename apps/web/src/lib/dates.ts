// Dates en français. Le fuseau UTC évite qu'une date ISO change de jour selon
// le serveur.

const day = new Intl.DateTimeFormat("fr-FR", { day: "2-digit", timeZone: "UTC" });
const monthYear = new Intl.DateTimeFormat("fr-FR", {
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});
const full = new Intl.DateTimeFormat("fr-FR", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

/** « 14 » */
export function formatDay(isoDate: string) {
  return day.format(new Date(isoDate));
}

/** « mars 2026 » */
export function formatMonthYear(isoDate: string) {
  return monthYear.format(new Date(isoDate));
}

/** « 14 mars 2026 » */
export function formatFullDate(isoDate: string) {
  return full.format(new Date(isoDate));
}
