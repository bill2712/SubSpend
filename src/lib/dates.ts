/**
 * Date-only helpers working on ISO "YYYY-MM-DD" strings.
 *
 * Billing dates are calendar dates, not instants, so we never use local-time
 * Date arithmetic (which breaks around DST changes). Everything is computed
 * on UTC midnights and converted back to plain strings.
 */

export type ISODate = string;

const ISO_RE = /^(\d{4})-(\d{2})-(\d{2})$/;
const DAY_MS = 86_400_000;

export interface YMD {
  y: number;
  m: number; // 1-12
  d: number; // 1-31
}

export function isLeapYear(y: number): boolean {
  return (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
}

export function daysInMonth(y: number, m: number): number {
  return [31, isLeapYear(y) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][m - 1] ?? 30;
}

/** Parse and validate an ISO date. Returns null for malformed or impossible dates (e.g. 2025-02-29). */
export function parseISODate(s: unknown): YMD | null {
  if (typeof s !== 'string') return null;
  const match = ISO_RE.exec(s);
  if (!match) return null;
  const y = Number(match[1]);
  const m = Number(match[2]);
  const d = Number(match[3]);
  if (y < 1900 || y > 2200 || m < 1 || m > 12 || d < 1 || d > daysInMonth(y, m)) return null;
  return { y, m, d };
}

export function isISODate(s: unknown): s is ISODate {
  return parseISODate(s) !== null;
}

const pad = (n: number, w = 2) => String(n).padStart(w, '0');

export function toISODate({ y, m, d }: YMD): ISODate {
  return `${pad(y, 4)}-${pad(m)}-${pad(d)}`;
}

/** Today's date in the user's local time zone. */
export function todayISO(now: Date = new Date()): ISODate {
  return toISODate({ y: now.getFullYear(), m: now.getMonth() + 1, d: now.getDate() });
}

function toUTCms(iso: ISODate): number {
  const p = parseISODate(iso);
  if (!p) throw new RangeError(`Invalid ISO date: ${iso}`);
  return Date.UTC(p.y, p.m - 1, p.d);
}

function fromUTCms(ms: number): ISODate {
  const dt = new Date(ms);
  return toISODate({ y: dt.getUTCFullYear(), m: dt.getUTCMonth() + 1, d: dt.getUTCDate() });
}

export function addDays(iso: ISODate, days: number): ISODate {
  return fromUTCms(toUTCms(iso) + days * DAY_MS);
}

/** Whole days from `a` to `b` (positive when b is later). */
export function diffDays(a: ISODate, b: ISODate): number {
  return Math.round((toUTCms(b) - toUTCms(a)) / DAY_MS);
}

/**
 * Add calendar months, clamping to the end of shorter months.
 * `dayOfMonth` lets callers keep the *original* billing day: a plan that
 * started on the 31st bills on Feb 28/29 and then on Mar 31 again.
 */
export function addMonths(iso: ISODate, months: number, dayOfMonth?: number): ISODate {
  const p = parseISODate(iso);
  if (!p) throw new RangeError(`Invalid ISO date: ${iso}`);
  const total = p.y * 12 + (p.m - 1) + months;
  const y = Math.floor(total / 12);
  const m = (total % 12) + 1;
  const wanted = dayOfMonth ?? p.d;
  return toISODate({ y, m, d: Math.min(wanted, daysInMonth(y, m)) });
}

/** Months between the year-month parts of two dates (ignores the day). */
export function monthIndexDiff(a: ISODate, b: ISODate): number {
  const pa = parseISODate(a)!;
  const pb = parseISODate(b)!;
  return (pb.y - pa.y) * 12 + (pb.m - pa.m);
}

export function compareISO(a: ISODate, b: ISODate): number {
  return a < b ? -1 : a > b ? 1 : 0; // ISO strings sort lexicographically
}
