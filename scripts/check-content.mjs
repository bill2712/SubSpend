/**
 * Post-build content checks (run by `npm run check`):
 *  - home explainer ≥ 600 words, each guide ≥ 900 words (English);
 *    Chinese pages are measured in CJK characters (≥ 1,000 / ≥ 1,500).
 *  - every page has a title, description, canonical and hreflang tags;
 *  - FAQ pages carry FAQPage structured data; guides carry Article data.
 */
import fs from 'node:fs';
import path from 'node:path';

const dist = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', 'dist');
const read = (p) => fs.readFileSync(path.join(dist, p, 'index.html'), 'utf8');
const strip = (html) => html.replace(/<script[\s\S]*?<\/script>/g, ' ').replace(/<[^>]+>/g, ' ').replace(/&[a-z#0-9]+;/g, ' ');
const words = (text) => (text.match(/[A-Za-z0-9’'-]+/g) ?? []).length;
const cjk = (text) => (text.match(/[㐀-鿿]/g) ?? []).length;

function articleText(html, startMarker, endMarker) {
  const start = html.indexOf(startMarker);
  const end = endMarker ? html.indexOf(endMarker, start) : -1;
  if (start < 0) throw new Error(`marker not found: ${startMarker}`);
  return strip(html.slice(start, end > 0 ? end : undefined));
}

const guides = fs.readdirSync(path.join(dist, 'guides')).filter((d) => fs.statSync(path.join(dist, 'guides', d)).isDirectory());
let failed = false;
const report = [];
const check = (label, n, min, unit) => {
  const ok = n >= min;
  if (!ok) failed = true;
  report.push(`${ok ? '✓' : '✗'} ${label.padEnd(52)} ${String(n).padStart(5)} ${unit} (min ${min})`);
};

for (const [prefix, isZh] of [['', false], ['zh-hk/', true]]) {
  const home = read(prefix);
  const homeText = articleText(home, 'id="explainer-title"', 'id="home-guides"');
  isZh ? check(`${prefix}home explainer`, cjk(homeText), 1000, 'chars') : check('home explainer', words(homeText), 600, 'words');
  for (const g of guides) {
    const html = read(`${prefix}guides/${g}`);
    const text = articleText(html, '<h1', 'id="sources"');
    isZh ? check(`${prefix}${g}`, cjk(text), 1500, 'chars') : check(g, words(text), 900, 'words');
    if (!html.includes('"@type":"Article"')) { failed = true; report.push(`✗ ${prefix}${g} missing Article JSON-LD`); }
  }
  if (!read(`${prefix}faq`).includes('"@type":"FAQPage"')) { failed = true; report.push(`✗ ${prefix}faq missing FAQPage JSON-LD`); }
}

// Head tags on every page.
const walk = (dir) => fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(dir, e.name)) : e.name === 'index.html' ? [path.join(dir, e.name)] : []));
for (const file of walk(dist)) {
  const html = fs.readFileSync(file, 'utf8');
  for (const needle of ['<title>', 'name="description"', 'rel="canonical"', 'hreflang="zh-HK"', 'hreflang="x-default"', 'og:image']) {
    if (!html.includes(needle)) { failed = true; report.push(`✗ ${path.relative(dist, file)} missing ${needle}`); }
  }
}
const titles = walk(dist).map((f) => fs.readFileSync(f, 'utf8').match(/<title>(.*?)<\/title>/)?.[1]);
if (new Set(titles).size !== titles.length) { failed = true; report.push('✗ duplicate <title> values found'); }

console.log(report.join('\n'));
console.log(failed ? '\nContent check FAILED' : `\nContent check passed (${walk(dist).length} pages).`);
process.exit(failed ? 1 : 0);
