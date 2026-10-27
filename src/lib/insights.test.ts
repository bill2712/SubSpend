import { describe, expect, it } from 'vitest';
import { byCategory, bySubscription, computeTotals, moneySaved, totalSaved, trialAlerts, upcomingPayments } from './insights';
import { makeSub } from './testUtils';
import type { RateTable } from './currency';

const rates: RateTable = { base: 'USD', rates: { USD: 1, HKD: 8 }, date: '2026-10-27', source: 't', fetchedAt: 0 };
const ctx = { displayCurrency: 'HKD', rates, manualRates: {} };
const today = '2026-10-27';

describe('totals', () => {
  const subs = [
    makeSub({ name: 'A', price: 100 }),
    makeSub({ name: 'B', price: 1200, cycle: 'yearly', category: 'cloud' }),
    makeSub({ name: 'C', price: 10, currency: 'USD', category: 'ai' }),
    makeSub({ name: 'D', price: 400, split: { people: 4, mode: 'equal' } }),
    makeSub({ name: 'Paused', price: 999, status: 'paused' }),
    makeSub({ name: 'Gone', price: 999, status: 'cancelled' }),
    makeSub({ name: 'NoRate', price: 10, currency: 'JPY' }),
  ];
  it('sums active subscriptions only, using my share and converting currencies', () => {
    const t = computeTotals(subs, ctx);
    // 100 + 100 + 80 + 100 = 380 per month
    expect(t.monthly).toBeCloseTo(380);
    expect(t.yearly).toBeCloseTo(4560);
    expect(t.activeCount).toBe(5);
    expect(t.unconverted.map((s) => s.name)).toEqual(['NoRate']);
  });
  it('breaks down by category and subscription', () => {
    const cats = byCategory(subs, ctx);
    expect(cats[0]).toMatchObject({ category: 'streaming', count: 2 });
    expect(cats[0]!.monthly).toBeCloseTo(200);
    expect(cats.reduce((a, c) => a + c.share, 0)).toBeCloseTo(1);
    const ranked = bySubscription(subs, ctx).map((r) => r.sub.name);
    expect(ranked[ranked.length - 1]).toBe('C');
    expect(ranked).not.toContain('NoRate');
  });
});

describe('upcoming payments', () => {
  it('lists every payment in the next 30 days, sorted', () => {
    const subs = [
      makeSub({ name: 'Weekly', cycle: 'weekly', nextBillingDate: '2026-10-28', price: 10 }),
      makeSub({ name: 'Monthly', nextBillingDate: '2026-10-01' }),
      makeSub({ name: 'Yearly', cycle: 'yearly', nextBillingDate: '2027-03-01' }),
      makeSub({ name: 'Paused', status: 'paused', nextBillingDate: '2026-10-30' }),
    ];
    const up = upcomingPayments(subs, today, 30);
    expect(up.filter((u) => u.sub.name === 'Weekly')).toHaveLength(5); // Oct 28, Nov 4, 11, 18, 25
    expect(up.find((u) => u.sub.name === 'Monthly')?.date).toBe('2026-11-01');
    expect(up.some((u) => u.sub.name === 'Yearly' || u.sub.name === 'Paused')).toBe(false);
    expect(up[0]).toMatchObject({ date: '2026-10-28', daysAway: 1 });
  });
});

describe('trial alerts', () => {
  it('flags trials ending soon or just ended', () => {
    const subs = [
      makeSub({ name: 'In3', trialEndDate: '2026-10-30' }),
      makeSub({ name: 'Today', trialEndDate: today }),
      makeSub({ name: 'In6', trialEndDate: '2026-11-02' }),
      makeSub({ name: 'Far', trialEndDate: '2026-12-30' }),
      makeSub({ name: 'Ended', trialEndDate: '2026-10-25' }),
      makeSub({ name: 'Long ago', trialEndDate: '2026-09-01' }),
      makeSub({ name: 'Cancelled', trialEndDate: '2026-10-29', status: 'cancelled' }),
    ];
    const alerts = trialAlerts(subs, today, 7);
    expect(alerts.map((a) => [a.sub.name, a.daysLeft, a.level])).toEqual([
      ['Ended', -2, 'ended'],
      ['Today', 0, 'urgent'],
      ['In3', 3, 'urgent'],
      ['In6', 6, 'soon'],
    ]);
  });
});

describe('money saved', () => {
  it('counts billing dates after cancellation up to today', () => {
    const subs = [
      // cancelled Jul 20, billed on the 1st → Aug 1, Sep 1, Oct 1 avoided
      makeSub({ name: 'M', status: 'cancelled', cancelledAt: '2026-07-20', nextBillingDate: '2026-08-01', price: 50 }),
      // yearly not yet renewed → nothing saved yet
      makeSub({ name: 'Y', status: 'cancelled', cancelledAt: '2026-09-01', cycle: 'yearly', nextBillingDate: '2027-01-01' }),
      // cancelled on a billing day: that day counts as charged
      makeSub({ name: 'Edge', status: 'cancelled', cancelledAt: '2026-10-01', nextBillingDate: '2026-09-01', price: 10, currency: 'USD' }),
      makeSub({ name: 'Active', nextBillingDate: '2026-01-01' }),
    ];
    const saved = moneySaved(subs, today);
    expect(saved.map((s) => [s.sub.name, s.paymentsAvoided, s.amount])).toEqual([['M', 3, 150]]);
    const laterSaved = moneySaved(subs, '2026-11-01');
    expect(laterSaved.find((s) => s.sub.name === 'Edge')).toMatchObject({ paymentsAvoided: 1, amount: 10 });
    expect(totalSaved(laterSaved, ctx).amount).toBeCloseTo(200 + 80);
  });
});
