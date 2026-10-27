import type { Subscription } from './types';

/** Build a subscription for tests with sensible defaults. */
export function makeSub(over: Partial<Subscription> = {}): Subscription {
  return {
    id: over.id ?? Math.random().toString(36).slice(2),
    name: 'Test',
    category: 'streaming',
    price: 100,
    currency: 'HKD',
    cycle: 'monthly',
    nextBillingDate: '2026-11-01',
    status: 'active',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...over,
  };
}
