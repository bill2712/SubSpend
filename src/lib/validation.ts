/**
 * Validation and sanitisation for everything that enters the app:
 * form input, imported JSON and data read back from localStorage.
 */
import { isCategory } from '../config/catalog';
import { CURRENCIES, DEFAULT_CURRENCY, isCurrencyCode, type CurrencyCode } from '../config/currencies';
import { isISODate } from './dates';
import type { CycleKind, Interval, IntervalUnit, Split, Subscription, SubscriptionStatus } from './types';

export const LIMITS = {
  nameMax: 80,
  notesMax: 500,
  paymentMax: 60,
  priceMax: 10_000_000,
  peopleMax: 50,
  customCountMax: 999,
  subscriptionsMax: 500,
} as const;

const CYCLES: CycleKind[] = ['weekly', 'monthly', 'quarterly', 'yearly', 'custom'];
const UNITS: IntervalUnit[] = ['day', 'week', 'month', 'year'];
const STATUSES: SubscriptionStatus[] = ['active', 'paused', 'cancelled'];

/**
 * True if the text contains something that looks like a full payment card
 * number (12-19 digits, optionally separated by spaces or dashes).
 */
export function looksLikeCardNumber(text: string): boolean {
  return /\d{12,}/.test(text.replace(/[\s.-]/g, ''));
}

const isObj = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);

/** Strip control characters and trim to a maximum length. */
export function cleanText(v: unknown, max: number): string {
  if (typeof v !== 'string') return '';
  // eslint-disable-next-line no-control-regex
  return v.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '').trim().slice(0, max);
}

/** Parse a user-typed amount like "1,234.50" or "88". Returns null if invalid. */
export function parseAmount(input: string): number | null {
  const normalised = input.trim().replace(/[,\s]/g, '').replace(/^[^\d.-]+/, '');
  if (!/^\d+(\.\d{1,4})?$|^\.\d{1,4}$/.test(normalised)) return null;
  const n = Number(normalised);
  return Number.isFinite(n) && n >= 0 && n <= LIMITS.priceMax ? n : null;
}

function validInterval(v: unknown): Interval | undefined {
  if (!isObj(v)) return undefined;
  const count = Number(v.count);
  if (!Number.isInteger(count) || count < 1 || count > LIMITS.customCountMax) return undefined;
  if (!UNITS.includes(v.unit as IntervalUnit)) return undefined;
  return { count, unit: v.unit as IntervalUnit };
}

function validSplit(v: unknown): Split | undefined {
  if (!isObj(v)) return undefined;
  const people = Number(v.people);
  if (!Number.isInteger(people) || people < 1 || people > LIMITS.peopleMax) return undefined;
  const mode = v.mode === 'percent' || v.mode === 'fixed' ? v.mode : 'equal';
  const split: Split = { people, mode };
  if (mode !== 'equal') {
    const value = Number(v.value);
    if (!Number.isFinite(value) || value < 0) return undefined;
    if (mode === 'percent' && value > 100) return undefined;
    split.value = value;
  }
  return people === 1 && mode === 'equal' ? undefined : split;
}

/**
 * Turn unknown input into a valid Subscription, or null when essential
 * fields are missing/invalid. Optional fields that are invalid are dropped.
 */
export function sanitizeSubscription(v: unknown): Subscription | null {
  if (!isObj(v)) return null;
  const name = cleanText(v.name, LIMITS.nameMax);
  const price = typeof v.price === 'number' ? v.price : Number(v.price);
  if (!name || !Number.isFinite(price) || price < 0 || price > LIMITS.priceMax) return null;
  if (!isCurrencyCode(v.currency)) return null;
  if (!CYCLES.includes(v.cycle as CycleKind)) return null;
  if (!isISODate(v.nextBillingDate)) return null;

  const now = new Date().toISOString();
  const cycle = v.cycle as CycleKind;
  const customInterval = cycle === 'custom' ? validInterval(v.customInterval) : undefined;
  if (cycle === 'custom' && !customInterval) return null;

  let paymentMethod = cleanText(v.paymentMethod, LIMITS.paymentMax);
  if (looksLikeCardNumber(paymentMethod)) paymentMethod = ''; // never keep card numbers

  const status = STATUSES.includes(v.status as SubscriptionStatus) ? (v.status as SubscriptionStatus) : 'active';
  const sub: Subscription = {
    id: cleanText(v.id, 64) || makeId(),
    name,
    category: isCategory(v.category) ? v.category : 'other',
    price: Math.round(price * 10_000) / 10_000,
    currency: v.currency,
    cycle,
    nextBillingDate: v.nextBillingDate,
    status,
    createdAt: typeof v.createdAt === 'string' ? v.createdAt.slice(0, 40) : now,
    updatedAt: typeof v.updatedAt === 'string' ? v.updatedAt.slice(0, 40) : now,
  };
  const catalogId = cleanText(v.catalogId, 64);
  if (catalogId) sub.catalogId = catalogId;
  if (customInterval) sub.customInterval = customInterval;
  if (isISODate(v.trialEndDate)) sub.trialEndDate = v.trialEndDate;
  if (paymentMethod) sub.paymentMethod = paymentMethod;
  const split = validSplit(v.split);
  if (split) sub.split = split;
  const notes = cleanText(v.notes, LIMITS.notesMax);
  if (notes) sub.notes = notes;
  if (status === 'cancelled' && isISODate(v.cancelledAt)) sub.cancelledAt = v.cancelledAt;
  if (status === 'paused' && isISODate(v.pausedAt)) sub.pausedAt = v.pausedAt;
  return sub;
}

export function makeId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  return `id-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

/* ---------------------------------------------------------------- settings */

export type ComparisonAmounts = Record<string, { amount: number; currency: CurrencyCode }>;

export interface Settings {
  displayCurrency: CurrencyCode;
  defaultCurrency: CurrencyCode;
  trialAlertDays: number;
  notificationsEnabled: boolean;
  /** Days before a payment/trial end to notify (browser + calendar alarm). */
  reminderDaysBefore: number;
  manualRates: Record<string, number>;
  comparisonAmounts: ComparisonAmounts;
}

export const DEFAULT_SETTINGS: Settings = {
  displayCurrency: DEFAULT_CURRENCY,
  defaultCurrency: DEFAULT_CURRENCY,
  trialAlertDays: 7,
  notificationsEnabled: false,
  reminderDaysBefore: 2,
  manualRates: {},
  comparisonAmounts: {},
};

const intIn = (v: unknown, min: number, max: number, fallback: number) => {
  const n = Number(v);
  return Number.isInteger(n) && n >= min && n <= max ? n : fallback;
};

export function sanitizeSettings(v: unknown): Settings {
  if (!isObj(v)) return { ...DEFAULT_SETTINGS };
  const manualRates: Record<string, number> = {};
  if (isObj(v.manualRates)) {
    for (const [k, r] of Object.entries(v.manualRates)) {
      const [a, b] = k.split(':');
      if (isCurrencyCode(a) && isCurrencyCode(b) && typeof r === 'number' && r > 0 && Number.isFinite(r)) manualRates[k] = r;
    }
  }
  const comparisonAmounts: ComparisonAmounts = {};
  if (isObj(v.comparisonAmounts)) {
    for (const [k, c] of Object.entries(v.comparisonAmounts)) {
      if (isObj(c) && typeof c.amount === 'number' && c.amount > 0 && c.amount < 1e7 && isCurrencyCode(c.currency)) {
        comparisonAmounts[k.slice(0, 20)] = { amount: c.amount, currency: c.currency };
      }
    }
  }
  return {
    displayCurrency: isCurrencyCode(v.displayCurrency) ? v.displayCurrency : DEFAULT_SETTINGS.displayCurrency,
    defaultCurrency: isCurrencyCode(v.defaultCurrency) ? v.defaultCurrency : DEFAULT_SETTINGS.defaultCurrency,
    trialAlertDays: intIn(v.trialAlertDays, 1, 60, DEFAULT_SETTINGS.trialAlertDays),
    notificationsEnabled: v.notificationsEnabled === true,
    reminderDaysBefore: intIn(v.reminderDaysBefore, 0, 14, DEFAULT_SETTINGS.reminderDaysBefore),
    manualRates,
    comparisonAmounts,
  };
}

/* ------------------------------------------------------------- app data */

export const DATA_VERSION = 1;

export interface AppData {
  version: number;
  subscriptions: Subscription[];
  settings: Settings;
}

export interface ParseResult {
  data: AppData;
  /** Entries that were present but invalid and therefore skipped. */
  dropped: number;
  /** The whole blob was unreadable (bad JSON or wrong shape). */
  corrupt: boolean;
}

export const emptyData = (): AppData => ({ version: DATA_VERSION, subscriptions: [], settings: { ...DEFAULT_SETTINGS } });

/**
 * Parse a JSON string from storage or an import file. Never throws:
 * a broken blob yields empty data with `corrupt: true`, and individual
 * bad subscriptions are skipped and counted in `dropped`.
 */
export function parseAppData(raw: string | null): ParseResult {
  if (raw === null || raw === '') return { data: emptyData(), dropped: 0, corrupt: false };
  let json: unknown;
  try {
    json = JSON.parse(raw);
  } catch {
    return { data: emptyData(), dropped: 0, corrupt: true };
  }
  // Accept a bare array of subscriptions too (handy for hand-written imports).
  const obj = Array.isArray(json) ? { subscriptions: json } : json;
  if (!isObj(obj) || !Array.isArray(obj.subscriptions)) return { data: emptyData(), dropped: 0, corrupt: true };

  const seen = new Set<string>();
  const subscriptions: Subscription[] = [];
  let dropped = 0;
  for (const item of obj.subscriptions.slice(0, LIMITS.subscriptionsMax)) {
    const sub = sanitizeSubscription(item);
    if (!sub) {
      dropped++;
      continue;
    }
    if (seen.has(sub.id)) sub.id = makeId();
    seen.add(sub.id);
    subscriptions.push(sub);
  }
  dropped += Math.max(0, obj.subscriptions.length - LIMITS.subscriptionsMax);
  return { data: { version: DATA_VERSION, subscriptions, settings: sanitizeSettings(obj.settings) }, dropped, corrupt: false };
}

export { CURRENCIES };
