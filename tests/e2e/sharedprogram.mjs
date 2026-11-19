// Shared program opened inside a message: each set row must show "Set N" and the reps/weight apart
// (owner 2026-11-20: "the set looks combined with the reps or time" - the classes had no CSS).
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const css = fs.readFileSync(path.join(ROOT, 'src/styles/app.css'), 'utf8');
const markup = (n, reps, w) => `<div class="overview-set"><span class="overview-set-no">Set ${n}</span><span>${reps}${w ? ' · ' + w : ''}</span></div>`;
const card = `<div class="dm-bubble program"><div class="program-msg"><div class="program-msg-body"><div class="overview-ex"><div class="ex-name">Flat dumbbell bench press</div>
  <div class="overview-sets">${markup(1, '12', '24 kg')}${markup(2, '10', '24 kg')}${markup(3, '45 s', '')}</div></div></div></div></div>`;
let pass = 0, fail = 0;
const check = (name, ok, d = '') => { console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${d ? '  - ' + d : ''}`); ok ? pass++ : fail++; };
// same installed-browser lookup as tests/e2e/screens.mjs
function browserPath() {
  const base = path.join(os.homedir(), 'Library', 'Caches', 'ms-playwright');
  for (const d of fs.readdirSync(base).filter((x) => x.startsWith('chromium_headless_shell-')).sort().reverse()) {
    const p = path.join(base, d, 'chrome-headless-shell-mac-arm64', 'chrome-headless-shell');
    try { fs.readdirSync(path.dirname(p)); return p; } catch { /* next */ }
  }
  return undefined;
}
const b = await chromium.launch({ executablePath: browserPath() });const p = await b.newPage({ viewport: { width: 390, height: 800 } });
async function measure(withCss) {
  await p.setContent(`<style>${withCss ? css : ''}</style><div style="width:260px">${card}</div>`);
  return p.$$eval('.overview-set', (rows) => rows.map((r) => { const [a, c] = r.querySelectorAll('span'); const A = a.getBoundingClientRect(), C = c.getBoundingClientRect();
    return { gap: C.left - A.right, sameRow: Math.abs(A.top - C.top) < 4, text: r.textContent }; }));
}
const bare = await measure(false);
check('Without the styles the bug reproduces (text runs together)', bare.every((r) => r.gap < 2), bare.map((r) => r.text).join(' | '));
const rows = await measure(true);
check('Each set row: "Set N" and the reps/weight sit on the same row', rows.every((r) => r.sameRow));
check('Clear space between "Set N" and the reps/weight (at least 14 px)', rows.every((r) => r.gap >= 14), rows.map((r) => Math.round(r.gap) + 'px').join(', '));
await p.screenshot({ path: path.join(ROOT, 'tests/e2e/shots/shared-program-sets.png'), clip: { x: 0, y: 0, width: 300, height: 160 } });
await b.close();
console.log(`\n${pass}/${pass + fail} shared-program checks passed.`);
process.exit(fail ? 1 : 0);
