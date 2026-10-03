// Dates en français. Seul fichier du site à porter un fuseau : le jour et le
// mois d'une actualité sont ceux de Madagascar, quel que soit le serveur ou
// le visiteur. L'heure n'est jamais affichée.

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
