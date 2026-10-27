import { describe, expect, it } from 'vitest';
import { alarmTrigger, buildIcs, escapeIcsText, foldLine } from './ics';
import { csvCell, subscriptionsToCsv } from './csv';
import { makeSub } from './testUtils';

const labels = { payment: '{name} payment {amount}', trialEnds: 'Trial ends: {name}', description: 'Pay {amount}', trialDescription: 'Cancel {name} before today' };

describe('ics', () => {
  it('escapes and folds per RFC 5545', () => {
    expect(escapeIcsText('a,b;c\\d\ne')).toBe('a\\,b\;c\\\\d\\ne');
    const long = 'SUMMARY:' + '訂閱'.repeat(40);
    const folded = foldLine(long);
    for (const line of folded.split('\r\n')) expect(new TextEncoder().encode(line).length).toBeLessThanOrEqual(75);
    expect(folded.split('\r\n').map((l, i) => (i ? l.slice(1) : l)).join('')).toBe(long);
  });
  it('computes alarm triggers at 9am', () => {
    expect(alarmTrigger(0)).toBe('PT9H');
    expect(alarmTrigger(1)).toBe('-PT15H');
    expect(alarmTrigger(3)).toBe('-P2DT15H');
  });
  it('exports explicit all-day events for active subscriptions and trials', () => {
    const subs = [
      makeSub({ id: 's1', name: 'Music, Family', nextBillingDate: '2026-01-31', price: 10 }),
      makeSub({ id: 's2', name: 'Trial', nextBillingDate: '2026-11-05', trialEndDate: '2026-11-05' }),
      makeSub({ id: 's3', name: 'Gone', status: 'cancelled' }),
    ];
    const { ics, eventCount } = buildIcs(subs, {
      today: '2026-10-27', horizonDays: 100, reminderDaysBefore: 1, labels, prodId: '-//Test//EN',
      formatAmount: (a, c) => `${c} ${a}`, now: new Date('2026-10-27T00:00:00Z'),
    });
    expect(ics.startsWith('BEGIN:VCALENDAR\r\n')).toBe(true);
    expect(ics.endsWith('END:VCALENDAR\r\n')).toBe(true);
    expect(ics).toContain('DTSTART;VALUE=DATE:20261130');
    expect(ics).toContain('DTSTART;VALUE=DATE:20261231');
    expect(ics).toContain('DTSTART;VALUE=DATE:20270131');
    expect(ics).toContain('SUMMARY:Music\\, Family payment HKD 10');
    expect(ics).toContain('UID:s2-trial-20261105@subspend');
    expect(ics).not.toContain('Gone');
    // s1: Oct 31, Nov 30, Dec 31, Jan 31 (horizon Feb 4) = 4; s2: Nov 5, Dec 5, Jan 5 + trial = 4
    expect(eventCount).toBe(8);
    expect((ics.match(/BEGIN:VEVENT/g) ?? []).length).toBe(8);
    expect(ics).toContain('DTSTAMP:20261027T000000Z');
  });
});

describe('csv', () => {
  it('quotes and neutralises formulas', () => {
    expect(csvCell('plain')).toBe('plain');
    expect(csvCell('a,b')).toBe('"a,b"');
    expect(csvCell('say "hi"')).toBe('"say ""hi"""');
    expect(csvCell('=HYPERLINK("x")')).toBe(`"'=HYPERLINK(""x"")"`);
    expect(csvCell('-5')).toBe('-5');
    expect(csvCell(undefined)).toBe('');
  });
  it('exports a header and one row per subscription', () => {
    const csv = subscriptionsToCsv([makeSub({ name: '網飛', split: { people: 4, mode: 'equal' }, price: 100 })]);
    const lines = csv.replace('﻿', '').trim().split('\r\n');
    expect(lines).toHaveLength(2);
    expect(lines[0]).toContain('next_billing_date');
    expect(lines[1]).toContain('網飛');
    expect(lines[1]).toContain(',25,');
  });
});
