import { Fragment } from 'react';
import { ExternalLink } from 'lucide-react';
import { AD_SLOTS } from '../config/site';
import { AdSlot } from '../components/AdSlot';
import { useI18n } from '../i18n';
import { GUIDE_DATES, GUIDE_META } from '../content/guides/meta';
import type { GuideContent } from '../content/types';
import type { PageProps } from '../routes';

export default function GuidePage({ route, content }: PageProps<GuideContent>) {
  const { m, t, href, locale, date } = useI18n();
  const slug = route.slug!;
  const meta = GUIDE_META[locale][slug];
  const dates = GUIDE_DATES[slug];

  return (
    <div className="mx-auto max-w-6xl px-4 pt-8 sm:px-6 sm:pt-12">
      <nav aria-label={m.pages.breadcrumb} className="text-sm text-slate-500 dark:text-slate-400">
        <ol className="flex flex-wrap gap-1.5">
          <li>
            <a href={href('/')} className="hover:underline">
              {m.nav.tracker}
            </a>{' '}
            /
          </li>
          <li>
            <a href={href('/guides/')} className="hover:underline">
              {m.nav.guides}
            </a>{' '}
            /
          </li>
          <li aria-current="page" className="text-slate-700 dark:text-slate-300">
            {meta.kicker}
          </li>
        </ol>
      </nav>

      <div className="mt-6 grid gap-12 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <article>
          <header>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl dark:text-white">{meta.title}</h1>
            <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
              <time dateTime={dates.updated}>{t(m.common.updated, { date: date(dates.updated, 'medium') })}</time> ·{' '}
              {t(m.common.minutesRead, { n: dates.minutes })}
            </p>
          </header>
          <div className="prose-content mt-8">
            {content.intro}
            {content.sections.map((s, i) => (
              <Fragment key={s.id}>
                <h2 id={s.id}>{s.title}</h2>
                {s.body}
                {/* In-article ad after the second section, between paragraphs only. */}
                {i === 1 && <AdSlot slot={AD_SLOTS.inArticle} minHeight={280} format="fluid" layout="in-article" className="!my-10" />}
              </Fragment>
            ))}
            <h2 id="sources">{m.common.sources}</h2>
            <ul className="text-base">
              {content.sources.map((src) => (
                <li key={src.url}>
                  <a href={src.url} target="_blank" rel="noopener noreferrer">
                    {src.label}
                    <ExternalLink className="ml-1 inline h-3.5 w-3.5" aria-hidden />
                    <span className="sr-only">{m.common.newWindow}</span>
                  </a>{' '}
                  — {src.publisher}
                </li>
              ))}
            </ul>
            <p className="callout text-sm">{t(m.footer.disclaimer)}</p>
          </div>

          <section aria-labelledby="related" className="mt-12">
            <h2 id="related" className="text-lg font-semibold text-slate-900 dark:text-white">
              {m.common.related}
            </h2>
            <ul className="mt-3 grid gap-3 sm:grid-cols-2">
              {content.related.map((r) => (
                <li key={r}>
                  <a href={href(`/guides/${r}/`)} className="block rounded-xl border border-slate-200 bg-white p-4 font-medium text-slate-900 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:text-white">
                    {GUIDE_META[locale][r].title}
                  </a>
                </li>
              ))}
            </ul>
          </section>
        </article>

        <aside className="hidden lg:block">
          <div className="sticky top-24 space-y-8">
            <nav aria-labelledby="toc-title" className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
              <h2 id="toc-title" className="text-sm font-semibold text-slate-900 dark:text-white">
                {m.common.onThisPage}
              </h2>
              <ol className="mt-3 space-y-2 text-sm">
                {content.sections.map((s) => (
                  <li key={s.id}>
                    <a href={`#${s.id}`} className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white">
                      {s.title}
                    </a>
                  </li>
                ))}
              </ol>
              <a
                href={href('/')}
                className="mt-5 block rounded-xl bg-brand-700 px-4 py-2.5 text-center text-sm font-semibold text-white hover:bg-brand-800 dark:bg-brand-500 dark:text-slate-950"
              >
                {m.nav.tracker} →
              </a>
            </nav>
            {/* Desktop sidebar ad (hidden below lg via the parent). */}
            <AdSlot slot={AD_SLOTS.sidebar} minHeight={600} format="vertical" />
          </div>
        </aside>
      </div>
    </div>
  );
}
