/**
 * Site-wide configuration. Values that differ per deployment come from
 * environment variables (see .env.example); everything else lives here.
 */

const env = import.meta.env;

/** Brand name. Change it here and it updates across UI strings and content. */
export const SITE_NAME = 'SubSpend';

/**
 * Path the site is served from: "/" normally, or e.g. "/SubSpend/" on GitHub
 * Pages project sites. Set with VITE_BASE_PATH at build time (see vite.config.ts).
 */
export const BASE_PATH: string = import.meta.env.BASE_URL || '/';

/** Prefix a root-relative path ("/guides/") with the base path. */
export function withBase(path: string): string {
  return `${BASE_PATH.replace(/\/+$/, '')}${path}`;
}

/** Public origin, no trailing slash. Used for canonical URLs, hreflang, sitemap. */
export const SITE_URL: string = (env.VITE_SITE_URL || 'https://example.com').replace(/\/+$/, '');

/** AdSense publisher ID. While it is the placeholder, no ad code is ever loaded. */
export const ADSENSE_CLIENT: string = env.VITE_ADSENSE_CLIENT || 'ca-pub-XXXXXXXXXXXXXXXX';

/** Ad unit slot IDs (create these in AdSense → Ads → By ad unit). */
export const AD_SLOTS = {
  belowDashboard: env.VITE_AD_SLOT_DASHBOARD || '0000000001',
  inArticle: env.VITE_AD_SLOT_ARTICLE || '0000000002',
  sidebar: env.VITE_AD_SLOT_SIDEBAR || '0000000003',
} as const;

export const ADS_ENABLED = /^ca-pub-\d{16}$/.test(ADSENSE_CLIENT);

export const BMC_URL: string = env.VITE_BMC_URL || 'https://buymeacoffee.com/YOUR_USERNAME';

export const CONTACT_EMAIL: string = env.VITE_CONTACT_EMAIL || 'hello@example.com';

/** Date shown as "last updated" on legal pages. Update when you edit them. */
export const LEGAL_LAST_UPDATED = '2026-10-27';

/** Prefix for every localStorage key, so the app never collides with others. */
export const STORAGE_PREFIX = 'subspend';
