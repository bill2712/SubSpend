/** Currencies offered in the pickers. Order = display order. */
export const CURRENCIES = [
  'HKD', 'USD', 'EUR', 'GBP', 'JPY', 'TWD', 'CNY', 'SGD', 'AUD', 'CAD',
  'NZD', 'CHF', 'KRW', 'MOP', 'MYR', 'THB', 'PHP', 'IDR', 'INR', 'VND',
  'AED', 'SEK', 'NOK', 'DKK', 'PLN', 'BRL', 'MXN', 'ZAR', 'TRY',
] as const;

export type CurrencyCode = (typeof CURRENCIES)[number];

export const DEFAULT_CURRENCY: CurrencyCode = 'HKD';

export function isCurrencyCode(v: unknown): v is CurrencyCode {
  return typeof v === 'string' && (CURRENCIES as readonly string[]).includes(v);
}
