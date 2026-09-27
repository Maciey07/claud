import { describe, expect, it } from 'vitest';
import { buildIcs, toIcsDate } from './ics';

describe('ics', () => {
  it('zamienia czas Europe/Warsaw na UTC', () => {
    expect(toIcsDate('2026-08-15T16:00:00+02:00')).toBe('20260815T140000Z');
  });
  it('buduje kalendarz z escapowaniem', () => {
    const ics = buildIcs(
      [{ uid: 'e1', title: 'Maelstrom; Company Alud', location: 'Namioty cyrkowe, Oleśnica', start: '2026-08-14T18:00:00+02:00', end: '2026-08-14T19:00:00+02:00' }],
      new Date('2026-08-01T10:00:00Z'),
    );
    expect(ics).toContain('BEGIN:VCALENDAR');
    expect(ics).toContain('SUMMARY:Maelstrom\\; Company Alud');
    expect(ics).toContain('LOCATION:Namioty cyrkowe\\, Oleśnica');
    expect(ics).toContain('DTSTART:20260814T160000Z');
    expect(ics.endsWith('END:VCALENDAR\r\n')).toBe(true);
  });
});
