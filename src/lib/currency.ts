/**
 * Currency conversion and exchange-rate parsing.
 *
 * Rates come from free, key-less, CORS-enabled endpoints (see RATE_SOURCES)
 * and are cached once per day. Users can override any pair manually, which
 * also makes the app usable fully offline.
 */

/** Rates expressed as "units of currency per 1 unit of `base`". */
export interface RateTable {
  base: string;
  rates: Record<string, number>;
  /** Date the provider published these rates (YYYY-MM-DD). */
  date: string;
  /** Human-readable provider name, shown next to the rate date. */
  source: string;
  /** When we fetched them (epoch ms). */
  fetchedAt: number;
}

/** Manual overrides keyed "FROM:TO" meaning 1 FROM = value TO. */
export type ManualRates = Record<string, number>;

export const pairKey = (from: string, to: string) => `${from}:${to}`;

function tableRate(table: RateTable | null, code: string): number | undefined {
  if (!table) return undefined;
  if (code === table.base) return 1;
  const r = table.rates[code];
  return typeof r === 'number' && r > 0 && Number.isFinite(r) ? r : undefined;
}

/**
 * The rate for 1 `from` in `to`, or null when unknown.
 * Priority: identical currency → manual pair → manual reverse pair → rate table.
 */
export function getRate(from: string, to: string, table: RateTable | null, manual: ManualRates = {}): number | null {
  if (from === to) return 1;
  const direct = manual[pairKey(from, to)];
  if (direct && direct > 0 && Number.isFinite(direct)) return direct;
  const reverse = manual[pairKey(to, from)];
  if (reverse && reverse > 0 && Number.isFinite(reverse)) return 1 / reverse;
  const rf = tableRate(table, from);
  const rt = tableRate(table, to);
  if (rf === undefined || rt === undefined) return null;
  return rt / rf;
}

/** Convert an amount; returns null if no rate is available. */
export function convert(
  amount: number,
  from: string,
  to: string,
  table: RateTable | null,
  manual: ManualRates = {},
): number | null {
  const rate = getRate(from, to, table, manual);
  return rate === null ? null : amount * rate;
}

const MAX_AGE_MS = 24 * 60 * 60 * 1000;

/** Cached rates are refreshed when older than 24h. */
export function isStale(table: RateTable | null, now = Date.now()): boolean {
  return !table || now - table.fetchedAt > MAX_AGE_MS || table.fetchedAt > now + 60_000;
}

function cleanRates(input: Record<string, unknown>, upper: boolean): Record<string, number> {
  const out: Record<string, number> = {};
  for (const [k, v] of Object.entries(input)) {
    const code = upper ? k.toUpperCase() : k;
    if (/^[A-Z]{3}$/.test(code) && typeof v === 'number' && v > 0 && Number.isFinite(v)) out[code] = v;
  }
  return out;
}

const isObj = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);

/** Parse https://open.er-api.com/v6/latest/USD (ExchangeRate-API open access). */
export function parseOpenErApi(json: unknown, fetchedAt = Date.now()): RateTable | null {
  if (!isObj(json) || json.result !== 'success' || !isObj(json.rates)) return null;
  const base = typeof json.base_code === 'string' ? json.base_code.toUpperCase() : 'USD';
  const unix = typeof json.time_last_update_unix === 'number' ? json.time_last_update_unix : NaN;
  const date = Number.isFinite(unix) ? new Date(unix * 1000).toISOString().slice(0, 10) : '';
  const rates = cleanRates(json.rates, true);
  if (Object.keys(rates).length < 5 || !date) return null;
  return { base, rates, date, source: 'ExchangeRate-API', fetchedAt };
}

/** Parse https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/usd.json */
export function parseFawazApi(json: unknown, fetchedAt = Date.now()): RateTable | null {
  if (!isObj(json) || typeof json.date !== 'string') return null;
  const baseKey = Object.keys(json).find((k) => k !== 'date' && isObj(json[k]));
  if (!baseKey) return null;
  const rates = cleanRates(json[baseKey] as Record<string, unknown>, true);
  if (Object.keys(rates).length < 5 || !/^\d{4}-\d{2}-\d{2}$/.test(json.date)) return null;
  return { base: baseKey.toUpperCase(), rates, date: json.date, source: 'fawazahmed0/exchange-api', fetchedAt };
}

export const RATE_SOURCES = [
  { url: 'https://open.er-api.com/v6/latest/USD', parse: parseOpenErApi },
  { url: 'https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/usd.json', parse: parseFawazApi },
  { url: 'https://latest.currency-api.pages.dev/v1/currencies/usd.json', parse: parseFawazApi },
] as const;

/**
 * Try each source in order. Sends no cookies, no identifiers — just a GET.
 * Returns null when every source fails (e.g. offline).
 */
export async function fetchRates(fetchImpl: typeof fetch = fetch, now = Date.now()): Promise<RateTable | null> {
  for (const source of RATE_SOURCES) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 8000);
      const res = await fetchImpl(source.url, { signal: controller.signal, credentials: 'omit', referrerPolicy: 'no-referrer' });
      clearTimeout(timer);
      if (!res.ok) continue;
      const table = source.parse(await res.json(), now);
      if (table) return table;
    } catch {
      // try the next source
    }
  }
  return null;
}

/** Validate a cached table read back from storage. */
export function validateRateTable(v: unknown): RateTable | null {
  if (!isObj(v) || typeof v.base !== 'string' || !isObj(v.rates) || typeof v.date !== 'string') return null;
  if (typeof v.fetchedAt !== 'number' || !Number.isFinite(v.fetchedAt)) return null;
  const rates = cleanRates(v.rates, false);
  if (Object.keys(rates).length === 0) return null;
  return { base: v.base, rates, date: v.date, source: typeof v.source === 'string' ? v.source : '', fetchedAt: v.fetchedAt };
}
