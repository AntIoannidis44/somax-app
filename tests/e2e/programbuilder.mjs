// Program builder exercise picker (search / filters / own exercise). Shares setup with foodlog.mjs.
// Food log sheet sizing guard. Reproduces the iPhone "half-screen Log food sheet" bug:
// iOS shrinks the visible viewport when the keyboard opens, and in the app's web view the
// matching "resize" event when the keyboard CLOSES is sometimes never delivered. The sheet used
// to size itself from the last resize event, so it stayed squashed at keyboard height until some
// later event fixed it - inconsistent, depending on whether iOS sent the event.
//   node tests/e2e/foodlog.mjs
import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import { readdirSync, mkdirSync } from 'node:fs';
import { homedir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const SHOTS = path.join(ROOT, 'tests', 'e2e', 'shots');
mkdirSync(SHOTS, { recursive: true });
const PORT = 5194;
const H = 844;

function browserPath() {
  const base = path.join(homedir(), 'Library', 'Caches', 'ms-playwright');
  for (const d of readdirSync(base).filter((x) => x.startsWith('chromium_headless_shell-')).sort().reverse()) {
    const p = path.join(base, d, 'chrome-headless-shell-mac-arm64', 'chrome-headless-shell');
    try { readdirSync(path.dirname(p)); return p; } catch { /* next */ }
  }
  return undefined;
}

// Fake Visual Viewport we control: set(height, fireEvent).
const FAKE_VV = `
  (() => {
    const t = new EventTarget();
    let h = ${H};
    Object.defineProperty(t, 'height', { get: () => h });
    Object.defineProperty(t, 'width', { get: () => 390 });
    Object.defineProperty(t, 'offsetTop', { get: () => 0 });
    Object.defineProperty(t, 'scale', { get: () => 1 });
    Object.defineProperty(window, 'visualViewport', { value: t, configurable: true });
    window.__vv = { set(v, fire) { h = v; if (fire) t.dispatchEvent(new Event('resize')); } };
  })();
`;

const FAKE_HEALTH = `
  window.__E2E_HEALTH__ = {
    isAvailable: async () => ({ available: true }), requestAuthorization: async () => ({ granted: true }),
    getTodaySummary: async () => ({ steps: 0, verifiedSteps: 0, activeMinutes: 0, kcal: 0 }),
    getMonthlyStepsSummary: async () => ({ steps: 0 }), getMonthlyCardioDistance: async () => ({ meters: 0 }),
    getLatestHeartRate: async () => ({ bpm: 0, recordedAt: null }), getTodayAverageHeartRate: async () => ({ bpm: null }), getHealthSources: async () => ({ sources: [], garmin: false }), getRestingHeartRate: async () => ({ bpm: null, recordedAt: null }), openURL: async () => ({ opened: true }), getTodayWorkouts: async () => ({ workouts: [] }),
    getDailyVerifiedSteps: async () => ({ days: [] }), getWorkoutRoute: async () => ({ points: [] }), openAppSettings: async () => ({ opened: false }),
  };
`;

const results = [];
const check = (name, ok, detail = '') => { results.push(ok); console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? '  - ' + detail : ''}`); };

const server = spawn('npx', ['vite', '--port', String(PORT), '--strictPort'], { cwd: ROOT, stdio: 'pipe' });
await new Promise((res, rej) => { const t = setTimeout(() => rej(new Error('vite did not start')), 30000); server.stdout.on('data', (b) => { if (String(b).includes('Local:')) { clearTimeout(t); res(); } }); });
const browser = await chromium.launch({ executablePath: browserPath() });
try {
  const ctx = await browser.newContext({ viewport: { width: 390, height: H }, deviceScaleFactor: 2 });
  await ctx.addInitScript(FAKE_HEALTH);
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  await page.goto(`http://localhost:${PORT}/?e2e=1`);
  await page.waitForFunction(() => !!window.__store);
  await page.evaluate(() => {
    const s = window.__store;
    s.setState({ onbDraft: { ...s.getState().onbDraft, name: 'Test', focus: 'gym' } });
    s.getState().finishOnboarding();
    s.getState().openWorkoutEditor('new');
  });
  const addBtn = page.locator('.section-label .link-btn', { hasText: 'Add' });
  await addBtn.waitFor();
  const picker = page.locator('.ex-picker');

  // 1. word-match search with shorthand
  await addBtn.click();
  await picker.waitFor();
  await picker.locator('input').fill('db bench');
  await page.waitForTimeout(300);
  const first = (await picker.locator('.macro-search-row:not(.ex-picker-custom) .macro-search-name').first().textContent())?.trim();
  const firstRowIsMatch = !(await picker.locator('.macro-search-row').first().getAttribute('class')).includes('ex-picker-custom');
  check('"db bench" finds Dumbbell Bench Press first, above the "add your own" option', first === 'Dumbbell Bench Press' && firstRowIsMatch, first);
  await page.screenshot({ path: path.join(SHOTS, 'picker-search.png') });
  await picker.locator('.macro-search-row', { hasText: 'Dumbbell Bench Press' }).first().click();
  check('Picking it adds the exercise to the program', (await page.locator('.ex-edit-name-btn').first().textContent())?.includes('Dumbbell Bench Press'));

  // 2. filters: Movement = Pull, Muscle = Back
  await addBtn.click();
  await picker.locator('.ex-picker-tabs button', { hasText: 'Movement' }).click();
  await picker.locator('.ex-picker-chips button', { hasText: /^Pull$/ }).click();
  await picker.locator('.ex-picker-tabs button', { hasText: 'Muscle' }).click();
  await picker.locator('.ex-picker-chips button', { hasText: /^Back$/ }).click();
  await page.waitForTimeout(200);
  const subs = await picker.locator('.ex-picker-sub').allTextContents();
  check('Movement + Muscle filters narrow the list (all Pull, back muscles)', subs.length > 5 && subs.every((t) => t.startsWith('Pull')), `${subs.length} results`);
  check('Active filters shown on the tabs', /Movement: Pull/.test(await picker.locator('.ex-picker-tabs').textContent()) && /Muscle: Back/.test(await picker.locator('.ex-picker-tabs').textContent()));
  await page.screenshot({ path: path.join(SHOTS, 'picker-filters.png') });
  await picker.locator('.ex-picker-tabs button', { hasText: 'Sport' }).click();
  await picker.locator('.ex-picker-chips button', { hasText: /^Golf$/ }).click();
  await page.waitForTimeout(200);
  const golfCount = await picker.locator('.macro-search-row').count();
  await picker.locator('.ex-picker-clear').click();
  await page.waitForTimeout(200);
  const allCount = await picker.locator('.macro-search-row').count();
  check('Sport filter combines with the others, and Clear removes them all', golfCount < subs.length && allCount > subs.length, `golf+pull+back ${golfCount}, cleared ${allCount}`);
  await picker.locator('input').fill('pull-up');
  await page.waitForTimeout(200);
  await picker.locator('.macro-search-row', { hasText: /^Pull-up/ }).first().click();

  // 3. own exercise (not in the list)
  await addBtn.click();
  await picker.locator('input').fill("Nana's garden squats");
  await page.waitForTimeout(200);
  const custom = picker.locator('.ex-picker-custom');
  const customFirst = (await picker.locator('.macro-search-row').first().getAttribute('class')).includes('ex-picker-custom');
  check('Text not in the list offers "Add as your own exercise" (no picture) at the top', (await custom.count()) === 1 && customFirst && /No picture/.test(await custom.textContent()));
  await custom.click();
  const namesNow = (await page.locator('.ex-edit-name-btn').allTextContents()).map((t) => t.trim());
  check('Own exercise is added with exactly the typed name', namesNow.includes("Nana's garden squats"), JSON.stringify(namesNow));

  // 4. tap an exercise's name to change it - picker opens with its name already searched
  await page.locator('.ex-edit-name-btn').first().click();
  check('Tapping an exercise opens the picker with its name filled in', (await picker.locator('input').inputValue()) === 'Dumbbell Bench Press');
  await picker.locator('input').fill('incline dumbbell press');
  await page.waitForTimeout(200);
  await picker.locator('.macro-search-row', { hasText: 'Incline Dumbbell Press' }).first().click();
  check('Changing it swaps just that exercise', (await page.locator('.ex-edit-name-btn').first().textContent())?.includes('Incline Dumbbell Press') && (await page.locator('.ex-edit-name-btn').count()) === 3);
  await page.screenshot({ path: path.join(SHOTS, 'program-builder.png'), fullPage: true });
  check('No JavaScript errors', errors.length === 0, errors.slice(0, 2).join(' | '));
} finally {
  await browser.close();
  server.kill();
}
const failed = results.filter((x) => !x).length;
console.log(`\n${results.length - failed}/${results.length} program-builder checks passed.`);
process.exit(failed ? 1 : 0);
