// iPhone keyboard + popup: tapping a popup's button while its text box has the
// keyboard up must press that button. Regression (2026-11-19 -> 21): the popup
// snapped back to full height on focusout - mid-tap - so the tap landed on the
// dimmed background and closed the popup: "Log how you felt" never submitted.
//   node tests/e2e/keyboard-submit.mjs
import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import { readdirSync } from 'node:fs';
import { homedir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const PORT = 5196;
function browserPath() {
  const base = path.join(homedir(), 'Library', 'Caches', 'ms-playwright');
  for (const d of readdirSync(base).filter((x) => x.startsWith('chromium_headless_shell-')).sort().reverse()) {
    const p = path.join(base, d, 'chrome-headless-shell-mac-arm64', 'chrome-headless-shell');
    try { readdirSync(path.dirname(p)); return p; } catch {}
  }
}
// Fake the iOS keyboard: while a text field is focused the visual viewport is 450 px tall.
const FAKE_KEYBOARD = `
  window.addEventListener('DOMContentLoaded', () => {
    const vv = window.visualViewport;
    const typing = () => { const el = document.activeElement; return !!el && (el.tagName === 'TEXTAREA' || (el.tagName === 'INPUT' && !['button','checkbox','submit'].includes(el.type))); };
    Object.defineProperty(vv, 'height', { get: () => (typing() ? 450 : window.innerHeight) });
    document.addEventListener('focusin', () => setTimeout(() => vv.dispatchEvent(new Event('resize')), 0));
    // like iOS, the keyboard-closed resize arrives only after the keyboard animation
    document.addEventListener('focusout', () => setTimeout(() => vv.dispatchEvent(new Event('resize')), 300));
  });
`;
const server = spawn('npx', ['vite', '--port', String(PORT), '--strictPort'], { cwd: ROOT, stdio: 'pipe' });
await new Promise((res, rej) => { const t = setTimeout(() => rej(new Error('vite')), 30000); server.stdout.on('data', (b) => { if (String(b).includes('Local:')) { clearTimeout(t); res(); } }); });
const browser = await chromium.launch({ executablePath: browserPath() });
let ok = true;
try {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
  await ctx.addInitScript(`window.__E2E_HEALTH__ = { isAvailable: async () => ({ available: false }) };`);
  await ctx.addInitScript(FAKE_KEYBOARD);
  const page = await ctx.newPage();
  await page.goto(`http://localhost:${PORT}/?e2e=1`);
  await page.waitForFunction(() => !!window.__store);
  await page.evaluate(() => { const s = window.__store; s.setState({ onbDraft: { ...s.getState().onbDraft, name: 'Test', focus: 'gym' } }); s.getState().finishOnboarding(); });
  await page.waitForTimeout(2000);
  await page.locator('.goal-row', { hasText: 'Log how you felt' }).click();
  await page.waitForTimeout(400);
  const ta = page.locator('.modal-overlay.show textarea');
  await ta.focus();
  await ta.type('Legs heavy, energy good, slept well last night.');
  await page.waitForTimeout(400); // keyboard is up, sheet sits above it
  const btn = page.locator('.modal-overlay.show button', { hasText: 'Submit' });
  const box = await btn.boundingBox();
  // A real finger: press, (focus leaves the textarea), release at the same spot.
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.waitForTimeout(60);
  await page.mouse.up();
  await page.waitForTimeout(800);
  const g = await page.evaluate(() => window.__store.getState().today.goals.find((x) => x.id === 'logfeel'));
  const xp = await page.evaluate(() => window.__store.getState().progress.totalXP);
  ok = g.done && xp === 10;
  console.log(`${ok ? 'PASS' : 'FAIL'}  Tapping Submit with the keyboard up logs it (+10 XP)  - done=${g.done} xp=${xp}`);
} finally { await browser.close(); server.kill(); }
process.exit(ok ? 0 : 1);
