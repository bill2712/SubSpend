/**
 * Lighthearted "this equals…" comparisons on the dashboard.
 *
 * `defaultAmount` is an illustrative example, NOT a claim about real prices.
 * The UI says so and lets every user set their own amount in Settings.
 * Add, remove or reorder items freely; `id` keys the translation strings
 * (`comparisons.items.<id>`) in src/i18n/*.ts.
 */
import type { CurrencyCode } from './currencies';

export interface ComparisonItem {
  id: 'coffee' | 'lunch' | 'movie' | 'book';
  emoji: string;
  defaultAmount: number;
  defaultCurrency: CurrencyCode;
}

export const COMPARISONS: ComparisonItem[] = [
  { id: 'coffee', emoji: '☕', defaultAmount: 40, defaultCurrency: 'HKD' },
  { id: 'lunch', emoji: '🍱', defaultAmount: 70, defaultCurrency: 'HKD' },
  { id: 'movie', emoji: '🎬', defaultAmount: 100, defaultCurrency: 'HKD' },
  { id: 'book', emoji: '📚', defaultAmount: 150, defaultCurrency: 'HKD' },
];
