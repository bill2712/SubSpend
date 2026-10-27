/**
 * Builds everything that goes in <head> for a pre-rendered page: title,
 * description, canonical + hreflang alternates, Open Graph/Twitter tags and
 * JSON-LD structured data.
 */
import { SITE_NAME, SITE_URL } from './config/site';
import { HREFLANG, LOCALES, OG_LOCALE, localizedPath, type Locale } from './i18n';
import { GUIDE_DATES, GUIDE_META } from './content/guides/meta';
import { PAGE_META } from './content/pages';
import type { RouteDef } from './routes';

export interface FaqEntry {
  q: string;
  a: string;
}

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const site = (s: string) => s.replace(/\{site\}/g, SITE_NAME);
/** JSON for a <script> tag, safe against "</script>" injection. */
const jsonForScript = (v: unknown) => JSON.stringify(v).replace(/</g, '\\u003c');

export function absoluteUrl(path: string): string {
  return `${SITE_URL}${path}`;
}

export function pageTitleAndDescription(route: RouteDef, locale: Locale): { title: string; description: string } {
  if (route.id === 'guide' && route.slug) {
    const g = GUIDE_META[locale][route.slug];
    return { title: locale === 'zh-HK' ? `${g.title}｜${SITE_NAME}` : `${g.title} — ${SITE_NAME}`, description: g.description };
  }
  const meta = PAGE_META[locale][route.id as keyof (typeof PAGE_META)['en']];
  return { title: site(meta.title), description: site(meta.description) };
}

export function ogImage(route: RouteDef, locale: Locale): string {
  return absoluteUrl(route.id === 'guide' ? `/og/${route.slug}-${locale}.png` : `/og/default-${locale}.png`);
}

export function buildHead(route: RouteDef, locale: Locale, extra: { faq?: FaqEntry[] } = {}): string {
  const { title, description } = pageTitleAndDescription(route, locale);
  const isNotFound = route.id === 'notFound';
  const url = absoluteUrl(localizedPath(locale, route.path));
  const image = ogImage(route, locale);
  const tags: string[] = [
    `<title>${esc(title)}</title>`,
    `<meta name="description" content="${esc(description)}" />`,
  ];
  if (isNotFound) {
    tags.push('<meta name="robots" content="noindex" />');
  } else {
    tags.push(`<link rel="canonical" href="${url}" />`);
    for (const l of LOCALES) {
      tags.push(`<link rel="alternate" hreflang="${HREFLANG[l]}" href="${absoluteUrl(localizedPath(l, route.path))}" />`);
    }
    tags.push(`<link rel="alternate" hreflang="x-default" href="${absoluteUrl(localizedPath('en', route.path))}" />`);
  }
  tags.push(
    `<meta property="og:type" content="${route.id === 'guide' ? 'article' : 'website'}" />`,
    `<meta property="og:site_name" content="${esc(SITE_NAME)}" />`,
    `<meta property="og:title" content="${esc(title)}" />`,
    `<meta property="og:description" content="${esc(description)}" />`,
    `<meta property="og:url" content="${url}" />`,
    `<meta property="og:image" content="${image}" />`,
    '<meta property="og:image:width" content="1200" />',
    '<meta property="og:image:height" content="630" />',
    `<meta property="og:locale" content="${OG_LOCALE[locale]}" />`,
    ...LOCALES.filter((l) => l !== locale).map((l) => `<meta property="og:locale:alternate" content="${OG_LOCALE[l]}" />`),
    '<meta name="twitter:card" content="summary_large_image" />',
    `<meta name="twitter:title" content="${esc(title)}" />`,
    `<meta name="twitter:description" content="${esc(description)}" />`,
    `<meta name="twitter:image" content="${image}" />`,
  );

  for (const data of structuredData(route, locale, url, description, extra)) {
    tags.push(`<script type="application/ld+json">${jsonForScript(data)}</script>`);
  }
  return tags.join('\n    ');
}

function structuredData(
  route: RouteDef,
  locale: Locale,
  url: string,
  description: string,
  extra: { faq?: FaqEntry[] },
): object[] {
  const inLanguage = HREFLANG[locale];
  const org = { '@type': 'Organization', name: SITE_NAME, url: SITE_URL };
  const out: object[] = [];
  if (route.id === 'home') {
    out.push({
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      name: SITE_NAME,
      url,
      description,
      applicationCategory: 'FinanceApplication',
      operatingSystem: 'Any (web browser)',
      browserRequirements: 'Requires JavaScript and a modern web browser',
      inLanguage,
      isAccessibleForFree: true,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      publisher: org,
    });
  }
  if (route.id === 'guide' && route.slug) {
    const dates = GUIDE_DATES[route.slug];
    out.push({
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: GUIDE_META[locale][route.slug].title,
      description,
      inLanguage,
      datePublished: dates.published,
      dateModified: dates.updated,
      mainEntityOfPage: url,
      image: [ogImage(route, locale)],
      author: org,
      publisher: org,
    });
    out.push({
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: SITE_NAME, item: absoluteUrl(localizedPath(locale, '/')) },
        { '@type': 'ListItem', position: 2, name: locale === 'zh-HK' ? '實用指南' : 'Guides', item: absoluteUrl(localizedPath(locale, '/guides/')) },
        { '@type': 'ListItem', position: 3, name: GUIDE_META[locale][route.slug].title, item: url },
      ],
    });
  }
  if (route.id === 'faq' && extra.faq?.length) {
    out.push({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      inLanguage,
      mainEntity: extra.faq.map((f) => ({
        '@type': 'Question',
        name: site(f.q),
        acceptedAnswer: { '@type': 'Answer', text: site(f.a) },
      })),
    });
  }
  return out;
}
