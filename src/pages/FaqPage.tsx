import { ChevronDown } from 'lucide-react';
import { useI18n } from '../i18n';
import type { FaqEntry } from '../seo';
import type { PageProps } from '../routes';

/** FAQ answers are plain text so the same strings feed the FAQPage JSON-LD. */
export default function FaqPage({ content }: PageProps<FaqEntry[]>) {
  const { m, t } = useI18n();
  return (
    <div className="mx-auto max-w-3xl px-4 pt-10 sm:px-6 sm:pt-14">
      <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl dark:text-white">{m.pages.faqTitle}</h1>
      <div className="mt-8 divide-y divide-slate-200 rounded-2xl border border-slate-200 bg-white dark:divide-slate-800 dark:border-slate-800 dark:bg-slate-900">
        {content.map((f, i) => (
          <details key={i} className="group p-5" open={i < 2}>
            <summary className="flex cursor-pointer list-none items-start justify-between gap-4 font-semibold text-slate-900 dark:text-white [&::-webkit-details-marker]:hidden">
              <h2 className="text-base">{t(f.q)}</h2>
              <ChevronDown className="mt-0.5 h-5 w-5 shrink-0 text-slate-400 transition-transform group-open:rotate-180" aria-hidden />
            </summary>
            <div className="mt-3 space-y-3 text-slate-700 dark:text-slate-300">
              {t(f.a)
                .split('\n\n')
                .map((para, j) => (
                  <p key={j}>{para}</p>
                ))}
            </div>
          </details>
        ))}
      </div>
    </div>
  );
}
