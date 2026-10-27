/**
 * Dashboard calculations: totals, breakdowns, upcoming payments,
 * free-trial alerts and money saved. All pure; `today` is always passed in.
 */
import type { Category } from '../config/catalog';
import { compareISO, diffDays, addDays, type ISODate } from './dates';
import { nextBillingDate, occurrencesBetween, subscriptionInterval, toMonthly, toYearly } from './billing';
import { convert, type ManualRates, type RateTable } from './currency';
import { myShare } from './split';
import type { Subscription } from './types';

export interface ConversionContext {
  displayCurrency: string;
  rates: RateTable | null;
  manualRates: ManualRates;
}

/** Your cost per billing cycle (after splitting), in the subscription currency. */
export const costPerCycle = (sub: Subscription) => myShare(sub.price, sub.split);

export function monthlyCost(sub: Subscription): number {
  return toMonthly(costPerCycle(sub), subscriptionInterval(sub));
}

export interface SubscriptionCost {
  sub: Subscription;
  /** Monthly cost in the display currency, or null if no exchange rate is known. */
  monthly: number | null;
  yearly: number | null;
}

export function costsInDisplay(subs: Subscription[], ctx: ConversionContext): SubscriptionCost[] {
  return subs.map((sub) => {
    const yearlyLocal = toYearly(costPerCycle(sub), subscriptionInterval(sub));
    const yearly = convert(yearlyLocal, sub.currency, ctx.displayCurrency, ctx.rates, ctx.manualRates);
    return { sub, yearly, monthly: yearly === null ? null : yearly / 12 };
  });
}

export interface Totals {
  monthly: number;
  yearly: number;
  activeCount: number;
  /** Active subscriptions we could not convert (missing exchange rate). */
  unconverted: Subscription[];
}

export function computeTotals(subs: Subscription[], ctx: ConversionContext): Totals {
  const active = subs.filter((s) => s.status === 'active');
  let yearly = 0;
  const unconverted: Subscription[] = [];
  for (const c of costsInDisplay(active, ctx)) {
    if (c.yearly === null) unconverted.push(c.sub);
    else yearly += c.yearly;
  }
  return { monthly: yearly / 12, yearly, activeCount: active.length, unconverted };
}

export interface CategorySlice {
  category: Category;
  monthly: number;
  share: number; // 0..1
  count: number;
}

export function byCategory(subs: Subscription[], ctx: ConversionContext): CategorySlice[] {
  const map = new Map<Category, { monthly: number; count: number }>();
  for (const c of costsInDisplay(subs.filter((s) => s.status === 'active'), ctx)) {
    if (c.monthly === null) continue;
    const entry = map.get(c.sub.category) ?? { monthly: 0, count: 0 };
    entry.monthly += c.monthly;
    entry.count += 1;
    map.set(c.sub.category, entry);
  }
  const total = [...map.values()].reduce((a, b) => a + b.monthly, 0);
  return [...map.entries()]
    .map(([category, v]) => ({ category, monthly: v.monthly, count: v.count, share: total > 0 ? v.monthly / total : 0 }))
    .sort((a, b) => b.monthly - a.monthly);
}

/** Active subscriptions sorted by monthly cost, most expensive first. */
export function bySubscription(subs: Subscription[], ctx: ConversionContext): { sub: Subscription; monthly: number }[] {
  return costsInDisplay(subs.filter((s) => s.status === 'active'), ctx)
    .filter((c): c is SubscriptionCost & { monthly: number } => c.monthly !== null)
    .map(({ sub, monthly }) => ({ sub, monthly }))
    .sort((a, b) => b.monthly - a.monthly);
}

export interface UpcomingPayment {
  sub: Subscription;
  date: ISODate;
  /** Your share, in the subscription currency. */
  amount: number;
  daysAway: number;
}

/** Payments of active subscriptions within the next `days` days (today included). */
export function upcomingPayments(subs: Subscription[], today: ISODate, days = 30): UpcomingPayment[] {
  const end = addDays(today, days);
  const out: UpcomingPayment[] = [];
  for (const sub of subs) {
    if (sub.status !== 'active') continue;
    for (const date of occurrencesBetween(sub.nextBillingDate, subscriptionInterval(sub), today, end, 200)) {
      out.push({ sub, date, amount: costPerCycle(sub), daysAway: diffDays(today, date) });
    }
  }
  return out.sort((a, b) => compareISO(a.date, b.date) || a.sub.name.localeCompare(b.sub.name));
}

export function nextPaymentDate(sub: Subscription, today: ISODate): ISODate {
  return nextBillingDate(sub.nextBillingDate, subscriptionInterval(sub), today);
}

export interface TrialAlert {
  sub: Subscription;
  trialEndDate: ISODate;
  /** Negative when the trial already ended. */
  daysLeft: number;
  level: 'ended' | 'urgent' | 'soon';
}

/**
 * Trials ending within `windowDays`, plus trials that ended in the last
 * `graceDays` (a nudge to check whether you were charged). Cancelled
 * subscriptions are ignored — you already acted on them.
 */
export function trialAlerts(subs: Subscription[], today: ISODate, windowDays = 7, graceDays = 3): TrialAlert[] {
  const out: TrialAlert[] = [];
  for (const sub of subs) {
    if (sub.status === 'cancelled' || !sub.trialEndDate) continue;
    const daysLeft = diffDays(today, sub.trialEndDate);
    if (daysLeft > windowDays || daysLeft < -graceDays) continue;
    const level = daysLeft < 0 ? 'ended' : daysLeft <= 3 ? 'urgent' : 'soon';
    out.push({ sub, trialEndDate: sub.trialEndDate, daysLeft, level });
  }
  return out.sort((a, b) => a.daysLeft - b.daysLeft);
}

export interface SavingEntry {
  sub: Subscription;
  /** Payments that would have happened after you cancelled. */
  paymentsAvoided: number;
  /** In the subscription currency. */
  amount: number;
}

/**
 * Money saved by cancelling: we count the billing dates that fell strictly
 * after the cancellation date and up to today, times your share per payment.
 * Charges you would only pay in future are not counted yet.
 */
export function moneySaved(subs: Subscription[], today: ISODate): SavingEntry[] {
  const out: SavingEntry[] = [];
  for (const sub of subs) {
    if (sub.status !== 'cancelled' || !sub.cancelledAt) continue;
    if (compareISO(sub.cancelledAt, today) >= 0) continue;
    const dates = occurrencesBetween(sub.nextBillingDate, subscriptionInterval(sub), addDays(sub.cancelledAt, 1), today, 5000);
    if (dates.length === 0) continue;
    out.push({ sub, paymentsAvoided: dates.length, amount: dates.length * costPerCycle(sub) });
  }
  return out;
}

export function totalSaved(entries: SavingEntry[], ctx: ConversionContext): { amount: number; unconverted: number } {
  let amount = 0;
  let unconverted = 0;
  for (const e of entries) {
    const v = convert(e.amount, e.sub.currency, ctx.displayCurrency, ctx.rates, ctx.manualRates);
    if (v === null) unconverted++;
    else amount += v;
  }
  return { amount, unconverted };
}
