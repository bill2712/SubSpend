import { describe, expect, it } from 'vitest';
import { looksLikeCardNumber, parseAmount, parseAppData, sanitizeSettings, sanitizeSubscription } from './validation';
import { makeSub } from './testUtils';

describe('input validation', () => {
  it('detects full card numbers but allows labels', () => {
    expect(looksLikeCardNumber('4111 1111 1111 1111')).toBe(true);
    expect(looksLikeCardNumber('4111-1111-1111-1111')).toBe(true);
    expect(looksLikeCardNumber('378282246310005')).toBe(true);
    expect(looksLikeCardNumber('Visa ending 1234')).toBe(false);
    expect(looksLikeCardNumber('Octopus 12345678')).toBe(false);
  });
  it('parses amounts', () => {
    expect(parseAmount('88')).toBe(88);
    expect(parseAmount('1,234.50')).toBe(1234.5);
    expect(parseAmount('HK$ 78')).toBe(78);
    expect(parseAmount('.99')).toBe(0.99);
    expect(parseAmount('-5')).toBeNull();
    expect(parseAmount('abc')).toBeNull();
    expect(parseAmount('1e5')).toBeNull();
    expect(parseAmount('99999999999')).toBeNull();
  });
  it('sanitises subscriptions', () => {
    const ok = sanitizeSubscription({ ...makeSub(), name: '  Netflix\u0000 ', paymentMethod: '4111111111111111', notes: 'x'.repeat(900) });
    expect(ok?.name).toBe('Netflix');
    expect(ok?.paymentMethod).toBeUndefined();
    expect(ok?.notes).toHaveLength(500);
    expect(sanitizeSubscription({ ...makeSub(), price: -1 })).toBeNull();
    expect(sanitizeSubscription({ ...makeSub(), currency: 'XYZ' })).toBeNull();
    expect(sanitizeSubscription({ ...makeSub(), nextBillingDate: '2026-02-30' })).toBeNull();
    expect(sanitizeSubscription({ ...makeSub(), cycle: 'custom' })).toBeNull();
    expect(sanitizeSubscription({ ...makeSub(), cycle: 'custom', customInterval: { count: 2, unit: 'week' } })?.customInterval).toEqual({ count: 2, unit: 'week' });
    expect(sanitizeSubscription({ ...makeSub(), category: 'bogus', status: 'weird' })).toMatchObject({ category: 'other', status: 'active' });
    expect(sanitizeSubscription({ ...makeSub(), split: { people: 3, mode: 'percent', value: 140 } })?.split).toBeUndefined();
    expect(sanitizeSubscription('string')).toBeNull();
  });
});

describe('stored data parsing', () => {
  it('handles empty storage', () => {
    expect(parseAppData(null)).toMatchObject({ corrupt: false, dropped: 0 });
  });
  it('flags corrupt JSON without throwing', () => {
    expect(parseAppData('{not json').corrupt).toBe(true);
    expect(parseAppData('"hello"').corrupt).toBe(true);
    expect(parseAppData('{"subscriptions": 5}').corrupt).toBe(true);
  });
  it('drops bad items, de-duplicates ids, keeps good ones', () => {
    const raw = JSON.stringify({ version: 1, subscriptions: [makeSub({ id: 'a' }), { name: 'broken' }, makeSub({ id: 'a' })], settings: { displayCurrency: 'USD', trialAlertDays: 999 } });
    const r = parseAppData(raw);
    expect(r.dropped).toBe(1);
    expect(r.data.subscriptions).toHaveLength(2);
    expect(new Set(r.data.subscriptions.map((s) => s.id)).size).toBe(2);
    expect(r.data.settings.displayCurrency).toBe('USD');
    expect(r.data.settings.trialAlertDays).toBe(7);
  });
  it('accepts a bare array import', () => {
    expect(parseAppData(JSON.stringify([makeSub()])).data.subscriptions).toHaveLength(1);
  });
  it('sanitises settings', () => {
    const s = sanitizeSettings({ manualRates: { 'USD:HKD': 7.8, 'BAD:HKD': 3, 'USD:EUR': -1 }, comparisonAmounts: { coffee: { amount: 35, currency: 'HKD' }, x: { amount: -1, currency: 'HKD' } } });
    expect(s.manualRates).toEqual({ 'USD:HKD': 7.8 });
    expect(s.comparisonAmounts).toEqual({ coffee: { amount: 35, currency: 'HKD' } });
  });
});
