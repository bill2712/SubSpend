/** Titles and meta descriptions for every non-guide page, per locale. */
import type { Locale } from '../i18n';

export type StaticPageId = 'home' | 'guides' | 'faq' | 'about' | 'contact' | 'privacy' | 'terms' | 'disclaimer' | 'notFound';

export const PAGE_META: Record<Locale, Record<StaticPageId, { title: string; description: string }>> = {
  en: {
    home: {
      title: '{site} — Free private subscription tracker',
      description:
        'See how much you really spend on subscriptions. Free, no sign-up, no bank connection — your data stays in your browser. Track renewals, free trials and shared plans.',
    },
    guides: {
      title: 'Subscription guides — {site}',
      description: 'Practical, independent guides to auditing, sharing, timing and cancelling subscriptions without surprise charges.',
    },
    faq: {
      title: 'Frequently asked questions — {site}',
      description: 'How {site} works, where your data is stored, how reminders and exchange rates work, and how to back up your list.',
    },
    about: {
      title: 'About — {site}',
      description: 'Why {site} exists, how it is built and how it is funded.',
    },
    contact: {
      title: 'Contact — {site}',
      description: 'How to get in touch about {site}: feedback, bug reports and corrections.',
    },
    privacy: {
      title: 'Privacy policy — {site}',
      description: 'What {site} stores (only in your browser), what third parties may receive, cookies, advertising and your choices.',
    },
    terms: {
      title: 'Terms of use — {site}',
      description: 'The terms that apply when you use {site}.',
    },
    disclaimer: {
      title: 'Disclaimer — {site}',
      description: '{site} provides general information, not financial advice, and is not affiliated with any listed service.',
    },
    notFound: { title: 'Page not found — {site}', description: 'This page does not exist.' },
  },
  'zh-HK': {
    home: {
      title: '{site}｜免費、私密的訂閱追蹤工具',
      description: '看看你在訂閱上真正花了多少錢。免費、無需登記、無需連接銀行——資料只留在你的瀏覽器。追蹤續期、免費試用及分攤計劃。',
    },
    guides: {
      title: '訂閱實用指南｜{site}',
      description: '獨立、實用的指南：檢視、分攤、選擇收費週期及取消訂閱，避免意外扣款。',
    },
    faq: {
      title: '常見問題｜{site}',
      description: '{site} 如何運作、資料儲存在哪裏、提醒及匯率如何運作，以及如何備份你的清單。',
    },
    about: { title: '關於我們｜{site}', description: '{site} 的成立原因、製作方式及營運資金來源。' },
    contact: { title: '聯絡我們｜{site}', description: '如何就 {site} 聯絡我們：意見、錯誤報告及更正。' },
    privacy: {
      title: '私隱政策｜{site}',
      description: '{site} 儲存甚麼（只在你的瀏覽器）、第三方可能收到甚麼、Cookie、廣告及你的選擇。',
    },
    terms: { title: '使用條款｜{site}', description: '使用 {site} 時適用的條款。' },
    disclaimer: {
      title: '免責聲明｜{site}',
      description: '{site} 只提供一般資訊，並非理財建議，亦與所列出的任何服務無關。',
    },
    notFound: { title: '找不到頁面｜{site}', description: '此頁面不存在。' },
  },
};
