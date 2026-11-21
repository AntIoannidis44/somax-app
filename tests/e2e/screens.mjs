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
    { uuid: 'real-1', activityName: 'Strength Training', startDate: t + 'T07:00:00', durationMinutes: 45, kcal: 220, distanceMeters: null, userEntered: false, fromGarmin: true },
    { uuid: 'couch-1', activityName: 'Strength Training', startDate: t + 'T12:00:00', durationMinutes: 45, kcal: 20, distanceMeters: null, userEntered: false },
    { uuid: 'typed-1', activityName: 'Strength Training', startDate: t + 'T18:00:00', durationMinutes: 50, kcal: 300, distanceMeters: null, userEntered: true },
  ];
  window.__E2E_HEALTH__ = {
    isAvailable: async () => ({ available: true }),
    requestAuthorization: async () => ({ granted: true }),
    // Apple Health (merged) vs Garmin-only answers differ, so the Sync-data-from switch is visible on Home
    getTodaySummary: async (o) => { window.__lastSource = o && o.source; return o && o.source === 'garmin' ? { steps: 6400, verifiedSteps: 6400, activeMinutes: 25, kcal: 310 } : { steps: 9200, verifiedSteps: 9200, activeMinutes: 40, kcal: 420 }; },
    getRestingHeartRate: async (o) => ({ bpm: o && o.source === 'garmin' ? 54 : 58, recordedAt: t + 'T06:00:00' }),
    getMonthlyStepsSummary: async () => ({ steps: 120000 }),
    getMonthlyCardioDistance: async () => ({ meters: 0 }),
    getLatestHeartRate: async () => ({ bpm: 62, recordedAt: t + 'T08:00:00' }),
    getTodayAverageHeartRate: async () => ({ bpm: 71.6 }), getHealthSources: async () => ({ sources: [], garmin: false }), getStepsBySource: async () => ({ sources: [] }), openURL: async () => ({ opened: true }),
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
  const hrTile = page.locator('.metric', { hasText: /Resting HR|heart rate/i });
  const hrText = (await hrTile.textContent()) || '';
  check('Heart-rate tile shows RESTING heart rate (58), not average (72) or latest (62)', /58/.test(hrText) && /Resting HR/.test(hrText) && !/72|62/.test(hrText), hrText);
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
  check('Picker labels the Garmin workout "Garmin"', /Strength Training[^·]*· 220 kcal · 45 min · Garmin/.test(pickerText), pickerText.replace(/\s+/g, ' ').slice(0, 120));
  check('Picker greys out the hand-entered workout with a reason', /by hand/.test(pickerText));
  await picker.locator('.day-picker-opt', { hasText: '220 kcal' }).click();
  await page.waitForTimeout(500);
  const st = await page.evaluate(() => { const s = window.__store.getState(); const ws = s.workoutState[s.simDay].push; return { coins: s.coins, verified: !!ws.watchSyncXpAwarded }; });
  check('Verifying the real workout pays +10 XP, and no second workout coins the same day', st.verified && st.coins === 15, JSON.stringify(st));
  await page.screenshot({ path: path.join(SHOTS, '06-verified.png'), fullPage: true });

  // 5. Home now shows the verified line
  await page.evaluate(() => { const s = window.__store.getState(); s.closeWorkout(); s.go('home'); });
  await page.waitForTimeout(400);
  check('A Garmin workout verifies the session: Home card shows "Verified with Garmin"', /Verified with Garmin/.test(await page.textContent('body')));
  await page.screenshot({ path: path.join(SHOTS, '07-home-verified.png'), fullPage: true });

  // No heart-rate reading today: blank tile that says so (no stand-in number)
  await page.evaluate(() => { const st = window.__store.getState(); window.__store.setState({ today: { ...st.today, health: { ...st.today.health, hr: null } } }); });
  await page.click('nav >> text=Home').catch(() => {});
  await page.waitForTimeout(400);
  const noHr = (await page.locator('.metric', { hasText: /Resting HR|heart rate/i }).textContent()) || '';
  check('No heart rate today: tile is blank and says "No heart rate"', /No heart rate/.test(noHr) && !/\d/.test(noHr), noHr);
  await page.locator('.metrics').screenshot({ path: path.join(SHOTS, '08-metrics-no-hr.png') });

  // Profile settings: Health & watches card explains how a Garmin connects (owner 2026-11-21)
  await page.click('nav >> text=Profile').catch(() => {});
  await page.waitForTimeout(800);
  const garmin = page.locator('.health-devices');
  await garmin.scrollIntoViewIfNeeded().catch(() => {});
  const gText = (await garmin.textContent().catch(() => '')) || '';
  check('Profile settings show how to connect a Garmin through Apple Health', /Garmin watch/.test(gText) && /Connected Apps → Apple Health/.test(gText), gText.slice(0, 90));
  check('Not connected yet: an "Open Garmin Connect" button is shown', (await page.locator('.health-devices .garmin-open').count()) === 1);
  await garmin.screenshot({ path: path.join(SHOTS, '09-health-watches.png') }).catch(() => {});
  // once Garmin data arrives in Apple Health the row says Connected (re-checked when the app comes back)
  await page.evaluate(() => { window.__E2E_HEALTH__.getHealthSources = async () => ({ sources: [{ bundleId: 'com.garmin.connect.mobile', name: 'Connect' }], garmin: true }); document.dispatchEvent(new Event('visibilitychange')); });
  await page.waitForTimeout(400);
  const g2 = (await garmin.textContent().catch(() => '')) || '';
  check('Garmin data arriving: row shows "Connected ✓" and the button goes away', /Connected ✓/.test(g2) && (await page.locator('.health-devices .garmin-open').count()) === 0, g2.slice(0, 80));
  check('Garmin found while on Apple Health: "Use Garmin" prompt shown', (await page.locator('.health-devices .garmin-use button', { hasText: 'Use Garmin' }).count()) === 1);
  await garmin.screenshot({ path: path.join(SHOTS, '09b-garmin-connected.png') }).catch(() => {});

  // Steps today per source (2026-11-21): Garmin's own count next to the iPhone's; in Garmin mode Garmin is "Used"
  await page.evaluate(() => {
    const ago = (m) => new Date(Date.now() - m * 60000).toISOString();
    window.__E2E_HEALTH__.getStepsBySource = async () => ({ sources: [
      { name: 'iPhone', bundleId: 'com.apple.health.X', garmin: false, steps: 9200, lastAt: ago(3) },
      { name: 'Connect', bundleId: 'com.garmin.connect.mobile', garmin: true, steps: 6400, lastAt: ago(150) },
    ] });
    document.dispatchEvent(new Event('visibilitychange'));
  });
  await page.waitForTimeout(400);
  const ss = (await page.locator('.step-sources').textContent().catch(() => '')) || '';
  check('Settings lists today\'s steps per source (Garmin 6,400 and iPhone 9,200)', /Garmin\s*6,400/.test(ss) && /iPhone\s*9,200/.test(ss), ss.replace(/\s+/g, ' ').slice(0, 120));
  check('Garmin listed first', /^Steps today in Apple Health\s*Garmin/.test(ss));
  await page.locator('.health-source button', { hasText: 'Garmin' }).click();
  await page.waitForTimeout(300);
  const ss2 = (await page.locator('.step-sources').textContent().catch(() => '')) || '';
  check('Garmin mode: Garmin row marked "Used ✓", iPhone not', (await page.locator('.step-src.used', { hasText: 'Garmin' }).count()) === 1 && (await page.locator('.step-src.used', { hasText: 'iPhone' }).count()) === 0);
  check('Garmin last sent 2.5 h ago: tells them to open Garmin Connect to sync', /last sent steps 2 h 30 min ago/.test(ss2) && /Open Garmin Connect to sync/.test(ss2), ss2.replace(/\s+/g, ' ').slice(-140));
  await page.locator('.health-devices').screenshot({ path: path.join(SHOTS, '09c-steps-by-source.png') }).catch(() => {});
  await page.evaluate(() => {
    window.__E2E_HEALTH__.getStepsBySource = async () => ({ sources: [{ name: 'iPhone', bundleId: 'com.apple.health.X', garmin: false, steps: 9200, lastAt: new Date().toISOString() }] });
    document.dispatchEvent(new Event('visibilitychange'));
  });
  await page.waitForTimeout(400);
  const ss3 = (await page.locator('.step-sources').textContent().catch(() => '')) || '';
  check('Garmin mode but no Garmin steps today: says so and how to turn Steps on in Garmin Connect', /No Garmin steps in Apple Health today/.test(ss3) && /Steps turned on/.test(ss3));
  await page.locator('.health-source button', { hasText: 'Apple Health' }).click();
  await page.waitForTimeout(300);

  // Sync data from: Garmin -> Home shows Garmin's numbers only; back to Apple Health restores them (2026-11-21)
  await page.locator('.health-source button', { hasText: 'Garmin' }).click();
  await page.click('nav >> text=Home').catch(() => {});
  await page.waitForTimeout(2500);
  const homeG = (await page.locator('.metrics').textContent()) || '';
  check('Sync data from Garmin: requests ask for Garmin only and Home shows its steps (6,400) and resting HR (54)', (await page.evaluate(() => window.__lastSource)) === 'garmin' && /6,400/.test(homeG) && /54/.test(homeG), homeG.replace(/\s+/g, ' ').slice(0, 90));
  await page.click('nav >> text=Profile').catch(() => {});
  await page.waitForTimeout(600);
  await page.locator('.health-source button', { hasText: 'Apple Health' }).click();
  await page.click('nav >> text=Home').catch(() => {});
  await page.waitForTimeout(2500);
  const homeA = (await page.locator('.metrics').textContent()) || '';
  check('Toggle back to Apple Health: Home shows Apple Health numbers again (9,200 steps, 58)', /9,200/.test(homeA) && /58/.test(homeA), homeA.replace(/\s+/g, ' ').slice(0, 90));
  await page.click('nav >> text=Profile').catch(() => {});
  await page.waitForTimeout(600);

  // Train > change today's workout: "Sync from Garmin" sits next to "Sync from Apple Fitness" (2026-11-21)
  await page.click('nav >> text=Train').catch(() => {});
  await page.waitForTimeout(800);
  await page.locator('.tbig-edit').first().click().catch(() => {});
  await page.waitForTimeout(500);
  const hasBoth = (await page.locator('.sheet-opt', { hasText: 'Sync from Garmin' }).count()) === 1 && (await page.locator('.sheet-opt', { hasText: 'Sync from Apple Fitness' }).count()) === 1;
  await page.locator('.sheet-opt', { hasText: 'Sync from Garmin' }).click().catch(() => {});
  await page.waitForTimeout(600);
  const src = await page.evaluate(() => window.__store.getState().settings.healthSource);
  const todayK = (await page.locator('.tbig .k').first().textContent().catch(() => '')) || '';
  check('Change workout sheet offers Sync from Garmin; picking it makes today a Garmin sync and Garmin the data source', hasBoth && src === 'garmin' && /Today · Garmin/.test(todayK), `${src} | ${todayK}`);
  await page.screenshot({ path: path.join(SHOTS, '11-train-garmin-sync.png') }).catch(() => {});

  // Owner 2026-11-21 (friend's Garmin): ALREADY on Garmin, picking "Sync from Garmin" emptied today's list and
  // nothing re-read Apple Health - the Garmin workout only appeared after switching to Apple Fitness (a source
  // change forced a re-read). Picking a sync day must fetch today's workouts itself: no source change, no reopen.
  await page.evaluate(() => {
    const st = window.__store.getState();
    const i = new Date().getDay();
    const key = st.weekPlan.find((p) => p.type === 'train' && p.key)?.key;
    st.setDayWorkout(i, key);
    const real = window.__E2E_HEALTH__.getTodayWorkouts;
    window.__wkFetches = 0;
    window.__E2E_HEALTH__.getTodayWorkouts = async (o) => { window.__wkFetches++; return real(o); };
  });
  await page.waitForTimeout(400);
  const before = await page.evaluate(() => ({ src: window.__store.getState().settings.healthSource, type: window.__store.getState().weekPlan[new Date().getDay()].type }));
  await page.locator('.tbig-edit').first().click().catch(() => {});
  await page.waitForTimeout(500);
  await page.locator('.sheet-opt', { hasText: 'Sync from Garmin' }).click().catch(() => {});
  await page.waitForTimeout(1500);
  const after = await page.evaluate(() => ({ n: window.__wkFetches, list: (window.__store.getState().today.availableWatchWorkouts || []).length, src: window.__store.getState().settings.healthSource }));
  check('Already on Garmin: picking "Sync from Garmin" re-reads Apple Health at once and lists the Garmin workout', before.src === 'garmin' && before.type === 'train' && after.src === 'garmin' && after.n >= 1 && after.list > 0, JSON.stringify({ before, after }));
  await page.click('nav >> text=Home').catch(() => {});
  await page.waitForTimeout(600);
  const homeCard = (await page.locator('.today-card').first().textContent().catch(() => '')) || '';
  check('Home card names Garmin, never Apple Fitness, on a Garmin sync day', /Garmin/.test(homeCard) && !/Apple Fitness/.test(homeCard), homeCard.replace(/\s+/g, ' ').slice(0, 110));
  await page.click('nav >> text=Train').catch(() => {});
  await page.waitForTimeout(400);
  await page.evaluate(() => window.__store.getState().setHealthSource('health'));
  await page.click('nav >> text=Profile').catch(() => {});
  await page.waitForTimeout(500);

  // Onboarding "About you": Which watch? Garmin shows the one Garmin Connect step (owner 2026-11-21)
  await page.evaluate(() => window.__store.setState({ onboarded: false }));
  await page.waitForTimeout(800);
  await page.locator('.onb2-welcome button').last().click().catch(() => {});
  await page.waitForTimeout(300);
  await page.locator('.onb2-path').first().click().catch(() => {});
  await page.locator('.onb2-cta').click().catch(() => {});
  await page.waitForTimeout(400);
  const hasQ = await page.getByText('Which watch do you use?').count();
  await page.locator('.onb2-watch button', { hasText: 'Garmin' }).click().catch(() => {});
  const hint = (await page.locator('.onb2-watch-hint').textContent().catch(() => '')) || '';
  check('Onboarding asks which watch; Garmin shows the Garmin Connect -> Apple Health step', hasQ === 1 && /Connected Apps → Apple Health/.test(hint), hint.slice(0, 80));
  check('Choosing Garmin in onboarding makes Garmin the data source', (await page.evaluate(() => window.__store.getState().settings.healthSource)) === 'garmin');
  await page.evaluate(() => window.__store.getState().setHealthSource('health'));
  await page.screenshot({ path: path.join(SHOTS, '10-onboarding-watch.png') }).catch(() => {});
  await page.evaluate(() => window.__store.setState({ onboarded: true }));

  check('No JavaScript errors on any screen', consoleErrors.length === 0, consoleErrors.slice(0, 2).join(' | '));
} finally {
  await browser.close();
  server.kill();
}
const failed = results.filter((r) => !r.ok).length;
console.log(`\n${results.length - failed}/${results.length} screen checks passed. Screenshots: ${SHOTS}`);
process.exit(failed ? 1 : 0);
