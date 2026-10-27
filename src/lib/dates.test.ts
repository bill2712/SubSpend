import { describe, expect, it } from 'vitest';
import { addDays, addMonths, daysInMonth, diffDays, isLeapYear, parseISODate, todayISO } from './dates';

describe('dates', () => {
  it('knows leap years (incl. century rules)', () => {
    expect(isLeapYear(2024)).toBe(true);
    expect(isLeapYear(2025)).toBe(false);
    expect(isLeapYear(1900)).toBe(false);
    expect(isLeapYear(2000)).toBe(true);
    expect(daysInMonth(2028, 2)).toBe(29);
    expect(daysInMonth(2027, 2)).toBe(28);
  });

  it('rejects malformed and impossible dates', () => {
    expect(parseISODate('2025-02-29')).toBeNull();
    expect(parseISODate('2024-02-29')).toEqual({ y: 2024, m: 2, d: 29 });
    expect(parseISODate('2024-13-01')).toBeNull();
    expect(parseISODate('2024-1-01')).toBeNull();
    expect(parseISODate(20240101)).toBeNull();
    expect(parseISODate('2024-04-31')).toBeNull();
  });

  it('adds days across month/year boundaries and DST dates', () => {
    expect(addDays('2026-12-31', 1)).toBe('2027-01-01');
    expect(addDays('2024-02-28', 1)).toBe('2024-02-29');
    expect(addDays('2026-03-08', 1)).toBe('2026-03-09'); // US DST change
    expect(addDays('2026-03-01', -1)).toBe('2026-02-28');
    expect(diffDays('2026-10-27', '2026-11-03')).toBe(7);
    expect(diffDays('2026-11-03', '2026-10-27')).toBe(-7);
  });

  it('clamps month addition to month end but keeps the original day', () => {
    expect(addMonths('2026-01-31', 1)).toBe('2026-02-28');
    expect(addMonths('2028-01-31', 1)).toBe('2028-02-29');
    expect(addMonths('2026-01-31', 2)).toBe('2026-03-31');
    expect(addMonths('2026-02-28', 1, 31)).toBe('2026-03-31');
    expect(addMonths('2026-11-15', 2)).toBe('2027-01-15');
    expect(addMonths('2026-01-15', -2)).toBe('2025-11-15');
  });

  it('formats today in local time', () => {
    expect(todayISO(new Date(2026, 9, 27, 23, 59))).toBe('2026-10-27');
  });
});
