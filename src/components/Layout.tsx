import type { ReactNode } from 'react';
import { Coffee, Languages, Lock, Menu } from 'lucide-react';
import { useI18n, localizedPath, type Locale } from '../i18n';
import { BMC_URL, SITE_NAME } from '../config/site';
import { GUIDE_META, GUIDE_SLUGS } from '../content/guides/meta';
import type { RouteDef } from '../routes';
import { LogoMark } from './Logo';
import { ThemeToggle } from './ThemeToggle';
import { cx } from './ui';

export function Layout({ route, children }: { route: RouteDef; children: ReactNode }) {
  const { m, t, href, locale } = useI18n();
  const other: Locale = locale === 'en' ? 'zh-HK' : 'en';
  const otherPath = localizedPath(other, route.id === 'notFound' ? '/' : route.path);

  const nav = [
    { path: '/', label: m.nav.tracker, active: route.id === 'home' },
    { path: '/guides/', label: m.nav.guides, active: route.id === 'guides' || route.id === 'guide' },
    { path: '/faq/', label: m.nav.faq, active: route.id === 'faq' },
    { path: '/about/', label: m.nav.about, active: route.id === 'about' },
  ];

  return (
    <div className="flex min-h-dvh flex-col">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:text-slate-900 focus:shadow-lg"
      >
        {m.nav.skip}
      </a>
      <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/90 backdrop-blur dark:border-slate-800/80 dark:bg-slate-950/85">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-2 px-4 sm:px-6">
          <a href={href('/')} className="mr-auto flex items-center gap-2 rounded-lg font-semibold tracking-tight" aria-label={t(m.nav.home)}>
            <LogoMark />
            <span className="text-lg text-slate-900 dark:text-white">{SITE_NAME}</span>
          </a>
          <nav aria-label={m.nav.label} className="hidden md:block">
            <ul className="flex items-center gap-1">
              {nav.map((n) => (
                <li key={n.path}>
                  <a
                    href={href(n.path)}
                    aria-current={n.active ? 'page' : undefined}
                    className={cx(
                      'rounded-lg px-3 py-2 text-sm font-medium',
                      n.active
                        ? 'text-brand-800 dark:text-brand-300'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white',
                    )}
                  >
                    {n.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <a
            href={otherPath}
            hrefLang={other}
            lang={other}
            aria-label={m.meta.switchLabel}
            className="inline-flex h-10 items-center gap-1.5 rounded-lg px-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
          >
            <Languages className="h-4 w-4" aria-hidden />
            {m.meta.switchTo}
          </a>
          <ThemeToggle />
          {/* Mobile menu: a <details> disclosure works before (and without) JavaScript. */}
          <details className="group relative md:hidden">
            <summary
              className="inline-flex h-10 w-10 cursor-pointer list-none items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 [&::-webkit-details-marker]:hidden"
              aria-label={m.nav.menu}
            >
              <Menu className="h-5 w-5" aria-hidden />
            </summary>
            <nav
              aria-label={m.nav.label}
              className="absolute right-0 mt-2 w-56 rounded-xl border border-slate-200 bg-white p-2 shadow-lg dark:border-slate-800 dark:bg-slate-900"
            >
              <ul>
                {nav.map((n) => (
                  <li key={n.path}>
                    <a
                      href={href(n.path)}
                      aria-current={n.active ? 'page' : undefined}
                      className="block rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                    >
                      {n.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </details>
        </div>
      </header>

      <main id="main" className="flex-1" tabIndex={-1}>
        {children}
      </main>

      <footer className="mt-16 border-t border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900/60">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <a href={href('/')} className="flex items-center gap-2 font-semibold">
              <LogoMark className="h-7 w-7" />
              <span>{SITE_NAME}</span>
            </a>
            <p className="mt-3 max-w-sm text-sm text-slate-600 dark:text-slate-400">{m.footer.tagline}</p>
            <p className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-brand-800 dark:text-brand-300">
              <Lock className="h-4 w-4" aria-hidden />
              {m.tracker.privacyBadge}
            </p>
            <p className="mt-5">
              <a
                href={BMC_URL}
                target="_blank"
                rel="noopener"
                className="inline-flex items-center gap-2 rounded-lg text-sm font-medium text-slate-700 underline decoration-slate-300 underline-offset-4 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
              >
                <Coffee className="h-4 w-4" aria-hidden />
                {m.footer.coffee}
                <span className="sr-only">{m.common.newWindow}</span>
              </a>
            </p>
          </div>
          <nav aria-label={m.footer.learn}>
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white">{m.footer.learn}</h2>
            <ul className="mt-3 space-y-2 text-sm">
              {GUIDE_SLUGS.map((slug) => (
                <li key={slug}>
                  <a className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white" href={href(`/guides/${slug}/`)}>
                    {GUIDE_META[locale][slug].title}
                  </a>
                </li>
              ))}
              <li>
                <a className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white" href={href('/faq/')}>
                  {m.nav.faq}
                </a>
              </li>
            </ul>
          </nav>
          <nav aria-label={m.footer.legal}>
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white">{m.footer.legal}</h2>
            <ul className="mt-3 space-y-2 text-sm">
              {(['about', 'contact', 'privacy', 'terms', 'disclaimer'] as const).map((id) => (
                <li key={id}>
                  <a className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white" href={href(`/${id}/`)}>
                    {m.nav[id]}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
        <div className="border-t border-slate-200 dark:border-slate-800">
          <div className="mx-auto max-w-6xl space-y-2 px-4 py-6 text-xs leading-relaxed text-slate-600 sm:px-6 dark:text-slate-400">
            <p>{t(m.footer.disclaimer)}</p>
            <p suppressHydrationWarning>{t(m.footer.rights, { year: new Date().getFullYear() })}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
