/**
 * Form state ⇄ Subscription conversion and validation, kept pure so it can
 * be unit tested without rendering anything.
 */
import type { Category } from '../config/catalog';
import type { CurrencyCode } from '../config/currencies';
import { cycleToInterval, defaultNextBillingDate } from '../lib/billing';
import { isISODate, type ISODate } from '../lib/dates';
import type { CycleKind, IntervalUnit, Split, Subscription, SubscriptionStatus } from '../lib/types';
import { LIMITS, cleanText, looksLikeCardNumber, makeId, parseAmount } from '../lib/validation';

export interface FormState {
  name: string;
  catalogId?: string;
  category: Category;
  price: string;
  currency: CurrencyCode;
  cycle: CycleKind;
  customCount: string;
  customUnit: IntervalUnit;
  nextBillingDate: string;
  /** True once the user edited the date themselves (stops auto-updating it). */
  nextTouched: boolean;
  trial: boolean;
  trialEndDate: string;
  paymentMethod: string;
  shared: boolean;
  people: string;
  splitMode: Split['mode'];
  splitValue: string;
  notes: string;
  status: SubscriptionStatus;
  cancelledAt: string;
}

export type FormErrors = Partial<Record<'name' | 'price' | 'customCount' | 'nextBillingDate' | 'trialEndDate' | 'paymentMethod' | 'people' | 'splitValue' | 'cancelledAt', keyof ErrorMessages>>;

export interface ErrorMessages {
  name: string;
  price: string;
  date: string;
  count: string;
  people: string;
  percent: string;
  fixed: string;
  card: string;
}

export function emptyForm(currency: CurrencyCode, today: ISODate): FormState {
  return {
    name: '',
    category: 'other',
    price: '',
    currency,
    cycle: 'monthly',
    customCount: '2',
    customUnit: 'month',
    nextBillingDate: defaultNextBillingDate(cycleToInterval('monthly'), today),
    nextTouched: false,
    trial: false,
    trialEndDate: '',
    paymentMethod: '',
    shared: false,
    people: '2',
    splitMode: 'equal',
    splitValue: '',
    notes: '',
    status: 'active',
    cancelledAt: today,
  };
}

export function formFromSubscription(sub: Subscription, today: ISODate): FormState {
  return {
    name: sub.name,
    catalogId: sub.catalogId,
    category: sub.category,
    price: String(sub.price),
    currency: sub.currency,
    cycle: sub.cycle,
    customCount: String(sub.customInterval?.count ?? 2),
    customUnit: sub.customInterval?.unit ?? 'month',
    nextBillingDate: sub.nextBillingDate,
    nextTouched: true,
    trial: !!sub.trialEndDate,
    trialEndDate: sub.trialEndDate ?? '',
    paymentMethod: sub.paymentMethod ?? '',
    shared: !!sub.split && sub.split.people > 1,
    people: String(sub.split?.people ?? 2),
    splitMode: sub.split?.mode ?? 'equal',
    splitValue: sub.split?.value !== undefined ? String(sub.split.value) : '',
    notes: sub.notes ?? '',
    status: sub.status,
    cancelledAt: sub.cancelledAt ?? today,
  };
}

/** Keep the projected next billing date in sync with the cycle until the user edits it. */
export function withAutoDate(form: FormState, today: ISODate): FormState {
  if (form.nextTouched) return form;
  if (form.trial && isISODate(form.trialEndDate)) return { ...form, nextBillingDate: form.trialEndDate };
  const count = Number(form.customCount);
  const interval = cycleToInterval(form.cycle, Number.isInteger(count) && count >= 1 ? { count, unit: form.customUnit } : undefined);
  return { ...form, nextBillingDate: defaultNextBillingDate(interval, today) };
}

/**
 * Validate the form and build a Subscription. Returns error keys per field
 * (mapped to translated messages by the UI) when invalid.
 */
export function buildSubscription(
  form: FormState,
  base: Subscription | undefined,
  today: ISODate,
): { sub?: Subscription; errors: FormErrors } {
  const errors: FormErrors = {};
  const name = cleanText(form.name, LIMITS.nameMax);
  if (!name) errors.name = 'name';
  const price = parseAmount(form.price);
  if (price === null) errors.price = 'price';
  if (!isISODate(form.nextBillingDate)) errors.nextBillingDate = 'date';

  let customInterval: Subscription['customInterval'];
  if (form.cycle === 'custom') {
    const count = Number(form.customCount);
    if (!Number.isInteger(count) || count < 1 || count > LIMITS.customCountMax) errors.customCount = 'count';
    else customInterval = { count, unit: form.customUnit };
  }
  if (form.trial && !isISODate(form.trialEndDate)) errors.trialEndDate = 'date';
  const paymentMethod = cleanText(form.paymentMethod, LIMITS.paymentMax);
  if (looksLikeCardNumber(paymentMethod)) errors.paymentMethod = 'card';

  let split: Split | undefined;
  if (form.shared) {
    const people = Number(form.people);
    if (!Number.isInteger(people) || people < 1 || people > LIMITS.peopleMax) errors.people = 'people';
    else {
      split = { people, mode: form.splitMode };
      if (form.splitMode !== 'equal') {
        const value = parseAmount(form.splitValue);
        if (form.splitMode === 'percent' && (value === null || value > 100)) errors.splitValue = 'percent';
        else if (form.splitMode === 'fixed' && (value === null || (price !== null && value > price))) errors.splitValue = 'fixed';
        else if (value !== null) split.value = value;
      }
    }
  }
  if (form.status === 'cancelled' && !isISODate(form.cancelledAt)) errors.cancelledAt = 'date';

  if (Object.keys(errors).length > 0) return { errors };

  const now = new Date().toISOString();
  const sub: Subscription = {
    id: base?.id ?? makeId(),
    name,
    category: form.category,
    price: price!,
    currency: form.currency,
    cycle: form.cycle,
    nextBillingDate: form.nextBillingDate,
    status: form.status,
    createdAt: base?.createdAt ?? now,
    updatedAt: now,
  };
  if (form.catalogId) sub.catalogId = form.catalogId;
  if (customInterval) sub.customInterval = customInterval;
  if (form.trial) sub.trialEndDate = form.trialEndDate;
  if (paymentMethod) sub.paymentMethod = paymentMethod;
  if (split && split.people > 1) sub.split = split;
  const notes = cleanText(form.notes, LIMITS.notesMax);
  if (notes) sub.notes = notes;
  if (form.status === 'cancelled') sub.cancelledAt = form.cancelledAt;
  if (form.status === 'paused') sub.pausedAt = base?.pausedAt ?? today;
  return { sub, errors };
}
