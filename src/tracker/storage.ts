/**
 * localStorage wrapper that never throws. Storage can be unavailable
 * (private mode, blocked cookies) or full; callers get a status instead.
 */
import { STORAGE_PREFIX } from '../config/site';

export const KEYS = {
  data: `${STORAGE_PREFIX}:data:v1`,
  rates: `${STORAGE_PREFIX}:rates`,
  backupPrefix: `${STORAGE_PREFIX}:backup:`,
  bmcTriggered: `${STORAGE_PREFIX}:bmc-triggered`,
  bmcDismissedAt: `${STORAGE_PREFIX}:bmc-dismissed-at`,
  notified: `${STORAGE_PREFIX}:notified`,
  tab: `${STORAGE_PREFIX}:tab`,
} as const;

export type WriteResult = 'ok' | 'quota' | 'unavailable';

export function readKey(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function writeKey(key: string, value: string): WriteResult {
  try {
    window.localStorage.setItem(key, value);
    return 'ok';
  } catch (e) {
    const name = (e as { name?: string })?.name;
    return name === 'QuotaExceededError' || name === 'NS_ERROR_DOM_QUOTA_REACHED' ? 'quota' : 'unavailable';
  }
}

export function removeKey(key: string): void {
  try {
    window.localStorage.removeItem(key);
  } catch {
    /* ignore */
  }
}

export function storageAvailable(): boolean {
  try {
    const k = `${STORAGE_PREFIX}:probe`;
    window.localStorage.setItem(k, '1');
    window.localStorage.removeItem(k);
    return true;
  } catch {
    return false;
  }
}

/** Remove every key this app created (used by "Clear all data"). */
export function removeAllAppKeys(): void {
  try {
    const keys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith(`${STORAGE_PREFIX}:`)) keys.push(k);
    }
    keys.forEach((k) => localStorage.removeItem(k));
  } catch {
    /* ignore */
  }
}

/** Trigger a file download of in-memory content. */
export function downloadFile(filename: string, content: string, mime: string): void {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
