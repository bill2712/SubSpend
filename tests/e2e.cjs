/**
 * End-to-end browser test of the tracker's data flows.
 * Usage: npm run build && npm run preview, then in another terminal: npm run test:e2e
 * Requires: npm i -D playwright && npx playwright install chromium
 */
const { chromium } = require('playwright');
const fs = require('fs');
const os = require('os');
const path = require('path');
const S = fs.mkdtempSync(path.join(os.tmpdir(), 'subspend-e2e-'));
const BASE = process.env.BASE_URL || 'http://localhost:4173';
const seen = (loc) => loc.waitFor({ timeout: 4000 }).then(() => true, () => false);
const ok = (c, msg) => { console.log(`${c ? '✓' : '✗'} ${msg}`); if (!c) process.exitCode = 1; };
(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 }, acceptDownloads: true });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => m.type() === 'error' && !m.text().includes('ERR_TUNNEL') && errors.push(m.text()));
  const base = BASE + '/';
  await page.goto(base);
  // 1. Corrupted storage
  await page.evaluate(() => localStorage.setItem('subspend:data:v1', '{not valid json'));
  await page.reload({ waitUntil: 'networkidle' });
  ok(await seen(page.getByText('We couldn’t read your saved data')), 'corrupt data banner shown');
  ok(await page.evaluate(() => Object.keys(localStorage).some((k) => k.startsWith('subspend:backup:'))), 'raw backup kept');
  await page.getByRole('button', { name: 'Dismiss' }).click();
  // Partially invalid data
  await page.evaluate(() => localStorage.setItem('subspend:data:v1', JSON.stringify({ version: 1, subscriptions: [
    { id: 'a', name: 'Valid', price: 50, currency: 'HKD', cycle: 'monthly', nextBillingDate: '2026-11-05', status: 'active' },
    { id: 'b', name: 'Broken', price: -3 } ] })));
  await page.reload({ waitUntil: 'networkidle' });
  ok(await seen(page.getByText('1 saved entry was invalid and was skipped.')), 'invalid entries skipped with notice');
  ok(await seen(page.getByText('HK$50.00').first()), 'valid entry loaded');
  // 2. Add a trial sub, mark one cancelled -> BMC
  await page.getByRole('button', { name: 'Add subscription' }).first().click();
  await page.keyboard.type('chatgpt'); await page.keyboard.press('Enter');
  await page.keyboard.type('20');
  await page.getByLabel('Currency').selectOption('USD');
  await page.getByRole('button', { name: 'Add subscription' }).last().click();
  await page.getByRole('tab', { name: 'Settings' }).click();
  await page.getByLabel('1 USD = ? HKD').fill('7.8');
  await page.getByLabel('1 USD = ? HKD').blur();
  await page.getByRole('tab', { name: 'Overview' }).click();
  ok(await seen(page.getByText('HK$206.00').first()), 'manual USD rate applied to monthly total (50 + 20×7.8)');
  await page.getByRole('tab', { name: 'Subscriptions' }).click();
  await page.getByRole('button', { name: 'Actions for Valid' }).click();
  await page.getByRole('button', { name: 'Mark as cancelled' }).click();
  await page.getByRole('tab', { name: 'Overview' }).click();
  ok(await seen(page.getByText('Found some savings?')), 'coffee card after cancelling');
  await page.getByRole('button', { name: 'Not now' }).click();
  await page.reload({ waitUntil: 'networkidle' });
  ok(!(await page.getByText('Found some savings?').isVisible()), 'coffee card dismissal remembered');
  // 3. Delete + undo
  await page.getByRole('tab', { name: 'Subscriptions' }).click();
  await page.getByRole('button', { name: 'Actions for ChatGPT' }).click();
  await page.getByRole('button', { name: 'Delete' }).click();
  ok(await seen(page.getByText('“ChatGPT” deleted.')), 'delete toast');
  await page.getByRole('button', { name: 'Undo' }).click();
  ok(await seen(page.getByText('ChatGPT', { exact: true })), 'undo restored');
  // 4. ICS export
  await page.getByRole('tab', { name: 'Reminders & data' }).click();
  const [ics] = await Promise.all([page.waitForEvent('download'), page.getByRole('button', { name: 'Download calendar file (.ics)' }).click()]);
  const icsText = fs.readFileSync(await ics.path(), 'utf8');
  ok(icsText.startsWith('BEGIN:VCALENDAR') && (icsText.match(/BEGIN:VEVENT/g) || []).length === 12, `ics has 12 monthly events (${(icsText.match(/BEGIN:VEVENT/g) || []).length})`);
  ok(icsText.includes('SUMMARY:ChatGPT payment (US$20.00)'), 'ics summary formatted');
  // 5. JSON export -> clear -> import
  const [json] = await Promise.all([page.waitForEvent('download'), page.getByRole('button', { name: 'Export backup (JSON)' }).click()]);
  const jsonPath = S + '/backup.json';
  fs.copyFileSync(await json.path(), jsonPath);
  const [csv] = await Promise.all([page.waitForEvent('download'), page.getByRole('button', { name: 'Export spreadsheet (CSV)' }).click()]);
  ok(fs.readFileSync(await csv.path(), 'utf8').split('\r\n').length >= 3, 'csv exported');
  await page.getByRole('button', { name: 'Clear all data' }).click();
  await page.getByRole('button', { name: 'Yes, delete everything' }).click();
  ok(await page.evaluate(() => Object.keys(localStorage).filter((k) => k.startsWith('subspend:')).length) <= 1, 'storage cleared');
  await page.locator('input[type=file]').setInputFiles(jsonPath);
  ok(await seen(page.getByText('This file contains 2 subscriptions.')), 'import preview');
  await page.getByRole('button', { name: 'Replace my data' }).click();
  await page.reload({ waitUntil: 'networkidle' });
  await page.getByRole('tab', { name: 'Subscriptions' }).click();
  ok(await seen(page.getByText('2 subscriptions')), 'imported data persisted');
  // 6. Card number blocked
  await page.getByRole('button', { name: 'Add subscription' }).first().click();
  await page.keyboard.type('gym'); await page.keyboard.press('Enter');
  await page.keyboard.type('400');
  await page.locator('dialog summary').click();
  await page.getByLabel(/Payment method label/).fill('4111 1111 1111 1111');
  await page.getByRole('button', { name: 'Add subscription' }).last().click();
  ok(await seen(page.getByText('This looks like a card number')), 'full card number rejected');
  console.log('page errors:', errors.length ? errors : 'none');
  await browser.close();
})();
