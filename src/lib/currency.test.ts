import { describe, expect, it, vi } from 'vitest';
import { convert, fetchRates, getRate, isStale, parseFawazApi, parseOpenErApi, validateRateTable, type RateTable } from './currency';

const table: RateTable = { base: 'USD', rates: { USD: 1, HKD: 7.8, JPY: 150, EUR: 0.9, GBP: 0.8, TWD: 32 }, date: '2026-10-27', source: 'test', fetchedAt: 1_000 };

describe('conversion', () => {
  it('converts via the base currency', () => {
    expect(convert(10, 'USD', 'HKD', table)).toBeCloseTo(78);
    expect(convert(78, 'HKD', 'USD', table)).toBeCloseTo(10);
    expect(convert(1500, 'JPY', 'HKD', table)).toBeCloseTo(78);
    expect(convert(5, 'HKD', 'HKD', null)).toBe(5);
  });
  it('returns null when a rate is unknown', () => {
    expect(convert(10, 'SGD', 'HKD', table)).toBeNull();
    expect(convert(10, 'USD', 'HKD', null)).toBeNull();
  });
  it('prefers manual rates, including the reverse pair', () => {
    expect(getRate('USD', 'HKD', table, { 'USD:HKD': 7.75 })).toBe(7.75);
    expect(getRate('HKD', 'USD', table, { 'USD:HKD': 8 })).toBe(0.125);
    expect(convert(10, 'SGD', 'HKD', null, { 'SGD:HKD': 6 })).toBe(60);
    // invalid manual values are ignored
    expect(getRate('USD', 'HKD', table, { 'USD:HKD': -1 })).toBeCloseTo(7.8);
  });
  it('treats caches older than a day as stale', () => {
    expect(isStale(null)).toBe(true);
    expect(isStale(table, 1_000 + 60_000)).toBe(false);
    expect(isStale(table, 1_000 + 25 * 3600_000)).toBe(true);
  });
});

describe('rate parsing', () => {
  it('parses open.er-api.com responses', () => {
    const t = parseOpenErApi({
      result: 'success', base_code: 'USD', time_last_update_unix: 1793059201,
      rates: { USD: 1, HKD: 7.77, JPY: 151.2, EUR: 0.92, GBP: 0.78, TWD: 31.9, BAD: 'x', XX: 3 },
    }, 5);
    expect(t?.base).toBe('USD');
    expect(t?.rates.HKD).toBe(7.77);
    expect(t?.rates.BAD).toBeUndefined();
    expect(t?.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(parseOpenErApi({ result: 'error' })).toBeNull();
  });
  it('parses fawazahmed0 responses (lowercase codes)', () => {
    const t = parseFawazApi({ date: '2026-10-26', usd: { hkd: 7.77, jpy: 151, eur: 0.92, gbp: 0.78, twd: 31.9, btc: 0.00001 } });
    expect(t?.rates.HKD).toBe(7.77);
    expect(t?.date).toBe('2026-10-26');
    expect(parseFawazApi('nope')).toBeNull();
  });
  it('validates cached tables', () => {
    expect(validateRateTable(table)?.rates.HKD).toBe(7.8);
    expect(validateRateTable({ ...table, fetchedAt: 'x' })).toBeNull();
    expect(validateRateTable(null)).toBeNull();
  });
  it('falls back to the next source when one fails', async () => {
    const fake = vi.fn()
      .mockRejectedValueOnce(new Error('offline'))
      .mockResolvedValueOnce({ ok: true, json: async () => ({ date: '2026-10-26', usd: { hkd: 7.8, jpy: 1, eur: 1, gbp: 1, twd: 1 } }) });
    const t = await fetchRates(fake as unknown as typeof fetch, 42);
    expect(t?.rates.HKD).toBe(7.8);
    expect(t?.fetchedAt).toBe(42);
    expect(fake).toHaveBeenCalledTimes(2);
  });
  it('returns null when every source fails', async () => {
    const fake = vi.fn().mockResolvedValue({ ok: false });
    expect(await fetchRates(fake as unknown as typeof fetch)).toBeNull();
  });
});
