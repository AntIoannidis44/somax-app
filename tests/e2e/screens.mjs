// Layer 2: screen tests. Runs the real app in a headless phone-sized browser in
// screen-test mode (src/lib/e2e.ts: no login, no real database, fake Apple Health),
// taps through the new features like a user, checks what's on screen and saves
// screenshots to tests/e2e/shots/ for review.
//   node tests/e2e/screens.mjs
import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import { mkdirSync, readdirSync } from 'node:fs';
import { homedir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const SHOTS = path.join(ROOT, 'tests', 'e2e', 'shots');
mkdirSync(SHOTS, { recursive: true });
const PORT = 5199;

function browserPath() {
  const base = path.join(homedir(), 'Library', 'Caches', 'ms-playwright');
  for (const d of readdirSync(base).filter((x) => x.startsWith('chromium_headless_shell-')).sort().reverse()) {
    const p = path.join(base, d, 'chrome-headless-shell-mac-arm64', 'chrome-headless-shell');
    try { readdirSync(path.dirname(p)); return p; } catch { /* next */ }
  }
  return undefined;
}

const today = (() => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; })();

// Fake Apple Health: one real strength workout, one "watch left on the couch",
// one typed into the Health app; 9,200 device-recorded steps today.
const FAKE_HEALTH = `
  const t = ${JSON.stringify(today)};
  const workouts = [
    { uuid: 'real-1', activityName: 'Strength Training', startDate: t + 'T07:00:00', durationMinutes: 45, kcal: 220, distanceMeters: null, userEntered: false },
    { uuid: 'couch-1', activityName: 'Strength Training', startDate: t + 'T12:00:00', durationMinutes: 45, kcal: 20, distanceMeters: null, userEntered: false },
    { uuid: 'typed-1', activityName: 'Strength Training', startDate: t + 'T18:00:00', durationMinutes: 50, kcal: 300, distanceMeters: null, userEntered: true },
  ];
  window.__E2E_HEALTH__ = {
    isAvailable: async () => ({ available: true }),
    requestAuthorization: async () => ({ granted: true }),
    getTodaySummary: async () => ({ steps: 9200, verifiedSteps: 9200, activeMinutes: 40, kcal: 420 }),
    getMonthlyStepsSummary: async () => ({ steps: 120000 }),
    getMonthlyCardioDistance: async () => ({ meters: 0 }),
    getLatestHeartRate: async () => ({ bpm: 62, recordedAt: t + 'T08:00:00' }),
    getTodayAverageHeartRate: async () => ({ bpm: 71.6 }),
    getTodayWorkouts: async () => ({ workouts }),
    getDailyVerifiedSteps: async () => ({ days: [{ date: t, steps: 9200 }] }),
    getWorkoutRoute: async () => ({ points: [] }),
    openAppSettings: async () => ({ opened: false }),
  };
`;

const results = [];
function check(name, ok, detail = '') {
  results.push({ name, ok, detail });
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? '  - ' + detail : ''}`);
}

const server = spawn('npx', ['vite', '--port', String(PORT), '--strictPort'], { cwd: ROOT, stdio: 'pipe' });
await new Promise((resolve, reject) => {
  const t = setTimeout(() => reject(new Error('vite did not start')), 30000);
  server.stdout.on('data', (b) => { if (String(b).includes('Local:')) { clearTimeout(t); resolve(); } });
});

const browser = await chromium.launch({ executablePath: browserPath() });
try {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
  await ctx.addInitScript(FAKE_HEALTH);
  const page = await ctx.newPage();
  const consoleErrors = [];
  page.on('pageerror', (e) => consoleErrors.push(String(e)));
  page.on('dialog', (d) => d.accept());

  await page.goto(`http://localhost:${PORT}/?e2e=1`);
  await page.waitForFunction(() => !!window.__store);
  // Onboard a test user with a push workout scheduled today.
  await page.evaluate(() => {
    const s = window.__store;
    s.setState({ onbDraft: { ...s.getState().onbDraft, name: 'Test', focus: 'gym' } });
    s.getState().finishOnboarding();
    const idx = new Date().getDay();
    const plan = [...s.getState().weekPlan];
    plan[idx] = { type: 'train', key: 'push', label: 'Push Day' };
    s.setState({ weekPlan: plan, coins: 0, coinLedger: [] });
    s.getState().reviseTodayFromPlan?.();
  });
  await page.waitForTimeout(2500); // health sync effect runs on onboarded

  // 1. Home
  await page.screenshot({ path: path.join(SHOTS, '01-home.png'), fullPage: true });
  const home = await page.textContent('body');
  check('Home says "Challenge", not "Quest"', /All challenges/.test(home) && !/\bQuests?\b/.test(home));
  // Heart rate = today's AVERAGE from Apple Health (71.6 -> 72), never the single latest reading (62)
  const hrTile = page.locator('.metric', { hasText: /heart rate/i });
  const hrText = (await hrTile.textContent()) || '';
  check("Heart-rate tile shows today's average (72 bpm), not the latest reading", /72/.test(hrText) && /Avg heart rate/.test(hrText) && !/62/.test(hrText), hrText);
  await page.locator('.metrics').screenshot({ path: path.join(SHOTS, '01b-metrics-avg-hr.png') });
  const coinsAfterSteps = await page.evaluate(() => window.__store.getState().coins);
  // steps (5) + today's real Apple Watch strength workout auto-synced (10); the couch and hand-entered ones pay nothing
  check('Verified sources paid coins: 8k device steps (5) + real watch workout (10), nothing for couch/typed-in', coinsAfterSteps === 15, `coins=${coinsAfterSteps}`);

  // 2. Challenges tab + coin info
  await page.evaluate(() => { const s = window.__store.getState(); s.go('play'); s.setPlayTab('challenges'); });
  await page.waitForTimeout(500);
  const card = page.locator('.chal', { hasText: 'Easy Miles Starter' });
  await card.locator('.chal-info').click();
  const note = await card.locator('.chal-coin-rule').textContent().catch(() => '');
  check('Info icon opens the coin rule note', /Logging a workout counts toward this challenge/.test(note) && /verified with Apple Health/.test(note), note.slice(0, 80));
  await card.screenshot({ path: path.join(SHOTS, '02-challenge-info.png') });
  const pushups = page.locator('.chal', { hasText: '100 Push-Ups Club' });
  check('Rep challenge shows no coin info icon', (await pushups.locator('.chal-info').count()) === 0);

  // 3. Join a verified challenge -> Apple Health tag / log button
  await page.locator('.chal', { hasText: 'Five in a Row' }).getByRole('button', { name: 'Join' }).click();
  await page.waitForTimeout(300);
  const five = page.locator('.chal', { hasText: 'Five in a Row' });
  check('Joined streak challenge shows the Apple Health tag', (await five.locator('.verified').count()) === 1);
  await five.screenshot({ path: path.join(SHOTS, '03-joined-streak.png') });

  // 4. Finish today's workout, then verify it from the Home card button
  await page.evaluate(() => { const s = window.__store.getState(); s.openWorkout('push'); s.finishWorkout('push'); s.closeWorkout(); s.go('home'); });
  await page.waitForTimeout(400);
  const verifyBtn = page.getByRole('button', { name: /Verify with Apple Fitness/ }).first();
  check('Home card shows "Verify with Apple Fitness · +10 XP" under Completed', await verifyBtn.isVisible());
  await page.screenshot({ path: path.join(SHOTS, '04-home-completed.png'), fullPage: true });
  await verifyBtn.click();
  await page.waitForTimeout(800);
  const picker = page.locator('.day-picker').last();
  await picker.screenshot({ path: path.join(SHOTS, '05-picker.png') });
  const pickerText = await picker.textContent();
  check('Picker greys out the couch workout with a reason', /Too little effort/.test(pickerText));
  check('Picker greys out the hand-entered workout with a reason', /by hand/.test(pickerText));
  await picker.locator('.day-picker-opt', { hasText: '220 kcal' }).click();
  await page.waitForTimeout(500);
  const st = await page.evaluate(() => { const s = window.__store.getState(); const ws = s.workoutState[s.simDay].push; return { coins: s.coins, verified: !!ws.watchSyncXpAwarded }; });
  check('Verifying the real workout pays +10 XP, and no second workout coins the same day', st.verified && st.coins === 15, JSON.stringify(st));
  await page.screenshot({ path: path.join(SHOTS, '06-verified.png'), fullPage: true });

  // 5. Home now shows the verified line
  await page.evaluate(() => { const s = window.__store.getState(); s.closeWorkout(); s.go('home'); });
  await page.waitForTimeout(400);
  check('Home card now shows "Verified with Apple Fitness"', /Verified with Apple Fitness/.test(await page.textContent('body')));
  await page.screenshot({ path: path.join(SHOTS, '07-home-verified.png'), fullPage: true });

  // No heart-rate reading today: blank tile that says so (no stand-in number)
  await page.evaluate(() => { const st = window.__store.getState(); window.__store.setState({ today: { ...st.today, health: { ...st.today.health, hr: null } } }); });
  await page.click('nav >> text=Home').catch(() => {});
  await page.waitForTimeout(400);
  const noHr = (await page.locator('.metric', { hasText: /heart rate/i }).textContent()) || '';
  check('No heart rate today: tile is blank and says "No heart rate"', /No heart rate/.test(noHr) && !/\d/.test(noHr), noHr);
  await page.locator('.metrics').screenshot({ path: path.join(SHOTS, '08-metrics-no-hr.png') });

  // Profile settings: Health & watches card explains how a Garmin connects (owner 2026-11-21)
  await page.click('nav >> text=Profile').catch(() => {});
  await page.waitForTimeout(800);
  const garmin = page.locator('.health-devices');
  await garmin.scrollIntoViewIfNeeded().catch(() => {});
  const gText = (await garmin.textContent().catch(() => '')) || '';
  check('Profile settings show how to connect a Garmin through Apple Health', /Garmin watch/.test(gText) && /Connected Apps → Apple Health/.test(gText), gText.slice(0, 90));
  await garmin.screenshot({ path: path.join(SHOTS, '09-health-watches.png') }).catch(() => {});

  check('No JavaScript errors on any screen', consoleErrors.length === 0, consoleErrors.slice(0, 2).join(' | '));
} finally {
  await browser.close();
  server.kill();
}
const failed = results.filter((r) => !r.ok).length;
console.log(`\n${results.length - failed}/${results.length} screen checks passed. Screenshots: ${SHOTS}`);
process.exit(failed ? 1 : 0);
