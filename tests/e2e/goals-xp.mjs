// Every Home daily goal pays its XP when completed the way a user does it.
//   node tests/e2e/goals-xp.mjs
import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import { readdirSync, mkdirSync } from 'node:fs';
import { homedir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const SHOTS = path.join(ROOT, 'tests', 'e2e', 'shots'); mkdirSync(SHOTS, { recursive: true });
const PORT = 5198;
function browserPath() {
  const base = path.join(homedir(), 'Library', 'Caches', 'ms-playwright');
  for (const d of readdirSync(base).filter((x) => x.startsWith('chromium_headless_shell-')).sort().reverse()) {
    const p = path.join(base, d, 'chrome-headless-shell-mac-arm64', 'chrome-headless-shell');
    try { readdirSync(path.dirname(p)); return p; } catch {}
  }
}
const server = spawn('npx', ['vite', '--port', String(PORT), '--strictPort'], { cwd: ROOT, stdio: 'pipe' });
await new Promise((res, rej) => { const t = setTimeout(() => rej(new Error('vite')), 30000); server.stdout.on('data', (b) => { if (String(b).includes('Local:')) { clearTimeout(t); res(); } }); });
const browser = await chromium.launch({ executablePath: browserPath() });
const results = [];
const check = (n, ok, d = '') => { results.push(ok); console.log(`${ok ? 'PASS' : 'FAIL'}  ${n}${d ? '  - ' + d : ''}`); };
try {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
  await ctx.addInitScript(`window.__E2E_HEALTH__ = { isAvailable: async () => ({ available: false }) };`);
  const page = await ctx.newPage();
  const errs = []; page.on('pageerror', (e) => errs.push(String(e))); page.on('dialog', (d) => d.accept());
  await page.goto(`http://localhost:${PORT}/?e2e=1`);
  await page.waitForFunction(() => !!window.__store);
  await page.evaluate(() => { const s = window.__store; s.setState({ onbDraft: { ...s.getState().onbDraft, name: 'Test', focus: 'gym' } }); s.getState().finishOnboarding(); });
  await page.waitForTimeout(2500);
  const goals = await page.evaluate(() => window.__store.getState().today.goals.map((g) => ({ id: g.id, xp: g.xp, done: g.done, label: g.label })));
  console.log('goals today:', JSON.stringify(goals));
  const xp = () => page.evaluate(() => window.__store.getState().progress.totalXP);

  // Log how you felt: tap row, type, submit
  const before = await xp();
  await page.locator('.goal-row', { hasText: 'Log how you felt' }).click();
  await page.waitForTimeout(400);
  await page.locator('.modal-overlay.show textarea').fill('Legs were heavy but energy was good, slept well last night.');
  await page.locator('.modal-overlay.show button', { hasText: 'Submit' }).click();
  await page.waitForTimeout(600);
  const after = await xp();
  const fg = await page.evaluate(() => window.__store.getState().today.goals.find((g) => g.id === 'logfeel'));
  check('Log how you felt pays XP', after - before === fg?.xp && fg?.done, `xp ${before}->${after}, goal ${JSON.stringify(fg)}`);
  await page.screenshot({ path: path.join(SHOTS, 'goals-xp-logfeel.png'), fullPage: true });

  // Every plain tap goal
  for (const g of goals.filter((g) => !['hydration', 'watch_workout', 'logfeel', 'macros'].includes(g.id))) {
    const b = await xp();
    const row = page.locator('.goal-row', { hasText: g.label }).first();
    if (!(await row.count())) { check(`Goal "${g.label}" is on screen`, false); continue; }
    await row.locator('.goal-check').click().catch(() => {});
    await page.waitForTimeout(300);
    const a = await xp();
    const now = await page.evaluate((id) => window.__store.getState().today.goals.find((x) => x.id === id), g.id);
    check(`Goal "${g.label}" pays ${g.xp} XP`, now.done && a - b === g.xp, `xp ${b}->${a}`);
  }
  check('No page errors', errs.length === 0, errs.join(' | ').slice(0, 300));
} finally { await browser.close(); server.kill(); }
process.exit(results.every(Boolean) ? 0 : 1);
