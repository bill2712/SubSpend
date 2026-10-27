/**
 * Tiny i18n layer: locale routing helpers, message loading and a React
 * context with formatting helpers. No library needed for two locales.
 */
import { createContext, useContext, type ReactNode } from 'react';
import { SITE_NAME } from '../config/site';
import { fill, formatDate, formatMoney, formatNumber } from '../lib/format';
import type { ISODate } from '../lib/dates';
import type { Messages, PluralForms } from './en';

export type Locale = 'en' | 'zh-HK';
export const LOCALES: Locale[] = ['en', 'zh-HK'];
export const DEFAULT_LOCALE: Locale = 'en';

/** URL prefix per locale. English lives at the root. */
export const LOCALE_PREFIX: Record<Locale, string> = { en: '', 'zh-HK': '/zh-hk' };
/** BCP 47 tag used for Intl formatting. */
export const INTL_LOCALE: Record<Locale, string> = { en: 'en-HK', 'zh-HK': 'zh-HK' };
/** Value for <html lang> and hreflang. */
export const HREFLANG: Record<Locale, string> = { en: 'en', 'zh-HK': 'zh-HK' };
export const OG_LOCALE: Record<Locale, string> = { en: 'en_US', 'zh-HK': 'zh_HK' };

/** "/guides/" + zh-HK → "/zh-hk/guides/" */
export function localizedPath(locale: Locale, path: string): string {
  return `${LOCALE_PREFIX[locale]}${path}` || '/';
}

/** Split "/zh-hk/guides/x/" into locale + locale-less path, normalising the trailing slash. */
export function splitLocale(pathname: string): { locale: Locale; path: string } {
  let p = pathname.replace(/\/index\.html$/, '/').replace(/\/{2,}/g, '/');
  if (!p.endsWith('/')) p += '/';
  const lower = p.toLowerCase();
  if (lower === '/zh-hk/' || lower.startsWith('/zh-hk/')) return { locale: 'zh-HK', path: p.slice(6) || '/' };
  return { locale: 'en', path: p };
}

export async function loadMessages(locale: Locale): Promise<Messages> {
  return locale === 'zh-HK' ? (await import('./zh-HK')).zhHK : (await import('./en')).en;
}

export interface I18n {
  locale: Locale;
  m: Messages;
  intl: string;
  /** Interpolate {vars}; {site} is always available. */
  t: (template: string, vars?: Record<string, string | number>) => string;
  /** Pick the plural form for n and interpolate {n} plus vars. */
  p: (forms: PluralForms, n: number, vars?: Record<string, string | number>) => string;
  money: (amount: number, currency: string, compact?: boolean) => string;
  date: (iso: ISODate, style?: 'short' | 'medium' | 'long') => string;
  num: (n: number, digits?: number) => string;
  href: (path: string) => string;
}

export function createI18n(locale: Locale, m: Messages): I18n {
  const intl = INTL_LOCALE[locale];
  const rules = new Intl.PluralRules(intl);
  const t: I18n['t'] = (template, vars = {}) => fill(template, { site: SITE_NAME, ...vars });
  return {
    locale,
    m,
    intl,
    t,
    p: (forms, n, vars = {}) => t(rules.select(n) === 'one' ? forms.one : forms.other, { n: formatNumber(n, intl), ...vars }),
    money: (amount, currency, compact) => formatMoney(amount, currency, intl, { compact }),
    date: (iso, style) => formatDate(iso, intl, style),
    num: (n, digits) => formatNumber(n, intl, digits),
    href: (path) => localizedPath(locale, path),
  };
}

const I18nContext = createContext<I18n | null>(null);

export function I18nProvider({ value, children }: { value: I18n; children: ReactNode }) {
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18n {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used inside I18nProvider');
  return ctx;
}
