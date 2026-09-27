import { describe, expect, it } from 'vitest';
import { overlaps } from './plan';

describe('overlaps', () => {
  it('wykrywa nakładające się godziny', () => {
    const res = overlaps([
      { id: 'a', start: '2026-08-15T16:00:00+02:00', end: '2026-08-15T17:00:00+02:00' },
      { id: 'b', start: '2026-08-15T16:30:00+02:00', end: '2026-08-15T17:15:00+02:00' },
      { id: 'c', start: '2026-08-15T17:15:00+02:00', end: '2026-08-15T18:00:00+02:00' },
    ]);
    expect(res.get('a')).toEqual(['b']);
    expect(res.get('b')).toEqual(['a']);
    expect(res.has('c')).toBe(false);
  });
});
