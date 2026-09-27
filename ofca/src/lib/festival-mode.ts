export type FestivalMode = 'offseason' | 'announce' | 'live' | 'after';
export const MODES: FestivalMode[] = ['offseason', 'announce', 'live', 'after'];

export interface ModeConfig {
  announceAt: string;
  start: string;
  end: string;
  afterDays: number;
  next: { start: string | null; announceAt: string | null };
  forceMode: FestivalMode | null;
}

const DAY = 86_400_000;

/**
 * Tryb strony wg dat (PRD 7.1):
 * announce → live (dni festiwalu) → after (14 dni) → offseason → announce kolejnej edycji.
 */
export function getFestivalMode(now: Date, cfg: ModeConfig): FestivalMode {
  if (cfg.forceMode) return cfg.forceMode;
  const t = now.getTime();
  const start = Date.parse(cfg.start);
  const end = Date.parse(cfg.end);
  if (t >= start && t <= end) return 'live';
  if (t > end) {
    if (t <= end + cfg.afterDays * DAY) return 'after';
    if (cfg.next.start && cfg.next.announceAt && t >= Date.parse(cfg.next.announceAt)) return 'announce';
    return 'offseason';
  }
  return t >= Date.parse(cfg.announceAt) ? 'announce' : 'offseason';
}

/** Data startu, do której odlicza komponent Countdown w danym momencie. */
export function countdownTarget(now: Date, cfg: ModeConfig): string | null {
  const t = now.getTime();
  if (t < Date.parse(cfg.start)) return cfg.start;
  if (cfg.next.start && t < Date.parse(cfg.next.start)) return cfg.next.start;
  return null;
}

/** Pełne dni do startu liczone po kalendarzu Europe/Warsaw (dzień startu = 0). */
export function daysUntil(now: Date, targetIso: string): number {
  const fmt = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Warsaw', year: 'numeric', month: '2-digit', day: '2-digit' });
  const a = Date.parse(fmt.format(now));
  const b = Date.parse(fmt.format(new Date(targetIso)));
  return Math.max(0, Math.round((b - a) / DAY));
}
