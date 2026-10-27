/**
 * Guide metadata (small, shared by the guide index, sitemap and SEO tags).
 * The article bodies live in ./en/*.tsx and ./zh-HK/*.tsx and are loaded
 * only on their own page.
 */
import type { Locale } from '../../i18n';

export const GUIDE_SLUGS = [
  'how-to-audit-subscriptions',
  'avoid-free-trial-charges',
  'share-subscriptions-fairly',
  'monthly-vs-yearly-billing',
  'how-to-cancel-subscriptions',
] as const;

export type GuideSlug = (typeof GUIDE_SLUGS)[number];

export interface GuideMeta {
  title: string;
  description: string;
  /** Short label for cards. */
  kicker: string;
}

export const GUIDE_DATES: Record<GuideSlug, { published: string; updated: string; minutes: number }> = {
  'how-to-audit-subscriptions': { published: '2026-10-20', updated: '2026-10-27', minutes: 7 },
  'avoid-free-trial-charges': { published: '2026-10-20', updated: '2026-10-27', minutes: 7 },
  'share-subscriptions-fairly': { published: '2026-10-21', updated: '2026-10-27', minutes: 7 },
  'monthly-vs-yearly-billing': { published: '2026-10-22', updated: '2026-10-27', minutes: 7 },
  'how-to-cancel-subscriptions': { published: '2026-10-23', updated: '2026-10-27', minutes: 8 },
};

export const GUIDE_META: Record<Locale, Record<GuideSlug, GuideMeta>> = {
  en: {
    'how-to-audit-subscriptions': {
      title: 'How to audit your subscriptions in 15 minutes',
      description:
        'A step-by-step routine to find every recurring charge, total what you really pay and decide what to keep, downgrade or cancel — in about a quarter of an hour.',
      kicker: 'Audit',
    },
    'avoid-free-trial-charges': {
      title: 'Free trials: how to avoid surprise charges',
      description:
        'How free trials turn into paid subscriptions, what to check before you sign up, and simple habits that stop unwanted renewals.',
      kicker: 'Free trials',
    },
    'share-subscriptions-fairly': {
      title: 'How to share subscriptions fairly with family',
      description:
        'Family and group plans can cut costs, but only if the split feels fair. Practical ways to divide costs, handle money and avoid friction.',
      kicker: 'Sharing',
    },
    'monthly-vs-yearly-billing': {
      title: 'Monthly vs. yearly billing: when yearly is worth it',
      description:
        'Yearly plans often look cheaper per month. A simple break-even method to decide when paying upfront actually saves money — and when it doesn’t.',
      kicker: 'Billing cycles',
    },
    'how-to-cancel-subscriptions': {
      title: 'How to cancel subscriptions: general steps and what to watch for',
      description:
        'General steps for cancelling through app stores, websites and carriers, what to confirm before and after, and how to handle charges after cancelling.',
      kicker: 'Cancelling',
    },
  },
  'zh-HK': {
    'how-to-audit-subscriptions': {
      title: '15 分鐘檢視你的所有訂閱',
      description: '一套循序漸進的方法，找出每一項定期扣款、計算真正支出，並決定保留、降級還是取消——大約一刻鐘就能完成。',
      kicker: '檢視',
    },
    'avoid-free-trial-charges': {
      title: '免費試用：如何避免意外扣款',
      description: '免費試用如何變成付費訂閱、登記前要檢查甚麼，以及防止不想要的自動續期的簡單習慣。',
      kicker: '免費試用',
    },
    'share-subscriptions-fairly': {
      title: '如何與家人公平地分攤訂閱',
      description: '家庭及群組計劃可以節省開支，但前提是分攤方式讓大家都覺得公平。分攤費用、處理收款及避免爭拗的實用方法。',
      kicker: '分攤',
    },
    'monthly-vs-yearly-billing': {
      title: '月繳還是年繳：年費甚麼時候才划算？',
      description: '年費計劃按月計往往看似較便宜。用簡單的回本計算，判斷甚麼時候預繳一年真的能省錢，甚麼時候不能。',
      kicker: '收費週期',
    },
    'how-to-cancel-subscriptions': {
      title: '如何取消訂閱：一般步驟及注意事項',
      description: '經應用程式商店、網站及電訊商取消訂閱的一般步驟、取消前後要確認的事項，以及取消後仍被扣款時的處理方法。',
      kicker: '取消訂閱',
    },
  },
};
