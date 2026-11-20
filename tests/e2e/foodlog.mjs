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
const PORT = 5198;
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
    getLatestHeartRate: async () => ({ bpm: 0, recordedAt: null }), getTodayAverageHeartRate: async () => ({ bpm: null }), getHealthSources: async () => ({ sources: [], garmin: false }), openURL: async () => ({ opened: true }), getTodayWorkouts: async () => ({ workouts: [] }),
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
  await ctx.addInitScript(FAKE_VV);
  await ctx.addInitScript(FAKE_HEALTH);

  // Fake saved favourites + recipes (test mode never touches the real database).
  const now = new Date().toISOString();
  const FAVS = [
    { id: 'f1', user_id: 'e2e-test-user', name: 'Oats & berries', meal: 'breakfast', items: [{ name: 'Oats', serving: '80g', proteinG: 10, carbsG: 50, fatG: 6 }], created_at: now, image_url: null },
    { id: 'f2', user_id: 'e2e-test-user', name: 'Chicken wrap', meal: 'lunch', items: [{ name: 'Wrap', serving: '1', proteinG: 35, carbsG: 40, fatG: 12 }], created_at: now, image_url: null },
    { id: 'f3', user_id: 'e2e-test-user', name: 'Steak & rice', meal: 'dinner', items: [{ name: 'Steak', serving: '200g', proteinG: 50, carbsG: 60, fatG: 20 }], created_at: now, image_url: null },
  ];
  const RECS = [
    { id: 'r1', user_id: 'e2e-test-user', name: 'Protein pancakes', image_url: null, servings: 2, kcal: 420, protein_g: 35, carbs_g: 45, fat_g: 9, ingredients: [], steps: [], source_label: null, source_url: null, created_at: now, is_favorite: true, meals: ['breakfast'] },
    { id: 'r2', user_id: 'e2e-test-user', name: 'Beef chilli', image_url: null, servings: 4, kcal: 610, protein_g: 45, carbs_g: 50, fat_g: 22, ingredients: [], steps: [], source_label: null, source_url: null, created_at: now, is_favorite: true, meals: ['dinner'] },
    { id: 'r3', user_id: 'e2e-test-user', name: 'Untagged smoothie', image_url: null, servings: 1, kcal: 300, protein_g: 25, carbs_g: 35, fat_g: 5, ingredients: [], steps: [], source_label: null, source_url: null, created_at: now, is_favorite: true, meals: [] },
  ];
  const patched = [];
  await ctx.route('http://127.0.0.1:9/rest/v1/**', async (route) => {
    const u = route.request().url();
    const json = (b) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(b) });
    if (route.request().method() === 'PATCH') { patched.push({ url: u, body: route.request().postData() }); return json([]); }
    if (u.includes('/favorite_meals')) return json(FAVS);
    if (u.includes('/user_recipes')) return json(RECS);
    return json([]);
  });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => { errors.push(String(e)); console.log('PAGEERROR', String(e).slice(0, 300)); });
  await page.goto(`http://localhost:${PORT}/?e2e=1`);
  await page.waitForFunction(() => !!window.__store);
  await page.evaluate(() => {
    const s = window.__store;
    s.setState({ onbDraft: { ...s.getState().onbDraft, name: 'Test', focus: 'gym' } });
    s.getState().finishOnboarding();
    s.setState({ viewingMacros: true });
  });
  await page.locator('.day-log-add').first().click();
  const overlay = page.locator('.modal-overlay.show');
  await overlay.waitFor();
  await page.waitForTimeout(400);
  const before = await overlay.boundingBox();

  // Every round: open food search (keyboard up), close it (keyboard down, iOS sends no event).
  const scenarios = [
    ['back button', async () => page.locator('.macro-search-back').click()],
    ['back button again (second time round)', async () => page.locator('.macro-search-back').click()],
  ];
  for (const [label, close] of scenarios) {
    await page.locator('#macroFoodName').click();
    await page.locator('.macro-search-overlay').waitFor();
    await page.evaluate(() => window.__vv.set(420, true)); // keyboard opens: viewport shrinks, event fires
    await page.waitForTimeout(150);
    await close();
    await page.evaluate(() => window.__vv.set(844, false)); // keyboard closes: iOS sends NO resize event
    await page.waitForTimeout(700);
    const box = await overlay.boundingBox();
    await page.screenshot({ path: path.join(SHOTS, `foodlog-after-${label.replace(/\W+/g, '-')}.png`) });
    check(`Log food sheet back to full height after search closes (${label})`, Math.abs(box.height - before.height) < 2, `height ${Math.round(box.height)} vs ${Math.round(before.height)}`);
  }

  // Keyboard for a field INSIDE the sheet must still shrink it, so the Add button stays visible.
  await page.locator('#macroFoodServing').click();
  await page.evaluate(() => window.__vv.set(420, true));
  await page.waitForTimeout(200);
  const kb = await overlay.boundingBox();
  check('Typing in the sheet itself still fits it above the keyboard', Math.abs(kb.height - 420) < 2, `height ${Math.round(kb.height)}`);
  // ...and closing that keyboard without an event (tap outside) restores it.
  await page.evaluate(() => { document.activeElement?.blur(); window.__vv.set(844, false); });
  await page.waitForTimeout(700);
  const after = await overlay.boundingBox();
  check('Sheet restores after its own keyboard closes with no resize event', Math.abs(after.height - before.height) < 2, `height ${Math.round(after.height)}`);

  // ---- Favourites & saved recipes: meal filter
  await page.locator('.fav-drop-head').click();
  const quick = await page.locator('.fav-drop-body').textContent();
  check('Quick favourites on Breakfast: breakfast favourite + breakfast recipe + untagged recipe, not dinner ones',
    /Oats & berries/.test(quick) && /Protein pancakes/.test(quick) && /Untagged smoothie/.test(quick) && !/Beef chilli/.test(quick) && !/Steak/.test(quick));
  await page.locator('.fav-drop-all').click();
  const fo = page.locator('.macro-search-overlay').last();
  await fo.locator('.meal-filter').waitFor();
  check('Favourites screen shows the meal filter with counts', /All\s*6/.test(await fo.locator('.meal-filter').textContent()), (await fo.locator('.meal-filter').textContent()).replace(/\s+/g, ' '));
  await page.screenshot({ path: path.join(SHOTS, 'favourites-all.png') });
  await fo.locator('.meal-filter button', { hasText: 'Dinner' }).click();
  const dinner = await fo.locator('.macro-search-results').textContent();
  check('Dinner filter shows only dinner favourites and dinner recipes', /Steak & rice/.test(dinner) && /Beef chilli/.test(dinner) && !/Oats/.test(dinner) && !/pancakes/.test(dinner) && !/smoothie/.test(dinner));
  await page.screenshot({ path: path.join(SHOTS, 'favourites-dinner.png') });
  await fo.locator('.meal-filter button', { hasText: 'Lunch' }).click();
  const lunch = await fo.locator('.macro-search-results').textContent();
  check('Lunch filter shows only lunch', /Chicken wrap/.test(lunch) && !/Steak/.test(lunch) && !/chilli/.test(lunch));
  // log the untagged recipe from the full list under the current meal (Breakfast) -> it gets tagged
  await fo.locator('.meal-filter button', { hasText: 'All' }).click();
  await fo.locator('button.fav-card', { hasText: 'Untagged smoothie' }).click();
  await page.waitForTimeout(400);
  check('Logging an untagged recipe to Breakfast saves the Breakfast tag', patched.some((p) => p.url.includes('user_recipes') && /breakfast/.test(p.body || '')), JSON.stringify(patched).slice(0, 160));
  check('No JavaScript errors', errors.length === 0, errors.slice(0, 2).join(' | '));
} finally {
  await browser.close();
  server.kill();
}
const failed = results.filter((x) => !x).length;
console.log(`\n${results.length - failed}/${results.length} food-log checks passed.`);
process.exit(failed ? 1 : 0);
