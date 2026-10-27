/**
 * Pre-renders every route to static HTML after `vite build`:
 *   dist/index.html, dist/zh-hk/index.html, dist/guides/<slug>/index.html, …
 * plus 404.html, sitemap.xml and robots.txt.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');
const ssr = await import(pathToFileURL(path.join(root, 'dist-ssr', 'entry-server.js')).href);
const template = await fs.readFile(path.join(dist, 'index.html'), 'utf8');
const manifest = JSON.parse(await fs.readFile(path.join(dist, '.vite', 'manifest.json'), 'utf8'));

/** Collect a chunk and its static imports for <link rel="modulepreload">. */
function preloadsFor(sources) {
  const files = new Set();
  const visit = (key) => {
    const entry = manifest[key];
    if (!entry || files.has(entry.file)) return;
    files.add(entry.file);
    for (const imp of entry.imports ?? []) visit(imp);
  };
  for (const src of sources) {
    if (!manifest[src]) throw new Error(`Prerender: ${src} not found in Vite manifest`);
    visit(src);
  }
  // The main entry chunk is already loaded by the <script> tag.
  const entryFile = manifest['index.html']?.file;
  files.delete(entryFile);
  return [...files].map((f) => `<link rel="modulepreload" crossorigin href="/${f}" />`).join('\n    ');
}

function fillTemplate(page) {
  return template
    .replace('<html lang="en">', `<html lang="${page.lang}">`)
    .replace('<!--app-head-->', `${page.head}\n    ${preloadsFor(page.sources)}`)
    .replace('<!--app-html-->', page.html);
}

const pages = await ssr.renderAll();
for (const page of pages) {
  const out = path.join(dist, page.url, 'index.html');
  await fs.mkdir(path.dirname(out), { recursive: true });
  await fs.writeFile(out, fillTemplate(page));
}
const notFound = await ssr.renderNotFound();
await fs.writeFile(path.join(dist, '404.html'), fillTemplate(notFound));
await fs.writeFile(path.join(dist, 'sitemap.xml'), ssr.sitemapXml());
await fs.writeFile(path.join(dist, 'robots.txt'), ssr.robotsTxt());

const info = ssr.buildInfo;
console.log(`Pre-rendered ${pages.length} pages + 404.html for ${info.siteUrl}`);
if (info.siteUrl.includes('example.com')) console.warn('⚠  VITE_SITE_URL is still the placeholder (example.com).');
if (!info.adsEnabled) console.warn('ℹ  AdSense disabled (placeholder publisher ID) — no ad code will load.');
await fs.rm(path.join(root, 'dist-ssr'), { recursive: true, force: true });

// ads.txt: substitute the real publisher ID when one is configured.
if (info.adsEnabled) {
  const pub = info.adsenseClient.replace(/^ca-/, '');
  await fs.writeFile(path.join(dist, 'ads.txt'), `google.com, ${pub}, DIRECT, f08c47fec0942fa0\n`);
  console.log(`ads.txt written for ${pub}`);
}
