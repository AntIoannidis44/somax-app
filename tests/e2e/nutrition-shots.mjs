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
const PORT = 5193;
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

// Nutrition Today's log: screenshots next to Home and Train (with realistic logged food) AND checks that every
// log action still works after the 2026-11-20 restyle.   node tests/e2e/nutrition-shots.mjs [tag]
const TAG = process.argv[2] || 'now';
const server = spawn('npx', ['vite', '--port', String(PORT), '--strictPort'], { cwd: ROOT, stdio: 'pipe' });
await new Promise((res, rej) => { const t = setTimeout(() => rej(new Error('vite did not start')), 30000); server.stdout.on('data', (b) => { if (String(b).includes('Local:')) { clearTimeout(t); res(); } }); });
const browser = await chromium.launch({ executablePath: browserPath() });
try {
  const ctx = await browser.newContext({ viewport: { width: 390, height: Number(process.env.SHOT_H || 2400) }, deviceScaleFactor: 1, colorScheme: process.env.DARK ? 'dark' : 'light' });
  await ctx.addInitScript(FAKE_HEALTH);
  const d = new Date(); const today = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const E = (id, meal, name, serving, p, c, f, q = 1, src = 'manual') => ({ id, user_id: 'e2e-test-user', log_date: today, meal, name, serving, protein_g: p, carbs_g: c, fat_g: f, kcal: Math.round(p * 4 + c * 4 + f * 9), quantity: q, source: src, barcode: null, image_url: null, created_at: d.toISOString() });
  const ENTRIES = [
    E('1', 'breakfast', 'Oats with berries', '80g', 10, 52, 6), E('2', 'breakfast', 'Flat white', '1 cup', 7, 9, 7),
    E('3', 'lunch', 'Chicken burrito bowl', '1 bowl', 42, 61, 18, 1, 'photo'), E('4', 'lunch', 'Greek yoghurt', '170g', 17, 6, 0),
    E('5', 'snacks', 'Protein bar', '1 bar', 20, 22, 8, 1, 'barcode'),
  ];
  const calls = [];
  await ctx.route('http://127.0.0.1:9/rest/v1/**', async (route) => {
    const u = route.request().url(), method = route.request().method();
    const json = (b) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(b) });
    if (u.includes('/food_log_entries') && method !== 'GET') {
      calls.push({ method, url: u, body: route.request().postData() });
      if (method === 'POST') { const b = JSON.parse(route.request().postData() || '{}'); const row = Array.isArray(b) ? b[0] : b; return json({ ...row, id: 'new-' + calls.length, created_at: d.toISOString(), image_url: null, barcode: null }); }
      return json([]);
    }
    if (u.includes('/food_log_entries')) return json(ENTRIES);
    if (u.includes('/nutrition_goals')) return json([{ user_id: 'e2e-test-user', maintenance_kcal: 2600, goal_kcal: 2300, protein_g: 170, carbs_g: 240, fat_g: 70 }]);
    return json([]);
  });
  const page = await ctx.newPage();
  await page.goto(`http://localhost:${PORT}/?e2e=1`);
  await page.waitForFunction(() => !!window.__store);
  await page.evaluate(() => { const s = window.__store; s.setState({ onbDraft: { ...s.getState().onbDraft, name: 'Ant', focus: 'gym' } }); s.getState().finishOnboarding(); });
  await page.waitForTimeout(2500);
  await page.screenshot({ path: path.join(SHOTS, `n-home-${TAG}.png`), fullPage: true });
  await page.evaluate(() => window.__store.getState().go('train'));
  await page.waitForTimeout(1200);
  await page.screenshot({ path: path.join(SHOTS, `n-train-${TAG}.png`), fullPage: true });
  await page.evaluate(() => { window.__store.getState().go('home'); window.__store.setState({ viewingMacros: true }); });
  await page.waitForTimeout(1800);
  await page.screenshot({ path: path.join(SHOTS, `n-nutrition-${TAG}.png`), fullPage: true });
  console.log('shots saved', TAG);

  const results = [];
  const check = (name, ok, detail = '') => { results.push(ok); console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? '  - ' + detail : ''}`); };
  const meals = page.locator('.day-log-meal');
  check("Today's log shows the 4 meals", (await meals.count()) === 4);
  check('Each logged food shows as a row with its kcal', (await page.locator('.day-log-row').count()) === 5 && (await page.locator('.day-log-row', { hasText: 'Chicken burrito bowl' }).locator('.day-log-kcal b').textContent()) === '574');
  check('Meal headers summarise items and kcal', /2 items · 429 kcal/.test(await meals.nth(0).locator('.day-log-title').textContent()));
  check('Header totals the day', /5 items · 1,335 kcal/.test(await page.locator('.day-log-total').textContent()));
  // tap a food -> edit sheet
  await page.locator('.day-log-row', { hasText: 'Flat white' }).click();
  await page.locator('.modal-overlay.show', { hasText: 'Edit food' }).waitFor({ timeout: 3000 }).catch(() => {});
  check('Tapping a food opens Edit food', (await page.locator('.modal-overlay.show', { hasText: 'Edit food' }).count()) === 1);
  await page.locator('.modal-overlay.show .modal-close').click();
  await page.waitForTimeout(400);
  // remove a food
  await page.locator('.day-log-row', { hasText: 'Greek yoghurt' }).locator('.day-log-del').click();
  await page.waitForTimeout(500);
  check('× removes the food (and only that food)', (await page.locator('.day-log-row', { hasText: 'Greek yoghurt' }).count()) === 0 && (await page.locator('.day-log-row').count()) === 4 && calls.some((c) => c.method === 'DELETE' && c.url.includes('id=eq.4')), JSON.stringify(calls).slice(0, 120));
  // skip dinner
  await page.locator('.day-log-meal', { hasText: 'Dinner' }).locator('.day-log-empty button').click();
  await page.waitForTimeout(600);
  check('Skip dinner records a skip and the card says Skipped', calls.some((c) => c.method === 'POST' && /skipped/.test(c.body || '')) && /Skipped/.test(await page.locator('.day-log-meal', { hasText: 'Dinner' }).textContent()));
  await page.screenshot({ path: path.join(SHOTS, `n-nutrition-${TAG}-after-actions.png`), fullPage: true });
  // add -> Log food sheet opens on that meal
  await page.locator('.day-log-meal', { hasText: 'Lunch' }).locator('.day-log-add').click();
  await page.locator('.modal-overlay.show', { hasText: 'Log food' }).waitFor({ timeout: 3000 }).catch(() => {});
  const onMeal = await page.locator('.modal-overlay.show .macro-meal-picker button.on').first().textContent().catch(() => '');
  check('+ Add opens Log food on that meal', onMeal === 'Lunch', onMeal);
  const failed = results.filter((x) => !x).length;
  console.log(`\n${results.length - failed}/${results.length} today's-log checks passed.`);
  process.exitCode = failed ? 1 : 0;
} finally { await browser.close(); server.kill(); }
