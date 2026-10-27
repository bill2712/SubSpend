/**
 * Billing-cycle maths: normalising prices to monthly/yearly and projecting
 * billing dates. Pure functions only — easy to unit test.
 */
import { addDays, addMonths, compareISO, diffDays, monthIndexDiff, parseISODate, type ISODate } from './dates';
import type { CycleKind, Interval, Subscription } from './types';

/** Average Gregorian year length; makes weekly/daily normalisation exact over 400 years. */
export const DAYS_PER_YEAR = 365.2425;

export function cycleToInterval(cycle: CycleKind, custom?: Interval): Interval {
  switch (cycle) {
    case 'weekly':
      return { count: 1, unit: 'week' };
    case 'monthly':
      return { count: 1, unit: 'month' };
    case 'quarterly':
      return { count: 3, unit: 'month' };
    case 'yearly':
      return { count: 1, unit: 'year' };
    case 'custom':
      if (custom && Number.isInteger(custom.count) && custom.count >= 1) return custom;
      return { count: 1, unit: 'month' };
  }
}

export function subscriptionInterval(sub: Pick<Subscription, 'cycle' | 'customInterval'>): Interval {
  return cycleToInterval(sub.cycle, sub.customInterval);
}

/** How many payments happen per year on this interval (may be fractional). */
export function paymentsPerYear({ count, unit }: Interval): number {
  switch (unit) {
    case 'day':
      return DAYS_PER_YEAR / count;
    case 'week':
      return DAYS_PER_YEAR / 7 / count;
    case 'month':
      return 12 / count;
    case 'year':
      return 1 / count;
  }
}

export function toYearly(amount: number, interval: Interval): number {
  return amount * paymentsPerYear(interval);
}

export function toMonthly(amount: number, interval: Interval): number {
  return toYearly(amount, interval) / 12;
}

/** Length of one interval in months, for month/year units. */
function intervalMonths({ count, unit }: Interval): number {
  return unit === 'year' ? count * 12 : count;
}

function intervalDays({ count, unit }: Interval): number {
  return unit === 'week' ? count * 7 : count;
}

/**
 * The k-th billing date after `anchor` (k = 0 is the anchor itself).
 * Month-based cycles are always computed from the anchor, so the original
 * day of month is kept: Jan 31 → Feb 28 (or 29) → Mar 31.
 */
export function occurrenceAt(anchor: ISODate, interval: Interval, k: number): ISODate {
  if (interval.unit === 'month' || interval.unit === 'year') {
    const day = parseISODate(anchor)!.d;
    return addMonths(anchor, k * intervalMonths(interval), day);
  }
  return addDays(anchor, k * intervalDays(interval));
}

/** Smallest k ≥ 0 whose occurrence is on/after `date`. */
function firstIndexOnOrAfter(anchor: ISODate, interval: Interval, date: ISODate): number {
  if (compareISO(anchor, date) >= 0) return 0;
  if (interval.unit === 'day' || interval.unit === 'week') {
    return Math.ceil(diffDays(anchor, date) / intervalDays(interval));
  }
  // Estimate from the month difference, then step forward (at most a couple of steps).
  let k = Math.max(0, Math.floor(monthIndexDiff(anchor, date) / intervalMonths(interval)) - 1);
  while (compareISO(occurrenceAt(anchor, interval, k), date) < 0) k++;
  return k;
}

/** Next billing date on or after `today` (the anchor rolls forward if it is in the past). */
export function nextBillingDate(anchor: ISODate, interval: Interval, today: ISODate): ISODate {
  return occurrenceAt(anchor, interval, firstIndexOnOrAfter(anchor, interval, today));
}

/**
 * All billing dates in [from, to] (both inclusive), oldest first.
 * `limit` guards against huge outputs for tiny custom intervals.
 */
export function occurrencesBetween(
  anchor: ISODate,
  interval: Interval,
  from: ISODate,
  to: ISODate,
  limit = 1000,
): ISODate[] {
  const out: ISODate[] = [];
  if (compareISO(from, to) > 0) return out;
  for (let k = firstIndexOnOrAfter(anchor, interval, from); out.length < limit; k++) {
    const date = occurrenceAt(anchor, interval, k);
    if (compareISO(date, to) > 0) break;
    out.push(date);
  }
  return out;
}

/** Default "next billing date" for a new entry: one cycle from today. */
export function defaultNextBillingDate(interval: Interval, today: ISODate): ISODate {
  return occurrenceAt(today, interval, 1);
}
