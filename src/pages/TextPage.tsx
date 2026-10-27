import { useI18n } from '../i18n';
import type { TextPageContent } from '../content/types';
import type { PageProps } from '../routes';

/** About, Contact, Privacy, Terms and Disclaimer pages. */
export default function TextPage({ content }: PageProps<TextPageContent>) {
  const { m, t, date } = useI18n();
  return (
    <article className="mx-auto max-w-3xl px-4 pt-10 sm:px-6 sm:pt-14">
      <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl dark:text-white">{t(content.title)}</h1>
      {content.updated && (
        <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
          <time dateTime={content.updated}>{t(m.common.updated, { date: date(content.updated) })}</time>
        </p>
      )}
      {content.lead && <p className="mt-4 text-lg text-slate-600 dark:text-slate-300">{t(content.lead)}</p>}
      <div className="prose-content mt-8">{content.body}</div>
    </article>
  );
}
