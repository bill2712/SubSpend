/** Locale-aware formatting helpers built on Intl. */
import type { ISODate } from './dates';

const nfCache = new Map<string, Intl.NumberFormat>();

export function formatMoney(amount: number, currency: string, locale: string, opts: { compact?: boolean } = {}): string {
  const key = `${locale}|${currency}|${opts.compact ? 1 : 0}`;
  let nf = nfCache.get(key);
  if (!nf) {
    try {
      nf = new Intl.NumberFormat(locale, {
        style: 'currency',
        currency,
        ...(opts.compact ? { maximumFractionDigits: 0 } : {}),
      });
    } catch {
      nf = new Intl.NumberFormat(locale, { maximumFractionDigits: 2 });
    }
    nfCache.set(key, nf);
  }
  return nf.format(amount);
}

export function formatNumber(n: number, locale: string, maxFractionDigits = 0): string {
  return new Intl.NumberFormat(locale, { maximumFractionDigits: maxFractionDigits }).format(n);
}

/** Format a date-only ISO string without time-zone drift. */
export function formatDate(iso: ISODate, locale: string, style: 'short' | 'medium' | 'long' = 'medium'): string {
  const [y, m, d] = iso.split('-').map(Number);
  const date = new Date(Date.UTC(y!, (m ?? 1) - 1, d ?? 1));
  const options: Intl.DateTimeFormatOptions =
    style === 'short'
      ? { month: 'short', day: 'numeric', timeZone: 'UTC' }
      : style === 'long'
        ? { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' }
        : { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' };
  return new Intl.DateTimeFormat(locale, options).format(date);
}

/** Simple {placeholder} interpolation for translation strings. */
export function fill(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, k: string) => (k in vars ? String(vars[k]) : match));
}
