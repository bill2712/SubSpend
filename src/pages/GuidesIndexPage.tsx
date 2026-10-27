import { useI18n } from '../i18n';
import { GUIDE_DATES, GUIDE_META, GUIDE_SLUGS } from '../content/guides/meta';

const INTRO = {
  en: {
    title: 'Subscription guides',
    lead: 'Independent, practical guides to keeping recurring costs under control. No sponsored content and no affiliate links — just general steps you can use with any service.',
  },
  'zh-HK': {
    title: '訂閱實用指南',
    lead: '獨立、實用的指南，助你控制定期開支。沒有贊助內容，也沒有聯盟連結——只有適用於任何服務的一般步驟。',
  },
} as const;

export default function GuidesIndexPage() {
  const { m, t, href, locale, date } = useI18n();
  const intro = INTRO[locale];
  return (
    <div className="mx-auto max-w-4xl px-4 pt-10 sm:px-6 sm:pt-14">
      <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl dark:text-white">{intro.title}</h1>
      <p className="mt-3 max-w-2xl text-lg text-slate-600 dark:text-slate-300">{intro.lead}</p>
      <ul className="mt-10 space-y-4">
        {GUIDE_SLUGS.map((slug) => {
          const g = GUIDE_META[locale][slug];
          return (
            <li key={slug}>
              <article className="rounded-2xl border border-slate-200 bg-white p-5 transition-shadow hover:shadow-md sm:p-6 dark:border-slate-800 dark:bg-slate-900">
                <p className="text-xs font-semibold uppercase tracking-wide text-brand-800 dark:text-brand-300">{g.kicker}</p>
                <h2 className="mt-2 text-xl font-semibold text-slate-900 dark:text-white">
                  <a href={href(`/guides/${slug}/`)} className="hover:underline">
                    {g.title}
                  </a>
                </h2>
                <p className="mt-2 text-slate-600 dark:text-slate-400">{g.description}</p>
                <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
                  {t(m.common.minutesRead, { n: GUIDE_DATES[slug].minutes })} · {t(m.common.updated, { date: date(GUIDE_DATES[slug].updated) })}
                </p>
              </article>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
