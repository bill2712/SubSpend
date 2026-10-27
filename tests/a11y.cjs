/**
 * Accessibility audit (axe-core, WCAG 2.1 AA) of every tracker state in light and dark mode.
 * Usage: npm run preview, then: npm run test:a11y
 * Requires: npm i -D playwright axe-core && npx playwright install chromium
 */
const { chromium } = require('playwright');
const fs = require('fs');
const axeSrc = fs.readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8');
const BASE = process.env.BASE_URL || 'http://localhost:4173';
async function audit(page, label) {
  await page.addScriptTag({ content: axeSrc });
  const r = await page.evaluate(async () => await window.axe.run(document, { runOnly: ['wcag2a', 'wcag2aa', 'wcag21aa', 'best-practice'] }));
  const v = r.violations.map((x) => `${x.impact} ${x.id}: ${x.nodes.length} — ${x.nodes.slice(0, 2).map((n) => n.target.join(' ')).join(' | ')}`);
  console.log(`${label}: ${v.length ? '\n  ' + v.join('\n  ') : 'no violations'}`);
  if (v.length) process.exitCode = 1;
}
(async () => {
  const browser = await chromium.launch();
  for (const scheme of ['light', 'dark']) {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, colorScheme: scheme });
    const page = await ctx.newPage();
    const errors = [];
    page.on('pageerror', (e) => errors.push(e.message));
    page.on('console', (m) => m.type() === 'error' && !m.text().includes('ERR_TUNNEL') && errors.push(m.text()));
    await page.goto(BASE + '/', { waitUntil: 'networkidle' });
    await audit(page, `${scheme} home empty`);
    await page.getByRole('button', { name: 'Explore with sample data' }).click();
    await page.waitForTimeout(400);
    await audit(page, `${scheme} home demo overview`);
    for (const tab of ['Subscriptions', 'Reminders & data', 'Settings']) {
      await page.getByRole('tab', { name: tab }).click();
      await page.waitForTimeout(200);
      await audit(page, `${scheme} tab ${tab}`);
    }
    await page.getByRole('button', { name: 'Add subscription' }).first().click();
    await page.waitForTimeout(200);
    await audit(page, `${scheme} add dialog search`);
    await page.keyboard.type('icloud');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(200);
    await page.getByRole('button', { name: 'Add subscription' }).last().click();
    await page.waitForTimeout(200);
    await audit(page, `${scheme} form with errors`);
    await page.keyboard.press('Escape');
    for (const u of ['/guides/', '/guides/how-to-cancel-subscriptions/', '/faq/', '/zh-hk/privacy/']) {
      await page.goto(BASE + u, { waitUntil: 'networkidle' });
      await audit(page, `${scheme} ${u}`);
    }
    console.log(`${scheme} page errors:`, errors.length ? errors : 'none');
    await ctx.close();
  }
  await browser.close();
  if (process.exitCode) console.log('Accessibility violations found');
})();
