import { describe, expect, it } from 'vitest';
import { buildSubscription, emptyForm, formFromSubscription, withAutoDate, type FormState } from './form';
import { searchCatalog } from './catalogSearch';

const today = '2026-10-27';

describe('subscription form', () => {
  it('builds a minimal subscription from name + price', () => {
    const form = { ...emptyForm('HKD', today), name: 'Spotify', price: '58', catalogId: 'spotify', category: 'music' as const };
    const { sub, errors } = buildSubscription(form, undefined, today);
    expect(errors).toEqual({});
    expect(sub).toMatchObject({ name: 'Spotify', price: 58, currency: 'HKD', cycle: 'monthly', nextBillingDate: '2026-11-27', status: 'active' });
  });

  it('reports field errors', () => {
    const form = { ...emptyForm('HKD', today), name: ' ', price: 'abc', paymentMethod: '4111 1111 1111 1111' };
    const { sub, errors } = buildSubscription(form, undefined, today);
    expect(sub).toBeUndefined();
    expect(errors).toMatchObject({ name: 'name', price: 'price', paymentMethod: 'card' });
  });

  it('validates splits and custom cycles', () => {
    const base = { ...emptyForm('HKD', today), name: 'X', price: '100' };
    expect(buildSubscription({ ...base, shared: true, people: '0' }, undefined, today).errors.people).toBe('people');
    expect(buildSubscription({ ...base, shared: true, splitMode: 'fixed', splitValue: '150' }, undefined, today).errors.splitValue).toBe('fixed');
    expect(buildSubscription({ ...base, cycle: 'custom', customCount: '0' }, undefined, today).errors.customCount).toBe('count');
    const ok = buildSubscription({ ...base, shared: true, people: '3', splitMode: 'percent', splitValue: '25' }, undefined, today).sub;
    expect(ok?.split).toEqual({ people: 3, mode: 'percent', value: 25 });
  });

  it('auto-updates the next billing date until the user edits it', () => {
    let form: FormState = { ...emptyForm('HKD', today), cycle: 'yearly' };
    form = withAutoDate(form, today);
    expect(form.nextBillingDate).toBe('2027-10-27');
    form = withAutoDate({ ...form, trial: true, trialEndDate: '2026-11-03' }, today);
    expect(form.nextBillingDate).toBe('2026-11-03');
    form = withAutoDate({ ...form, nextTouched: true, nextBillingDate: '2026-12-01', cycle: 'weekly' }, today);
    expect(form.nextBillingDate).toBe('2026-12-01');
  });

  it('round-trips an existing subscription and records cancellation', () => {
    const { sub } = buildSubscription({ ...emptyForm('USD', today), name: 'Y', price: '9.99', cycle: 'yearly' }, undefined, today);
    const form = formFromSubscription(sub!, today);
    const edited = buildSubscription({ ...form, status: 'cancelled', cancelledAt: '2026-10-20' }, sub, today).sub!;
    expect(edited.id).toBe(sub!.id);
    expect(edited.createdAt).toBe(sub!.createdAt);
    expect(edited).toMatchObject({ status: 'cancelled', cancelledAt: '2026-10-20', price: 9.99 });
  });
});

describe('catalog search', () => {
  it('ranks prefix matches first and matches aliases and Chinese names', () => {
    expect(searchCatalog('net')[0]?.id).toBe('netflix');
    expect(searchCatalog('spot')[0]?.id).toBe('spotify');
    expect(searchCatalog('office').map((i) => i.id)).toContain('microsoft-365');
    expect(searchCatalog('寬頻').map((i) => i.id)).toContain('home-broadband');
    expect(searchCatalog('zzzz')).toEqual([]);
    expect(searchCatalog('').length).toBeGreaterThan(55);
  });
});
