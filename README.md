# SubSpend — free, private subscription tracker

A static website that shows people what they really spend on subscriptions.
**No backend, no accounts, no bank connections — all data stays in the browser (localStorage).**

- Tracker: catalog quick-add (~70 services, names only), custom entries, monthly/yearly totals,
  category donut + ranked bars, upcoming payments (30 days), free-trial alerts, money-saved counter,
  “this equals…” comparisons, split costs, multi-currency with daily cached rates + manual overrides.
- Reminders: `.ics` calendar export (primary) and optional browser notifications.
- Data: JSON backup/import, CSV export, clear-all, demo mode with sample data, corrupted-storage recovery.
- Content: 5 guides (EN ≥ 900 words, zh-HK ≥ 1,500 characters), home explainer, FAQ (FAQPage JSON-LD),
  About, Contact, Privacy, Terms, Disclaimer — in English and Traditional Chinese (Hong Kong).
- Monetisation: lazy-loaded AdSense `<AdSlot>`, auto-generated `ads.txt`, Buy Me a Coffee card + footer link.
- SEO: pre-rendered HTML for every page, unique titles/descriptions, canonical + hreflang, OG images,
  WebApplication / Article / BreadcrumbList / FAQPage structured data, sitemap.xml, robots.txt, llms.txt.

## Name ideas

“SubSpend” is a working name. Brandable alternatives (check trademarks and domains before choosing):

1. **Subtally** — “subscription tally”; short and clear.
2. **LoopLedger** — recurring payments (“loops”) in a ledger.
3. **Trimwise** — about trimming costs wisely.
4. **Renewlens** — a lens on what renews and when.
5. **Recurro** — from “recurring”; compact and international.

To rename, see [Renaming the site](#renaming-the-site).

## Tech stack and why

**Vite + React 19 + TypeScript + Tailwind CSS 4**, with a small custom pre-render step instead of Next.js.

The site needs no server features (no API routes, no ISR, no image service). A ~100-line pre-render script
(`scripts/prerender.mjs`) renders every route × locale with `react-dom/server` into static HTML, and each page
hydrates with only its own JS chunk. That keeps the runtime small (no framework router), the output fully
static for Vercel or Cloudflare Pages, and the build fast. Charts are hand-written SVG in a lazy-loaded chunk
(~2 KB gzipped) rather than a chart library; the AdSense script loads only when an ad slot nears the viewport.

Measured with Lighthouse (mobile, local production build): Performance 98–99, Accessibility 100,
Best Practices 100, SEO 100. axe-core reports no WCAG 2.1 AA violations in any tracker state, light or dark.

## Run locally

Requires Node 20+ (tested on Node 22).

```bash
npm install
npm run dev          # http://localhost:5173 (client-rendered; ad slots show dashed placeholders)
npm test             # unit tests (Vitest)
npm run build        # client build + SSR build + pre-render into dist/
npm run preview      # serve dist/ at http://localhost:4173
npm run check        # typecheck + tests + build + content checks (word counts, head tags, JSON-LD)
```

Browser tests (optional; need Playwright: `npm i -D playwright && npx playwright install chromium`), with
`npm run preview` running:

```bash
npm run test:e2e     # add/edit/delete/undo, corrupted storage, ICS/JSON/CSV export, import, clear
npm run test:a11y    # axe-core audit of every tracker state in light + dark mode
```

## Configuration

Copy `.env.example` to `.env` (or set these in your host’s dashboard). All are public build-time values.

| Variable | Purpose | Default (placeholder) |
| --- | --- | --- |
| `VITE_SITE_URL` | Canonical origin, no trailing slash | `https://example.com` |
| `VITE_ADSENSE_CLIENT` | AdSense publisher ID | `ca-pub-XXXXXXXXXXXXXXXX` (ads disabled) |
| `VITE_AD_SLOT_DASHBOARD` | Ad unit below the tracker | `0000000001` |
| `VITE_AD_SLOT_ARTICLE` | In-article unit (after a guide’s 2nd section) | `0000000002` |
| `VITE_AD_SLOT_SIDEBAR` | Desktop sidebar unit on guides | `0000000003` |
| `VITE_BMC_URL` | Buy Me a Coffee page | `https://buymeacoffee.com/YOUR_USERNAME` |
| `VITE_CONTACT_EMAIL` | Shown on Contact/Privacy/Terms | `hello@example.com` |

### AdSense

1. Set `VITE_ADSENSE_CLIENT=ca-pub-1234567890123456` (your 16-digit ID).
2. In AdSense → Ads → By ad unit, create three display units and set the `VITE_AD_SLOT_*` IDs.
3. Rebuild. The build then writes `dist/ads.txt` with your ID and adds the
   `<meta name="google-adsense-account">` verification tag. While the ID is the placeholder,
   **no ad code is loaded at all** and production builds render no ad boxes.

Placements (see `src/components/AdSlot.tsx`): below the whole tracker card (separated from every
input/button by the tracker’s footer note and spacing), in guides after the 2nd section, and in the desktop
guide sidebar. Each slot reserves its height to prevent layout shift.

### Buy Me a Coffee

Set `VITE_BMC_URL=https://buymeacoffee.com/<your-username>`. The card appears after the user adds their
3rd subscription or marks one as cancelled, never in demo mode, and stays hidden for 7 days after
“Not now”. The footer link is always present.

### Editing the service catalog

Edit `src/config/catalog.ts`. Each entry is `{ id, name, category }` with optional `aliases` (search
terms, old names, Chinese names) and `nameZh` (only for generic, non-brand entries). Categories:
`streaming, music, ai, cloud, gaming, news, fitness, software, telecom, other`.

**Do not add prices to the catalog.** Optional “typical price” hints go in `src/config/priceHints.ts`
and must include a region, plan, official source URL and `lastChecked` date; the UI labels them
approximate and hides hints older than 180 days. The file ships empty on purpose.

Other config: currencies (`src/config/currencies.ts`), fun comparisons (`src/config/comparisons.ts`),
site constants (`src/config/site.ts`).

### Translations

UI strings: `src/i18n/en.ts` and `src/i18n/zh-HK.ts` (TypeScript enforces identical keys).
Long-form content: `src/content/**` (`en` and `zh-HK` folders/files). Guide metadata and dates:
`src/content/guides/meta.ts`. Citations: `src/content/guides/sources.ts`.

### Renaming the site

1. `SITE_NAME` in `src/config/site.ts` (all UI and content use it).
2. `public/site.webmanifest` name/short_name.
3. Regenerate OG images and icons: `SITE_NAME="NewName" npm run og` (uses Playwright; commit the PNGs).
4. Keep `STORAGE_PREFIX` (and the `subspend:theme` key in `index.html`) unchanged, or existing users
   lose their saved data.

## Deploy

The output is plain static files in `dist/` (each page is `path/index.html`; URLs end with `/`).

**Vercel:** import the repo; `vercel.json` already sets the build command, output directory, trailing
slashes, cache headers for `/assets/*` and basic security headers. Add the env vars in Project Settings.

**Cloudflare Pages:** build command `npm run build`, output directory `dist`, environment variable
`NODE_VERSION=22` plus the `VITE_*` vars. `public/_headers` provides the same headers. Both hosts serve
`404.html` for unknown paths.

## Project structure

```
src/
  config/        site constants, catalog, currencies, price hints, comparisons
  lib/           pure, unit-tested logic: dates, billing, split, currency, insights, ics, csv, validation
  tracker/       tracker UI + hooks (storage, rates, notifications, demo data, form logic)
  components/    layout, AdSlot, dialog, UI primitives
  pages/         one component per page type
  content/       guides, home explainer, FAQ and legal pages (EN + zh-HK)
  i18n/          translation files and locale helpers
  seo.tsx        head tags + JSON-LD
  entry-client.tsx / entry-server.tsx / routes.tsx
scripts/         prerender, OG image generator, content checks
tests/           Playwright e2e + axe accessibility tests
```

Key behaviours, all covered by tests in `src/lib/*.test.ts` and `src/tracker/form.test.ts`:

- Cycle normalisation (weekly uses 365.2425 / 7 weeks per year).
- Next billing date: month-based cycles are always projected from the original anchor, so the 31st
  becomes Feb 28/29 and returns to Mar 31; Feb 29 yearly plans renew on Feb 28 in non-leap years.
- Split costs (equal / percent / fixed, cent-exact even splits).
- Currency conversion with manual pair overrides (incl. reverse pairs) and multiple rate sources.
- Trial alerts (upcoming, today, and recently ended).
- Money saved = billing dates strictly after cancellation up to today × your share.
- Corrupted localStorage: unreadable data is kept as a backup key and the app starts fresh; individual
  invalid entries are skipped and counted.

## Exchange rates

Fetched only when more than one currency is in use, at most once per 24 hours, with no personal data:
`open.er-api.com` (ExchangeRate-API open access — attribution link shown in Settings), falling back to
`@fawazahmed0/currency-api` via jsDelivr and Cloudflare Pages. Users can set manual rates (“1 USD = ? HKD”),
which also makes the app work offline.

---

## Checklist before applying for AdSense

**Placeholders to replace**

- [ ] `VITE_SITE_URL` → your real domain (the build warns while it is `example.com`).
- [ ] `VITE_ADSENSE_CLIENT` → your `ca-pub-…` ID; then confirm `https://yourdomain/ads.txt` shows it.
- [ ] `VITE_AD_SLOT_DASHBOARD`, `VITE_AD_SLOT_ARTICLE`, `VITE_AD_SLOT_SIDEBAR` → real ad unit IDs.
- [ ] `VITE_BMC_URL` → your Buy Me a Coffee username.
- [ ] `VITE_CONTACT_EMAIL` → an inbox you actually monitor.
- [ ] Brand name, if changing from “SubSpend” (see *Renaming the site*), and regenerate OG images.
- [ ] Privacy policy §6: name your actual host (Vercel or Cloudflare) if you want to be specific.
- [ ] `LEGAL_LAST_UPDATED` in `src/config/site.ts` and guide dates in `src/content/guides/meta.ts`.

**Before you apply**

- [ ] Deploy on your own domain (not a `*.vercel.app` / `*.pages.dev` subdomain) with HTTPS.
- [ ] Search for leftover placeholders: `grep -rn "example.com\|YOUR_USERNAME\|XXXXXXXX" dist/` returns nothing
      (other than `ads.txt` comments if ads are still disabled).
- [ ] Re-check every guide’s source links still resolve (`src/content/guides/sources.ts`).
- [ ] Add the site to Google Search Console, submit `https://yourdomain/sitemap.xml`, and check that
      pages are indexed and hreflang pairs are detected.
- [ ] In AdSense, add the site, then verify ownership (ads.txt and/or the meta tag are already emitted).
- [ ] In AdSense → Privacy & messaging, set up a Google-certified consent message (CMP) for the EEA,
      UK and Switzerland; the privacy policy already describes consent.
- [ ] Make sure every page is reachable from navigation (Guides, FAQ, About, Contact, Privacy, Terms,
      Disclaimer are linked in the header/footer).
- [ ] Consider adding more original guides over time; thin or duplicated content is a common rejection reason.
- [ ] After ads are live, re-run Lighthouse and confirm no ad sits next to forms or buttons on mobile.
- [ ] (Optional) Add verified “typical price” hints in `src/config/priceHints.ts` — only with sources and dates.
