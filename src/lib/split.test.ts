import { describe, expect, it } from 'vitest';
import { isShared, myShare, splitEvenly } from './split';

describe('split costs', () => {
  it('splits equally', () => {
    expect(myShare(120, { people: 4, mode: 'equal' })).toBe(30);
    expect(myShare(100, { people: 3, mode: 'equal' })).toBeCloseTo(33.333, 3);
  });
  it('supports percent and fixed shares', () => {
    expect(myShare(200, { people: 2, mode: 'percent', value: 25 })).toBe(50);
    expect(myShare(200, { people: 2, mode: 'percent', value: 150 })).toBe(200);
    expect(myShare(200, { people: 2, mode: 'fixed', value: 80 })).toBe(80);
    expect(myShare(200, { people: 2, mode: 'fixed', value: 500 })).toBe(200);
  });
  it('falls back to the full price for missing or invalid splits', () => {
    expect(myShare(99)).toBe(99);
    expect(myShare(99, { people: 0, mode: 'equal' })).toBe(99);
    expect(myShare(99, { people: 2, mode: 'percent', value: Number.NaN })).toBe(99);
    expect(myShare(-5)).toBe(0);
  });
  it('splits into parts that add up to the total', () => {
    const parts = splitEvenly(100, 3);
    expect(parts).toEqual([33.34, 33.33, 33.33]);
    expect(parts.reduce((a, b) => a + b, 0)).toBeCloseTo(100, 10);
    expect(splitEvenly(1000, 3, 0)).toEqual([334, 333, 333]);
  });
  it('detects shared plans', () => {
    expect(isShared({ people: 1, mode: 'equal' })).toBe(false);
    expect(isShared({ people: 3, mode: 'equal' })).toBe(true);
  });
});
