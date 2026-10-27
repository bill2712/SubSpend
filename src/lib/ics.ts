/**
 * iCalendar (.ics, RFC 5545) export of upcoming payments and trial endings.
 * We export explicit dated all-day events (not RRULEs) because month-end
 * rules like "the 31st, or the last day of shorter months" are handled
 * inconsistently by calendar apps.
 */
import { addDays, type ISODate } from './dates';
import { occurrencesBetween, subscriptionInterval } from './billing';
import { costPerCycle } from './insights';
import type { Subscription } from './types';

export interface IcsOptions {
  today: ISODate;
  /** How far ahead to export, in days. */
  horizonDays: number;
  /** Alarm this many days before (0 = morning of). */
  reminderDaysBefore: number;
  formatAmount: (amount: number, currency: string) => string;
  labels: { payment: string; trialEnds: string; description: string; trialDescription: string };
  prodId: string;
  /** For deterministic tests. */
  now?: Date;
}

/** Escape TEXT values per RFC 5545 §3.3.11. */
export function escapeIcsText(s: string): string {
  return s.replace(/\\/g, '\\\\').replace(/;/g, '\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n');
}

/** Fold lines longer than 75 octets (RFC 5545 §3.1), without splitting UTF-8 characters. */
export function foldLine(line: string): string {
  const enc = new TextEncoder();
  if (enc.encode(line).length <= 75) return line;
  const parts: string[] = [];
  let current = '';
  let size = 0;
  const limit = () => (parts.length === 0 ? 75 : 74); // continuation lines start with a space
  for (const ch of line) {
    const len = enc.encode(ch).length;
    if (size + len > limit()) {
      parts.push(current);
      current = '';
      size = 0;
    }
    current += ch;
    size += len;
  }
  parts.push(current);
  return parts.join('\r\n ');
}

const compact = (iso: ISODate) => iso.replace(/-/g, '');

function stamp(d: Date): string {
  return d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
}

/** Alarm at 09:00 local time, N days before an all-day event. */
export function alarmTrigger(daysBefore: number): string {
  if (daysBefore <= 0) return 'PT9H';
  const days = daysBefore - 1;
  return days > 0 ? `-P${days}DT15H` : '-PT15H';
}

function fill(template: string, vars: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (_, k: string) => vars[k] ?? '');
}

export function buildIcs(subs: Subscription[], opts: IcsOptions): { ics: string; eventCount: number } {
  const lines: string[] = ['BEGIN:VCALENDAR', 'VERSION:2.0', `PRODID:${opts.prodId}`, 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH'];
  const dtstamp = stamp(opts.now ?? new Date());
  const end = addDays(opts.today, opts.horizonDays);
  let eventCount = 0;

  const addEvent = (uid: string, date: ISODate, summary: string, description: string) => {
    lines.push(
      'BEGIN:VEVENT',
      `UID:${uid}`,
      `DTSTAMP:${dtstamp}`,
      `DTSTART;VALUE=DATE:${compact(date)}`,
      `DTEND;VALUE=DATE:${compact(addDays(date, 1))}`,
      `SUMMARY:${escapeIcsText(summary)}`,
      `DESCRIPTION:${escapeIcsText(description)}`,
      'TRANSP:TRANSPARENT',
      'BEGIN:VALARM',
      'ACTION:DISPLAY',
      `DESCRIPTION:${escapeIcsText(summary)}`,
      `TRIGGER:${alarmTrigger(opts.reminderDaysBefore)}`,
      'END:VALARM',
      'END:VEVENT',
    );
    eventCount++;
  };

  for (const sub of subs) {
    if (sub.status !== 'active') continue;
    const amount = opts.formatAmount(costPerCycle(sub), sub.currency);
    const vars = { name: sub.name, amount };
    for (const date of occurrencesBetween(sub.nextBillingDate, subscriptionInterval(sub), opts.today, end, 400)) {
      addEvent(`${sub.id}-${compact(date)}@subspend`, date, fill(opts.labels.payment, vars), fill(opts.labels.description, vars));
    }
    if (sub.trialEndDate && sub.trialEndDate >= opts.today && sub.trialEndDate <= end) {
      addEvent(
        `${sub.id}-trial-${compact(sub.trialEndDate)}@subspend`,
        sub.trialEndDate,
        fill(opts.labels.trialEnds, vars),
        fill(opts.labels.trialDescription, vars),
      );
    }
  }
  lines.push('END:VCALENDAR');
  return { ics: lines.map(foldLine).join('\r\n') + '\r\n', eventCount };
}
