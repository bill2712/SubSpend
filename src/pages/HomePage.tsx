import { ArrowRight } from 'lucide-react';
import { AD_SLOTS } from '../config/site';
import { AdSlot } from '../components/AdSlot';
import { useI18n } from '../i18n';
import { TrackerApp } from '../tracker/TrackerApp';
import { GUIDE_META, GUIDE_SLUGS } from '../content/guides/meta';
import type { HomeContent } from '../content/types';
import type { PageProps } from '../routes';

export default function HomePage({ content }: PageProps<HomeContent>) {
  const { m, href, locale } = useI18n();
  return (
    <>
      <TrackerApp />

      {/* Ad sits below the whole tool, separated from every input and button. */}
      <div className="mx-auto mt-12 max-w-6xl px-4 sm:px-6">
        <AdSlot slot={AD_SLOTS.belowDashboard} minHeight={250} />
      </div>

      <article className="mx-auto mt-12 max-w-3xl px-4 sm:px-6" aria-labelledby="explainer-title">
        <h2 id="explainer-title" className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-white">
          {content.title}
        </h2>
        <div className="prose-content mt-6">{content.body}</div>
      </article>

      <section className="mx-auto mt-16 max-w-6xl px-4 sm:px-6" aria-labelledby="home-guides">
        <div className="flex items-baseline justify-between gap-4">
          <h2 id="home-guides" className="text-xl font-semibold text-slate-900 dark:text-white">
            {m.nav.guides}
          </h2>
          <a href={href('/guides/')} className="text-sm font-medium text-brand-800 hover:underline dark:text-brand-300">
            {m.common.allGuides} <ArrowRight className="inline h-4 w-4" aria-hidden />
          </a>
        </div>
        <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {GUIDE_SLUGS.map((slug) => (
            <li key={slug}>
              <a
                href={href(`/guides/${slug}/`)}
                className="block h-full rounded-2xl border border-slate-200 bg-white p-5 transition-shadow hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
              >
                <span className="text-xs font-semibold uppercase tracking-wide text-brand-800 dark:text-brand-300">{GUIDE_META[locale][slug].kicker}</span>
                <span className="mt-2 block font-semibold text-slate-900 dark:text-white">{GUIDE_META[locale][slug].title}</span>
              </a>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
