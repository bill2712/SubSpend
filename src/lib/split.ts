/** Cost-sharing maths for subscriptions split with family or friends. */
import type { Split } from './types';

/**
 * Your share of one payment.
 * - equal:   price ÷ people
 * - percent: price × value%
 * - fixed:   value (capped at the full price)
 * Invalid or missing split data falls back to paying the full price.
 */
export function myShare(price: number, split?: Split): number {
  if (!split || !(price >= 0)) return Math.max(0, price || 0);
  switch (split.mode) {
    case 'equal': {
      const people = Math.floor(split.people);
      return people >= 1 ? price / people : price;
    }
    case 'percent': {
      const pct = split.value ?? 100;
      if (!Number.isFinite(pct)) return price;
      return (price * Math.min(100, Math.max(0, pct))) / 100;
    }
    case 'fixed': {
      const v = split.value ?? price;
      if (!Number.isFinite(v)) return price;
      return Math.min(price, Math.max(0, v));
    }
    default:
      return price;
  }
}

export function isShared(split?: Split): boolean {
  return !!split && split.people > 1;
}

/**
 * Split an amount into `people` parts in minor units (e.g. cents) so the
 * parts always add up to the total — the first parts absorb the remainder.
 * Useful for "who owes what" messages.
 */
export function splitEvenly(total: number, people: number, fractionDigits = 2): number[] {
  const n = Math.max(1, Math.floor(people));
  const factor = 10 ** fractionDigits;
  const minor = Math.round(total * factor);
  const base = Math.floor(minor / n);
  const remainder = minor - base * n;
  return Array.from({ length: n }, (_, i) => (base + (i < remainder ? 1 : 0)) / factor);
}
