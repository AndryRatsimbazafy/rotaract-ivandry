// Une année Rotary va du 1er juillet au 30 juin, en temps universel.

export function rotaryYearLabel(startYear: number): string {
  return `${startYear}-${startYear + 1}`;
}

export function rotaryYearBounds(startYear: number): {
  startDate: Date;
  endDate: Date;
} {
  return {
    startDate: new Date(Date.UTC(startYear, 6, 1)),
    // Une milliseconde avant le 1er juillet suivant : 30 juin, 23:59:59.999.
    endDate: new Date(Date.UTC(startYear + 1, 6, 1) - 1),
  };
}

export function isCurrentRotaryYear(startYear: number, at: Date): boolean {
  const { startDate, endDate } = rotaryYearBounds(startYear);
  return at >= startDate && at <= endDate;
}

// « 2026-2027 » donne 2026 ; null si ce n'est pas un label de deux années
// consécutives.
export function parseRotaryYearLabel(label: string): number | null {
  const match = /^(\d{4})-(\d{4})$/.exec(label);
  if (!match) {
    return null;
  }
  const startYear = Number(match[1]);
  return Number(match[2]) === startYear + 1 ? startYear : null;
}

// L'année de début de l'année Rotary qui contient un instant donné.
export function rotaryStartYearAt(at: Date): number {
  const year = at.getUTCFullYear();
  return isCurrentRotaryYear(year, at) ? year : year - 1;
}
