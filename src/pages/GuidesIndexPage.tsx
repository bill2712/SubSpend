import { useI18n } from '../i18n';
import { GUIDE_DATES, GUIDE_META, GUIDE_SLUGS } from '../content/guides/meta';

export default function GuidesIndexPage() {
  const { m, t, href, locale, date } = useI18n();
  return (
    <div className="mx-auto max-w-4xl px-4 pt-10 sm:px-6 sm:pt-14">
      <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl dark:text-white">{m.pages.guidesTitle}</h1>
      <p className="mt-3 max-w-2xl text-lg text-slate-600 dark:text-slate-300">{m.pages.guidesLead}</p>
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
