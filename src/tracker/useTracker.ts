/**
 * Tracker state: loads from localStorage after mount (so server-rendered
 * HTML always matches the first client render), persists every change,
 * syncs across tabs and supports a non-persistent demo mode.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { todayISO, type ISODate } from '../lib/dates';
import type { Subscription, SubscriptionStatus } from '../lib/types';
import { emptyData, parseAppData, type AppData, type Settings } from '../lib/validation';
import { KEYS, readKey, removeAllAppKeys, storageAvailable, writeKey } from './storage';
import { buildSampleData } from './sampleData';

export interface StorageIssues {
  /** localStorage key holding the unreadable raw data. */
  corruptBackupKey?: string;
  dropped?: number;
  unavailable?: boolean;
  quota?: boolean;
}

interface State {
  ready: boolean;
  data: AppData;
  demo: AppData | null;
  issues: StorageIssues;
}

function loadFromStorage(): { data: AppData; issues: StorageIssues } {
  if (!storageAvailable()) return { data: emptyData(), issues: { unavailable: true } };
  const raw = readKey(KEYS.data);
  const result = parseAppData(raw);
  const issues: StorageIssues = {};
  if (result.corrupt && raw) {
    // Keep the unreadable blob so nothing is lost; the user can download it.
    const backupKey = `${KEYS.backupPrefix}${Date.now()}`;
    writeKey(backupKey, raw);
    issues.corruptBackupKey = backupKey;
  }
  if (result.dropped > 0) issues.dropped = result.dropped;
  return { data: result.data, issues };
}

export function useTracker(lang: 'en' | 'zh-HK') {
  const [state, setState] = useState<State>({ ready: false, data: emptyData(), demo: null, issues: {} });
  const dirty = useRef(false);

  useEffect(() => {
    const { data, issues } = loadFromStorage();
    setState({ ready: true, data, demo: null, issues });
    const onStorage = (e: StorageEvent) => {
      if (e.key !== KEYS.data) return;
      const parsed = parseAppData(e.newValue);
      if (!parsed.corrupt) setState((s) => ({ ...s, data: parsed.data }));
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  // Persist real (non-demo) data after each change.
  useEffect(() => {
    if (!state.ready || !dirty.current) return;
    dirty.current = false;
    const result = writeKey(KEYS.data, JSON.stringify(state.data));
    if (result !== 'ok') setState((s) => ({ ...s, issues: { ...s.issues, quota: result === 'quota', unavailable: result === 'unavailable' } }));
  }, [state.data, state.ready]);

  /** Apply a change to whichever dataset is active (demo or real). */
  const commit = useCallback((fn: (d: AppData) => AppData) => {
    setState((s) => {
      if (s.demo) return { ...s, demo: fn(s.demo) };
      dirty.current = true;
      return { ...s, data: fn(s.data) };
    });
  }, []);

  const upsert = useCallback(
    (sub: Subscription) =>
      commit((d) => {
        const exists = d.subscriptions.some((s) => s.id === sub.id);
        const stamped = { ...sub, updatedAt: new Date().toISOString() };
        return {
          ...d,
          subscriptions: exists ? d.subscriptions.map((s) => (s.id === sub.id ? stamped : s)) : [...d.subscriptions, stamped],
        };
      }),
    [commit],
  );

  const remove = useCallback((id: string) => commit((d) => ({ ...d, subscriptions: d.subscriptions.filter((s) => s.id !== id) })), [commit]);

  const restore = useCallback(
    (sub: Subscription, index: number) =>
      commit((d) => {
        if (d.subscriptions.some((s) => s.id === sub.id)) return d;
        const list = [...d.subscriptions];
        list.splice(Math.min(index, list.length), 0, sub);
        return { ...d, subscriptions: list };
      }),
    [commit],
  );

  const setStatus = useCallback(
    (id: string, status: SubscriptionStatus, today: ISODate = todayISO()) =>
      commit((d) => ({
        ...d,
        subscriptions: d.subscriptions.map((s) => {
          if (s.id !== id) return s;
          const next: Subscription = { ...s, status, updatedAt: new Date().toISOString() };
          delete next.cancelledAt;
          delete next.pausedAt;
          if (status === 'cancelled') next.cancelledAt = s.cancelledAt ?? today;
          if (status === 'paused') next.pausedAt = s.pausedAt ?? today;
          return next;
        }),
      })),
    [commit],
  );

  const updateSettings = useCallback(
    (patch: Partial<Settings>) => commit((d) => ({ ...d, settings: { ...d.settings, ...patch } })),
    [commit],
  );

  const importData = useCallback(
    (incoming: AppData, mode: 'replace' | 'merge') =>
      commit((d) => {
        if (mode === 'replace') return incoming;
        const ids = new Set(d.subscriptions.map((s) => s.id));
        const added = incoming.subscriptions.map((s) => (ids.has(s.id) ? { ...s, id: `${s.id}-${Date.now().toString(36)}` } : s));
        return { ...d, subscriptions: [...d.subscriptions, ...added] };
      }),
    [commit],
  );

  const clearAll = useCallback(() => {
    removeAllAppKeys();
    setState((s) => ({ ...s, data: emptyData(), demo: null, issues: {} }));
  }, []);

  const startDemo = useCallback(() => setState((s) => ({ ...s, demo: buildSampleData(todayISO(), lang) })), [lang]);
  const exitDemo = useCallback(() => setState((s) => ({ ...s, demo: null })), []);
  const dismissIssues = useCallback(() => setState((s) => ({ ...s, issues: {} })), []);

  return {
    ready: state.ready,
    data: state.demo ?? state.data,
    isDemo: state.demo !== null,
    hasRealData: state.data.subscriptions.length > 0,
    issues: state.issues,
    upsert,
    remove,
    restore,
    setStatus,
    updateSettings,
    importData,
    clearAll,
    startDemo,
    exitDemo,
    dismissIssues,
  };
}

export type Tracker = ReturnType<typeof useTracker>;
