import { useI18n } from '../i18n';
import { buttonClass } from '../components/ui';

export default function NotFoundPage() {
  const { m, href } = useI18n();
  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center sm:px-6">
      <p className="text-sm font-semibold text-brand-800 dark:text-brand-300">404</p>
      <h1 className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">{m.notFound.title}</h1>
      <p className="mt-3 text-slate-600 dark:text-slate-400">{m.notFound.body}</p>
      <a href={href('/')} className={buttonClass('primary', 'lg', 'mt-8')}>
        {m.notFound.home}
      </a>
    </div>
  );
}
