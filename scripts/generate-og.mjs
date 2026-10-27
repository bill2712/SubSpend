/**
 * Generates Open Graph images (1200×630) and PNG app icons into public/.
 * Uses Playwright's Chromium. Run manually after changing the brand name or
 * guide titles:  npm run og   (outputs are committed; builds don't need Chromium)
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const out = path.join(root, 'public');

// Keep in sync with src/config/site.ts and src/content/guides/meta.ts
const SITE = process.env.SITE_NAME || 'SubSpend';
const meta = await fs.readFile(path.join(root, 'src/content/guides/meta.ts'), 'utf8');
const titles = { en: {}, 'zh-HK': {} };
for (const [, locale, block] of meta.matchAll(/(en|'zh-HK'): \{([\s\S]*?)\n  \},/g)) {
  for (const [, slug, title] of block.matchAll(/'([a-z-]+)': \{\s*title: '([^']+)'/g)) titles[locale.replace(/'/g, '')][slug] = title;
}

const tagline = { en: 'Free, private subscription tracker', 'zh-HK': '免費、私密的訂閱追蹤工具' };
const privacy = { en: 'Your data never leaves your browser', 'zh-HK': '你的資料從不離開你的瀏覽器' };
const logo = `<svg viewBox="0 0 32 32" width="88" height="88"><rect width="32" height="32" rx="9" fill="#0f6a58"/><path d="M9 17.5a7 7 0 1 1 11.9 5" fill="none" stroke="#aeead5" stroke-width="3" stroke-linecap="round"/><path d="M16 9v8l4.5 2.6" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

const card = (title, sub, locale) => `<!doctype html><html><head><meta charset="utf-8"><style>
  *{margin:0;box-sizing:border-box} body{width:1200px;height:630px;font-family:system-ui,-apple-system,"Segoe UI","Noto Sans CJK TC","Noto Sans TC",sans-serif;
  background:linear-gradient(135deg,#062722 0%,#0f5448 55%,#12846b 100%);color:#fff;padding:72px;display:flex;flex-direction:column;justify-content:space-between}
  .brand{display:flex;align-items:center;gap:22px;font-size:44px;font-weight:700}
  h1{font-size:${title.length > 40 ? 62 : 72}px;line-height:1.12;font-weight:800;max-width:1020px;letter-spacing:${locale === 'en' ? '-1px' : '0'}}
  .sub{font-size:30px;color:#aeead5;display:flex;gap:14px;align-items:center}
  .pill{background:rgba(255,255,255,.12);border:1px solid rgba(255,255,255,.25);border-radius:999px;padding:10px 22px}
</style></head><body><div class="brand">${logo}<span>${SITE}</span></div><h1>${title}</h1><div class="sub"><span class="pill">🔒 ${privacy[locale]}</span><span>${sub}</span></div></body></html>`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
await fs.mkdir(path.join(out, 'og'), { recursive: true });
for (const locale of ['en', 'zh-HK']) {
  await page.setContent(card(locale === 'en' ? 'How much do your subscriptions really cost?' : '你的訂閱其實每月花多少錢？', tagline[locale], locale));
  await page.screenshot({ path: path.join(out, 'og', `default-${locale}.png`) });
  for (const [slug, title] of Object.entries(titles[locale])) {
    await page.setContent(card(title, tagline[locale], locale));
    await page.screenshot({ path: path.join(out, 'og', `${slug}-${locale}.png`) });
  }
}
// App icons
for (const [file, size] of [['apple-touch-icon.png', 180], ['icon-512.png', 512]]) {
  await page.setViewportSize({ width: size, height: size });
  await page.setContent(`<html><body style="margin:0;background:#0f6a58">${logo.replace('width="88" height="88"', `width="${size}" height="${size}"`).replace('rx="9"', 'rx="0"')}</body></html>`);
  await page.screenshot({ path: path.join(out, file) });
}
await browser.close();
console.log('Generated OG images:', (await fs.readdir(path.join(out, 'og'))).length, '+ icons');
