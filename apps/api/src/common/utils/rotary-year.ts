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
