/**
 * Server entry used only at build time by scripts/prerender.mjs.
 * Renders each route × locale to static HTML plus its <head> tags.
 */
import { StrictMode } from 'react';
import { renderToString } from 'react-dom/server';
import { App } from './App';
import { HREFLANG, LOCALES, createI18n, loadMessages, localizedPath, type Locale } from './i18n';
import { NOT_FOUND, ROUTES, loadRoute, routeSources, type RouteDef } from './routes';
import { buildHead, absoluteUrl, type FaqEntry } from './seo';
import { GUIDE_DATES, GUIDE_META, GUIDE_SLUGS } from './content/guides/meta';
import { SITE_NAME, SITE_URL, ADS_ENABLED, ADSENSE_CLIENT } from './config/site';

export interface RenderedPage {
  url: string;
  html: string;
  head: string;
  lang: string;
  sources: string[];
}

export async function renderPage(route: RouteDef, locale: Locale): Promise<RenderedPage> {
  const [{ Page, content }, messages] = await Promise.all([loadRoute(route, locale), loadMessages(locale)]);
  const html = renderToString(
    <StrictMode>
      <App i18n={createI18n(locale, messages)} route={route} Page={Page} />
    </StrictMode>,
  );
  const faq = route.id === 'faq' ? (content as FaqEntry[]) : undefined;
  return {
    url: localizedPath(locale, route.path),
    html,
    head: buildHead(route, locale, { faq }),
    lang: HREFLANG[locale],
    sources: routeSources(route, locale),
  };
}

export async function renderAll(): Promise<RenderedPage[]> {
  const pages: RenderedPage[] = [];
  for (const locale of LOCALES) for (const route of ROUTES) pages.push(await renderPage(route, locale));
  return pages;
}

export const renderNotFound = () => renderPage(NOT_FOUND, 'en');

export function sitemapXml(): string {
  const urls = ROUTES.flatMap((route) =>
    LOCALES.map((locale) => {
      const alternates = LOCALES.map(
        (l) => `    <xhtml:link rel="alternate" hreflang="${HREFLANG[l]}" href="${absoluteUrl(localizedPath(l, route.path))}"/>`,
      ).join('\n');
      const lastmod = route.slug ? GUIDE_DATES[route.slug].updated : undefined;
      return [
        '  <url>',
        `    <loc>${absoluteUrl(localizedPath(locale, route.path))}</loc>`,
        lastmod ? `    <lastmod>${lastmod}</lastmod>` : '',
        alternates,
        `    <xhtml:link rel="alternate" hreflang="x-default" href="${absoluteUrl(localizedPath('en', route.path))}"/>`,
        '  </url>',
      ]
        .filter(Boolean)
        .join('\n');
    }),
  );
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${urls.join('\n')}\n</urlset>\n`;
}

export function robotsTxt(): string {
  return `User-agent: *\nAllow: /\n\nSitemap: ${SITE_URL}/sitemap.xml\n`;
}

/** llms.txt (https://llmstxt.org): a Markdown index of the site for AI agents. */
export function llmsTxt(): string {
  const lines = [
    `# ${SITE_NAME}`,
    '',
    '> A free, private subscription tracker. All data stays in the browser (localStorage); there is no backend, account or bank connection.',
    '',
    '## Tool',
    `- [Subscription tracker](${absoluteUrl('/')}): add subscriptions, see monthly/yearly totals, upcoming payments, free-trial alerts; export .ics, JSON, CSV.`,
    `- [繁體中文版本](${absoluteUrl('/zh-hk/')})`,
    '',
    '## Guides',
    ...GUIDE_SLUGS.map((slug) => `- [${GUIDE_META.en[slug].title}](${absoluteUrl(`/guides/${slug}/`)}): ${GUIDE_META.en[slug].description}`),
    '',
    '## About',
    `- [FAQ](${absoluteUrl('/faq/')})`,
    `- [About](${absoluteUrl('/about/')})`,
    `- [Privacy policy](${absoluteUrl('/privacy/')})`,
    `- [Terms of use](${absoluteUrl('/terms/')})`,
    `- [Disclaimer](${absoluteUrl('/disclaimer/')})`,
    '',
  ];
  return lines.join('\n');
}

export const buildInfo = { siteUrl: SITE_URL, adsEnabled: ADS_ENABLED, adsenseClient: ADSENSE_CLIENT };
