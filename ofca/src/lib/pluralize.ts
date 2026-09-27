/**
 * Polska odmiana w odliczaniu: „został 1 dzień”, „zostały 2 dni”, „zostało 5 dni”.
 * Liczby kończące się na 2–4 (poza 12–14) biorą formę „zostały … dni”.
 */
export function dayForms(n: number): { verb: string; unit: string } {
  const abs = Math.abs(Math.trunc(n));
  if (abs === 1) return { verb: 'został', unit: 'dzień' };
  const last = abs % 10;
  const lastTwo = abs % 100;
  if (last >= 2 && last <= 4 && !(lastTwo >= 12 && lastTwo <= 14)) {
    return { verb: 'zostały', unit: 'dni' };
  }
  return { verb: 'zostało', unit: 'dni' };
}

export function pluralizeDays(n: number): string {
  const { verb, unit } = dayForms(n);
  return `${verb} ${n} ${unit}`;
}

export function pluralizeDaysEn(n: number): string {
  return n === 1 ? '1 day to go' : `${n} days to go`;
}
