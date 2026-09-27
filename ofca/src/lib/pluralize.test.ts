import { describe, expect, it } from 'vitest';
import { pluralizeDays, pluralizeDaysEn } from './pluralize';

describe('pluralizeDays', () => {
  const cases: [number, string][] = [
    [0, 'zostało 0 dni'],
    [1, 'został 1 dzień'],
    [2, 'zostały 2 dni'],
    [4, 'zostały 4 dni'],
    [5, 'zostało 5 dni'],
    [11, 'zostało 11 dni'],
    [12, 'zostało 12 dni'],
    [14, 'zostało 14 dni'],
    [21, 'zostało 21 dni'],
    [22, 'zostały 22 dni'],
    [25, 'zostało 25 dni'],
    [101, 'zostało 101 dni'],
    [112, 'zostało 112 dni'],
    [3, 'zostały 3 dni'],
    [24, 'zostały 24 dni'],
    [32, 'zostały 32 dni'],
    [34, 'zostały 34 dni'],
    [13, 'zostało 13 dni'],
    [122, 'zostały 122 dni'],
  ];
  it.each(cases)('%i → %s', (n, expected) => {
    expect(pluralizeDays(n)).toBe(expected);
  });
});

describe('pluralizeDaysEn', () => {
  it('handles singular and plural', () => {
    expect(pluralizeDaysEn(1)).toBe('1 day to go');
    expect(pluralizeDaysEn(3)).toBe('3 days to go');
  });
});
