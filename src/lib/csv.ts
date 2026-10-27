/** CSV export (RFC 4180) with protection against spreadsheet formula injection. */
import type { Subscription } from './types';
import { myShare } from './split';

export function csvCell(value: unknown): string {
  let s = value === undefined || value === null ? '' : String(value);
  // A leading =, +, -, @ (or tab/CR) can make spreadsheets execute the cell as a formula.
  if (/^[=+\-@\t\r]/.test(s) && !/^-?\d+(\.\d+)?$/.test(s)) s = `'${s}`;
  return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export const CSV_COLUMNS = [
  'name', 'category', 'price', 'currency', 'my_share', 'cycle', 'custom_every', 'custom_unit',
  'next_billing_date', 'trial_end_date', 'status', 'cancelled_at', 'shared_people', 'split_mode',
  'split_value', 'payment_method', 'notes',
] as const;

export function subscriptionsToCsv(subs: Subscription[]): string {
  const rows = subs.map((s) => [
    s.name, s.category, s.price, s.currency, Math.round(myShare(s.price, s.split) * 100) / 100, s.cycle,
    s.customInterval?.count, s.customInterval?.unit, s.nextBillingDate, s.trialEndDate, s.status, s.cancelledAt,
    s.split?.people ?? 1, s.split?.mode, s.split?.value, s.paymentMethod, s.notes,
  ]);
  // BOM so Excel opens UTF-8 (e.g. Chinese names) correctly.
  return '\uFEFF' + [CSV_COLUMNS as readonly unknown[], ...rows].map((r) => r.map(csvCell).join(',')).join('\r\n') + '\r\n';
}
