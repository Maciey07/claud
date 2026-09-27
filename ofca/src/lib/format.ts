import type { Lang } from './types';

const TZ = 'Europe/Warsaw';

export function formatPrice(value: number, lang: Lang): string {
  if (lang === 'en') return `PLN ${value.toFixed(2)}`;
  return `${value.toFixed(2).replace('.', ',')} zł`;
}

export function formatTime(iso: string): string {
  return new Intl.DateTimeFormat('pl-PL', { timeZone: TZ, hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date(iso));
}

export function timeRange(start: string, end: string): string {
  return `${formatTime(start)}–${formatTime(end)}`;
}

export function durationMinutes(start: string, end: string): number {
  return Math.round((Date.parse(end) - Date.parse(start)) / 60000);
}

const DAY_SHORT: Record<Lang, string[]> = {
  pl: ['Nd', 'Pon', 'Wt', 'Śr', 'Czw', 'Pt', 'Sob'],
  en: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
};
const DAY_LONG: Record<Lang, string[]> = {
  pl: ['niedziela', 'poniedziałek', 'wtorek', 'środa', 'czwartek', 'piątek', 'sobota'],
  en: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
};

/** „Pt 14.08” / „Fri 14.08” dla klucza YYYY-MM-DD. */
export function dayLabel(dayKey: string, lang: Lang): string {
  const d = new Date(`${dayKey}T12:00:00Z`);
  const [, m, dd] = dayKey.split('-');
  return `${DAY_SHORT[lang][d.getUTCDay()]} ${dd}.${m}`;
}

export function dayLong(dayKey: string, lang: Lang): string {
  const d = new Date(`${dayKey}T12:00:00Z`);
  const [, m, dd] = dayKey.split('-');
  return lang === 'pl' ? `${DAY_LONG.pl[d.getUTCDay()]} ${dd}.${m}` : `${DAY_LONG.en[d.getUTCDay()]} ${Number(dd)} August`;
}

/** Klucz dnia YYYY-MM-DD dla chwili w strefie Europe/Warsaw. */
export function dayKeyOf(date: Date): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit' }).format(date);
}

export const TBC = '[DO UZUPEŁNIENIA]';
