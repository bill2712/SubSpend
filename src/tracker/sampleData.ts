/**
 * Demo data so first-time visitors can see the dashboard immediately.
 * Generic names and made-up round prices on purpose: these are NOT quotes
 * for any real service. Dates are relative to today.
 */
import { addDays, addMonths, type ISODate } from '../lib/dates';
import type { Subscription } from '../lib/types';
import type { Category } from '../config/catalog';
import type { CurrencyCode } from '../config/currencies';
import { DEFAULT_SETTINGS, type AppData } from '../lib/validation';

interface Sample {
  en: string;
  zh: string;
  category: Category;
  price: number;
  currency?: CurrencyCode;
  cycle: Subscription['cycle'];
  offset: number; // days from today to next billing
  extra?: Partial<Subscription>;
}

const SAMPLES: Sample[] = [
  { en: 'Video streaming (sample)', zh: '影視串流（示範）', category: 'streaming', price: 98, cycle: 'monthly', offset: 4, extra: { split: { people: 2, mode: 'equal' } } },
  { en: 'Music streaming family plan (sample)', zh: '音樂串流家庭計劃（示範）', category: 'music', price: 128, cycle: 'monthly', offset: 12, extra: { split: { people: 4, mode: 'equal' }, notes: 'Family plan — collect shares on the 1st' } },
  { en: 'Cloud storage 2 TB (sample)', zh: '雲端儲存 2 TB（示範）', category: 'cloud', price: 780, cycle: 'yearly', offset: 63 },
  { en: 'AI assistant (sample)', zh: 'AI 助手（示範）', category: 'ai', price: 20, currency: 'USD', cycle: 'monthly', offset: 9 },
  { en: 'Mobile plan (sample)', zh: '手機月費計劃（示範）', category: 'telecom', price: 168, cycle: 'monthly', offset: 18, extra: { paymentMethod: 'Visa ending 1234' } },
  { en: 'Gym membership (sample)', zh: '健身室會籍（示範）', category: 'fitness', price: 450, cycle: 'monthly', offset: 2 },
  { en: 'Photo editing app (sample)', zh: '相片編輯程式（示範）', category: 'software', price: 88, cycle: 'monthly', offset: 3, extra: { trialEndDate: '' } },
  { en: 'Game pass (sample)', zh: '遊戲會員（示範）', category: 'gaming', price: 300, cycle: 'quarterly', offset: 40, extra: { status: 'paused' } },
  { en: 'News app (sample)', zh: '新聞應用程式（示範）', category: 'news', price: 68, cycle: 'monthly', offset: 21, extra: { status: 'cancelled' } },
];

export function buildSampleData(today: ISODate, lang: 'en' | 'zh-HK'): AppData {
  const now = new Date().toISOString();
  const subscriptions: Subscription[] = SAMPLES.map((s, i) => {
    const sub: Subscription = {
      id: `sample-${i}`,
      name: lang === 'zh-HK' ? s.zh : s.en,
      category: s.category,
      price: s.price,
      currency: s.currency ?? 'HKD',
      cycle: s.cycle,
      nextBillingDate: addDays(today, s.offset),
      status: 'active',
      createdAt: now,
      updatedAt: now,
      ...s.extra,
    };
    if (s.extra && 'trialEndDate' in s.extra) sub.trialEndDate = addDays(today, s.offset); // trial ends in 3 days
    if (sub.status === 'cancelled') {
      sub.cancelledAt = addMonths(today, -4);
      sub.nextBillingDate = addDays(addMonths(today, -4), 10);
    }
    if (sub.status === 'paused') sub.pausedAt = addDays(today, -20);
    if (lang === 'zh-HK' && sub.notes) sub.notes = '家庭計劃——每月 1 號收取分攤費用';
    if (lang === 'zh-HK' && sub.paymentMethod) sub.paymentMethod = 'Visa 尾號 1234';
    return sub;
  });
  return { version: 1, subscriptions, settings: { ...DEFAULT_SETTINGS } };
}
