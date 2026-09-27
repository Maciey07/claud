import { describe, expect, it } from 'vitest';
import { countdownTarget, daysUntil, getFestivalMode, type ModeConfig } from './festival-mode';

const cfg: ModeConfig = {
  announceAt: '2026-01-15T00:00:00+01:00',
  start: '2026-08-14T00:00:00+02:00',
  end: '2026-08-16T23:59:59+02:00',
  afterDays: 14,
  next: { start: null, announceAt: null },
  forceMode: null,
};

describe('getFestivalMode', () => {
  it('offseason przed ogłoszeniem', () => expect(getFestivalMode(new Date('2026-01-01T12:00:00+01:00'), cfg)).toBe('offseason'));
  it('announce po ogłoszeniu', () => expect(getFestivalMode(new Date('2026-06-01T12:00:00+02:00'), cfg)).toBe('announce'));
  it('live w dniach festiwalu', () => {
    expect(getFestivalMode(new Date('2026-08-14T00:00:00+02:00'), cfg)).toBe('live');
    expect(getFestivalMode(new Date('2026-08-16T23:00:00+02:00'), cfg)).toBe('live');
  });
  it('after przez 14 dni', () => expect(getFestivalMode(new Date('2026-08-25T12:00:00+02:00'), cfg)).toBe('after'));
  it('offseason po 14 dniach', () => expect(getFestivalMode(new Date('2026-09-27T12:00:00+02:00'), cfg)).toBe('offseason'));
  it('announce kolejnej edycji', () => {
    const next = { ...cfg, next: { start: '2027-08-13T00:00:00+02:00', announceAt: '2026-11-01T00:00:00+01:00' } };
    expect(getFestivalMode(new Date('2026-12-01T12:00:00+01:00'), next)).toBe('announce');
  });
  it('forceMode wygrywa', () => expect(getFestivalMode(new Date('2026-01-01'), { ...cfg, forceMode: 'live' })).toBe('live'));
});

describe('countdown', () => {
  it('liczy dni kalendarzowe w Europe/Warsaw', () => {
    expect(daysUntil(new Date('2026-08-13T23:30:00+02:00'), cfg.start)).toBe(1);
    expect(daysUntil(new Date('2026-08-01T08:00:00+02:00'), cfg.start)).toBe(13);
  });
  it('brak celu po festiwalu bez daty kolejnej edycji', () => {
    expect(countdownTarget(new Date('2026-09-27T12:00:00+02:00'), cfg)).toBeNull();
  });
});
