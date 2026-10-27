/**
 * Route table. Each page is its own static HTML file (pre-rendered at build
 * time) and its own JS chunk, so a guide never downloads the tracker code and
 * vice versa. Paths are locale-less and always end with "/".
 */
import type { ComponentType } from 'react';
import type { Locale } from './i18n';
import { GUIDE_SLUGS, type GuideSlug } from './content/guides/meta';
import type { StaticPageId } from './content/pages';

type Mod = { default: unknown };
const pageModules = import.meta.glob<Mod>('./pages/*.tsx');
const contentModules = import.meta.glob<Mod>('./content/**/*.tsx');

export type RouteId = StaticPageId | 'guide';

export interface RouteDef {
  id: RouteId;
  path: string;
  slug?: GuideSlug;
  /** Page component file (key in pageModules). */
  page: string;
  /** Locale-specific content file, if any. */
  content?: (locale: Locale) => string;
}

const STATIC: { id: StaticPageId; path: string; page: string; content?: (l: Locale) => string }[] = [
  { id: 'home', path: '/', page: './pages/HomePage.tsx', content: (l) => `./content/home/${l}.tsx` },
  { id: 'guides', path: '/guides/', page: './pages/GuidesIndexPage.tsx' },
  { id: 'faq', path: '/faq/', page: './pages/FaqPage.tsx', content: (l) => `./content/pages/faq.${l}.tsx` },
  { id: 'about', path: '/about/', page: './pages/TextPage.tsx', content: (l) => `./content/pages/about.${l}.tsx` },
  { id: 'contact', path: '/contact/', page: './pages/TextPage.tsx', content: (l) => `./content/pages/contact.${l}.tsx` },
  { id: 'privacy', path: '/privacy/', page: './pages/TextPage.tsx', content: (l) => `./content/pages/privacy.${l}.tsx` },
  { id: 'terms', path: '/terms/', page: './pages/TextPage.tsx', content: (l) => `./content/pages/terms.${l}.tsx` },
  { id: 'disclaimer', path: '/disclaimer/', page: './pages/TextPage.tsx', content: (l) => `./content/pages/disclaimer.${l}.tsx` },
];

export const ROUTES: RouteDef[] = [
  ...STATIC,
  ...GUIDE_SLUGS.map((slug) => ({
    id: 'guide' as const,
    path: `/guides/${slug}/`,
    slug,
    page: './pages/GuidePage.tsx',
    content: (l: Locale) => `./content/guides/${l}/${slug}.tsx`,
  })),
];

export const NOT_FOUND: RouteDef = { id: 'notFound', path: '/404/', page: './pages/NotFoundPage.tsx' };

export function matchRoute(path: string): RouteDef | undefined {
  return ROUTES.find((r) => r.path === path);
}

export interface PageProps<C = unknown> {
  route: RouteDef;
  content: C;
}

/** Load page + content modules and return a ready-to-render component. */
export async function loadRoute(route: RouteDef, locale: Locale): Promise<{ Page: ComponentType; content: unknown }> {
  const pageLoader = pageModules[route.page];
  if (!pageLoader) throw new Error(`Missing page module ${route.page}`);
  const contentKey = route.content?.(locale);
  const contentLoader = contentKey ? contentModules[contentKey] : undefined;
  if (contentKey && !contentLoader) throw new Error(`Missing content module ${contentKey}`);
  const [pageMod, contentMod] = await Promise.all([pageLoader(), contentLoader?.()]);
  const PageComponent = pageMod.default as ComponentType<PageProps>;
  const content = contentMod?.default;
  const Page = () => <PageComponent route={route} content={content} />;
  return { Page, content };
}

/** Source files a route needs, relative to the project root (for modulepreload). */
export function routeSources(route: RouteDef, locale: Locale): string[] {
  const files = [route.page, route.content?.(locale)].filter((f): f is string => !!f);
  return files.map((f) => `src/${f.slice(2)}`);
}
