/**
 * OPTIONAL "typical price" hints shown under the price field.
 *
 * Rules (please keep them — they protect users and your AdSense review):
 *  - Only add a hint you checked yourself on the provider's official page.
 *  - Every hint MUST have `lastChecked` (YYYY-MM-DD) and a country/region.
 *  - The UI always labels hints "approximate" and shows the date and region.
 *  - Hints older than HINT_MAX_AGE_DAYS are hidden automatically.
 *
 * The map ships EMPTY on purpose: we do not publish prices we have not verified.
 *
 * Example:
 *   netflix: [{ region: 'HK', plan: 'Standard', amount: 0, currency: 'HKD',
 *               cycle: 'monthly', lastChecked: '2026-10-01',
 *               source: 'https://help.netflix.com/...' }],
 */
import type { CurrencyCode } from './currencies';

export interface PriceHint {
  region: string;
  plan: string;
  amount: number;
  currency: CurrencyCode;
  cycle: 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  /** YYYY-MM-DD — when you last confirmed this on the official page. */
  lastChecked: string;
  source: string;
}

export const HINT_MAX_AGE_DAYS = 180;

export const PRICE_HINTS: Record<string, PriceHint[]> = {};
