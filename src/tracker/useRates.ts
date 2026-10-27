/**
 * Exchange rates: read the daily cache, fetch fresh rates only when the
 * user actually has more than one currency, and fall back to cached or
 * manual rates offline.
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import { fetchRates, isStale, validateRateTable, type RateTable } from '../lib/currency';
import type { Subscription } from '../lib/types';
import { KEYS, readKey, writeKey } from './storage';

export type RatesStatus = 'idle' | 'loading' | 'ok' | 'error';

function readCache(): RateTable | null {
  const raw = readKey(KEYS.rates);
  if (!raw) return null;
  try {
    return validateRateTable(JSON.parse(raw));
  } catch {
    return null;
  }
}

export function useRates(subs: Subscription[], displayCurrency: string, ready: boolean) {
  const [table, setTable] = useState<RateTable | null>(null);
  const [status, setStatus] = useState<RatesStatus>('idle');

  const needed = useMemo(() => subs.some((s) => s.currency !== displayCurrency), [subs, displayCurrency]);

  useEffect(() => {
    setTable(readCache());
  }, []);

  const refresh = useCallback(async (force = false) => {
    const cached = readCache();
    if (!force && !isStale(cached)) {
      setTable(cached);
      setStatus('ok');
      return;
    }
    setStatus('loading');
    const fresh = await fetchRates();
    if (fresh) {
      writeKey(KEYS.rates, JSON.stringify(fresh));
      setTable(fresh);
      setStatus('ok');
    } else {
      setStatus('error');
    }
  }, []);

  useEffect(() => {
    if (!ready || !needed) return;
    void refresh();
  }, [ready, needed, refresh]);

  return { table, status, needed, refresh: () => refresh(true) };
}
