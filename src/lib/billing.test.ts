import { describe, expect, it } from 'vitest';
import {
  cycleToInterval, defaultNextBillingDate, nextBillingDate, occurrenceAt, occurrencesBetween, paymentsPerYear, toMonthly, toYearly,
} from './billing';

const monthly = cycleToInterval('monthly');
const yearly = cycleToInterval('yearly');
const weekly = cycleToInterval('weekly');
const quarterly = cycleToInterval('quarterly');

describe('cycle normalisation', () => {
  it('converts each cycle to monthly and yearly', () => {
    expect(toMonthly(120, yearly)).toBeCloseTo(10);
    expect(toYearly(10, monthly)).toBe(120);
    expect(toMonthly(30, quarterly)).toBeCloseTo(10);
    expect(toYearly(30, quarterly)).toBeCloseTo(120);
    // 52.1775 weeks per average year
    expect(toYearly(10, weekly)).toBeCloseTo(521.775, 3);
    expect(toMonthly(10, weekly)).toBeCloseTo(43.48, 2);
  });

  it('handles custom intervals', () => {
    expect(paymentsPerYear(cycleToInterval('custom', { count: 2, unit: 'month' }))).toBe(6);
    expect(paymentsPerYear(cycleToInterval('custom', { count: 2, unit: 'year' }))).toBe(0.5);
    expect(paymentsPerYear(cycleToInterval('custom', { count: 2, unit: 'week' }))).toBeCloseTo(26.09, 2);
    expect(paymentsPerYear(cycleToInterval('custom', { count: 30, unit: 'day' }))).toBeCloseTo(12.17, 2);
    // invalid custom input falls back to monthly
    expect(cycleToInterval('custom', { count: 0, unit: 'day' })).toEqual(monthly);
  });
});

describe('next billing date', () => {
  it('returns the anchor when it is today or in the future', () => {
    expect(nextBillingDate('2026-11-15', monthly, '2026-10-27')).toBe('2026-11-15');
    expect(nextBillingDate('2026-10-27', monthly, '2026-10-27')).toBe('2026-10-27');
  });

  it('rolls a past anchor forward', () => {
    expect(nextBillingDate('2026-01-15', monthly, '2026-10-27')).toBe('2026-11-15');
    expect(nextBillingDate('2026-01-15', monthly, '2026-10-15')).toBe('2026-10-15');
    expect(nextBillingDate('2020-03-01', yearly, '2026-10-27')).toBe('2027-03-01');
    expect(nextBillingDate('2026-10-01', weekly, '2026-10-27')).toBe('2026-10-29');
  });

  it('keeps the 31st across short months', () => {
    expect(nextBillingDate('2026-01-31', monthly, '2026-02-01')).toBe('2026-02-28');
    expect(nextBillingDate('2026-01-31', monthly, '2026-03-01')).toBe('2026-03-31');
    expect(nextBillingDate('2026-01-31', monthly, '2026-04-01')).toBe('2026-04-30');
    expect(nextBillingDate('2026-01-30', monthly, '2026-02-01')).toBe('2026-02-28');
    expect(nextBillingDate('2026-08-31', quarterly, '2026-09-01')).toBe('2026-11-30');
  });

  it('handles leap-day anchors on yearly plans', () => {
    expect(nextBillingDate('2024-02-29', yearly, '2024-03-01')).toBe('2025-02-28');
    expect(nextBillingDate('2024-02-29', yearly, '2027-03-01')).toBe('2028-02-29');
    expect(occurrenceAt('2024-02-29', yearly, 4)).toBe('2028-02-29');
    expect(nextBillingDate('2028-01-29', monthly, '2028-02-02')).toBe('2028-02-29');
  });

  it('never returns a date before today, for many anchors', () => {
    for (let d = 1; d <= 31; d++) {
      const anchor = `2025-01-${String(d).padStart(2, '0')}`;
      for (const today of ['2026-02-27', '2026-02-28', '2026-03-01', '2026-12-31']) {
        const next = nextBillingDate(anchor, monthly, today);
        expect(next >= today).toBe(true);
        // and the previous occurrence is before today
        expect(occurrencesBetween(anchor, monthly, today, next)).toEqual([next]);
      }
    }
  });
});

describe('occurrences', () => {
  it('lists dates inside a window inclusively', () => {
    expect(occurrencesBetween('2026-01-31', monthly, '2026-01-01', '2026-05-31')).toEqual([
      '2026-01-31', '2026-02-28', '2026-03-31', '2026-04-30', '2026-05-31',
    ]);
    expect(occurrencesBetween('2026-10-27', weekly, '2026-10-27', '2026-11-10')).toEqual(['2026-10-27', '2026-11-03', '2026-11-10']);
  });

  it('respects the limit and empty ranges', () => {
    expect(occurrencesBetween('2026-01-01', cycleToInterval('custom', { count: 1, unit: 'day' }), '2026-01-01', '2030-01-01', 10)).toHaveLength(10);
    expect(occurrencesBetween('2026-01-01', monthly, '2026-05-01', '2026-04-01')).toEqual([]);
  });

  it('defaults a new entry to one cycle from today', () => {
    expect(defaultNextBillingDate(monthly, '2026-01-31')).toBe('2026-02-28');
    expect(defaultNextBillingDate(yearly, '2026-10-27')).toBe('2027-10-27');
    expect(defaultNextBillingDate(weekly, '2026-10-27')).toBe('2026-11-03');
  });
});
