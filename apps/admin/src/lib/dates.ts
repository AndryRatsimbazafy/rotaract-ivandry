// Seul fichier à connaître le fuseau du club. Toute conversion Madagascar ↔
// temps universel et tout formatage de date passent par ici, sur le serveur :
// le fuseau de l'ordinateur de l'administrateur n'intervient jamais.
// Madagascar n'a pas de changement d'heure : le décalage est constant.
const TIME_ZONE = "Indian/Antananarivo";
const UTC_OFFSET = "+03:00";

const LOCAL_DATE_TIME = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/;
const LOCAL_DATE = /^\d{4}-\d{2}-\d{2}$/;

const partsFormat = new Intl.DateTimeFormat("en-CA", {
  timeZone: TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

const dateTimeFormat = new Intl.DateTimeFormat("fr-FR", {
  timeZone: TIME_ZONE,
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

const dateFormat = new Intl.DateTimeFormat("fr-FR", {
  timeZone: TIME_ZONE,
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

const utcDateFormat = new Intl.DateTimeFormat("fr-FR", {
  timeZone: "UTC",
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

function instant(value: string): Date | null {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

// Heure de Madagascar saisie (AAAA-MM-JJTHH:mm) → instant ISO en temps
// universel. null si la valeur est mal formée.
export function madagascarInputToIso(value: string): string | null {
  if (!LOCAL_DATE_TIME.test(value)) {
    return null;
  }
  return instant(`${value}:00.000${UTC_OFFSET}`)?.toISOString() ?? null;
}

// Instant ISO → valeur d'un champ de date et heure, en heure de Madagascar.
export function isoToMadagascarInput(iso: string): string {
  const date = instant(iso);
  if (!date) {
    return "";
  }
  const parts = Object.fromEntries(
    partsFormat.formatToParts(date).map(({ type, value }) => [type, value]),
  );
  return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}`;
}

// Instant → « 15/09/2026 18:30 », en heure de Madagascar.
export function formatDateTime(iso: string | null): string {
  const date = iso ? instant(iso) : null;
  return date ? dateTimeFormat.format(date).replace(",", "") : "";
}

// Instant → « 15/09/2026 », en heure de Madagascar.
export function formatDate(iso: string | null): string {
  const date = iso ? instant(iso) : null;
  return date ? dateFormat.format(date) : "";
}

// Date sans heure (action, borne d'une année Rotary) → le jour enregistré.
export function formatUtcDate(iso: string | null): string {
  const date = iso ? instant(iso) : null;
  return date ? utcDateFormat.format(date) : "";
}

// Date sans heure → valeur d'un champ de date (AAAA-MM-JJ).
export function isoToDateInput(iso: string): string {
  return instant(iso)?.toISOString().slice(0, 10) ?? "";
}

// Jour de Madagascar (AAAA-MM-JJ) → instant ISO de son début, ou de sa fin.
export function madagascarDayStart(day: string): string | null {
  if (!LOCAL_DATE.test(day)) {
    return null;
  }
  return instant(`${day}T00:00:00.000${UTC_OFFSET}`)?.toISOString() ?? null;
}

export function madagascarDayEnd(day: string): string | null {
  if (!LOCAL_DATE.test(day)) {
    return null;
  }
  return instant(`${day}T23:59:59.999${UTC_OFFSET}`)?.toISOString() ?? null;
}

export type ComparableYear = {
  id: string;
  label: string;
  from: string;
  to: string;
};

type YearBounds = {
  id: string;
  label: string;
  startDate: string;
  endDate: string;
};

// Bornes d'une année Rotary dans la forme du champ de date d'une action
// (AAAA-MM-JJ) : le navigateur les compare comme de simples chaînes.
export function yearsForDateInput(years: YearBounds[]): ComparableYear[] {
  return years.map(({ id, label, startDate, endDate }) => ({
    id,
    label,
    from: isoToDateInput(startDate),
    to: isoToDateInput(endDate),
  }));
}

// Les mêmes bornes dans la forme du champ de date et heure d'une actualité
// (AAAA-MM-JJTHH:mm, heure de Madagascar).
export function yearsForMadagascarInput(years: YearBounds[]): ComparableYear[] {
  return years.map(({ id, label, startDate, endDate }) => ({
    id,
    label,
    from: isoToMadagascarInput(startDate),
    to: isoToMadagascarInput(endDate),
  }));
}
