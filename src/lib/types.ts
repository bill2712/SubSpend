import type { Category } from '../config/catalog';
import type { CurrencyCode } from '../config/currencies';
import type { ISODate } from './dates';

export type CycleKind = 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'custom';
export type IntervalUnit = 'day' | 'week' | 'month' | 'year';

export interface Interval {
  count: number; // whole number ≥ 1
  unit: IntervalUnit;
}

export type SubscriptionStatus = 'active' | 'paused' | 'cancelled';

/** How a shared subscription is split. `people` includes you. */
export interface Split {
  people: number;
  mode: 'equal' | 'percent' | 'fixed';
  /** percent: your share 0-100. fixed: your amount in the subscription currency. */
  value?: number;
}

export interface Subscription {
  id: string;
  name: string;
  catalogId?: string;
  category: Category;
  /** Full price per billing cycle, in `currency`. */
  price: number;
  currency: CurrencyCode;
  cycle: CycleKind;
  /** Only used when cycle === 'custom'. */
  customInterval?: Interval;
  /** A known billing date; later dates are projected from it. */
  nextBillingDate: ISODate;
  trialEndDate?: ISODate;
  /** Free-text label like "Visa ending 1234". Never a full card number. */
  paymentMethod?: string;
  split?: Split;
  notes?: string;
  status: SubscriptionStatus;
  cancelledAt?: ISODate;
  pausedAt?: ISODate;
  createdAt: string;
  updatedAt: string;
}
