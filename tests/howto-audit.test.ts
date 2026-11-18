// Image audit: resolve EVERY exercise name the app can show, using the app's own matcher.
import fs from 'node:fs';
import path from 'node:path';
import { it } from 'vitest';
import { candidates } from '../src/lib/exerciseHowTo';
import { WORKOUTS } from '../src/data/workouts';

// Run only on demand: AUDIT_LOOKUP=<lookup.json> npx vitest run tests/howto-audit.test.ts
it.runIf(!!process.env.AUDIT_LOOKUP)('image audit', () => {
const data = JSON.parse(fs.readFileSync(process.env.AUDIT_LOOKUP!, 'utf8'));
const out: Record<string, { programs: string[]; idx: number | null; link: boolean }> = {};
function add(name: string, prog: string) {
  if (!name) return;
  let idx: number | null = null; let link = false;
  for (const k of candidates(name)) { if (data.lookup[k] !== undefined) { idx = data.lookup[k]; break; } }
  if (idx === null) for (const k of candidates(name)) if (data.links?.[k]) { link = true; break; }
  const o = (out[name] ??= { programs: [], idx, link });
  if (o.programs.length < 4) o.programs.push(prog);
}
function walk(dir: string) {
  for (const f of fs.readdirSync(dir)) {
    const p = path.join(dir, f);
    if (fs.statSync(p).isDirectory()) { walk(p); continue; }
    if (!f.endsWith('.json')) continue;
    const d = JSON.parse(fs.readFileSync(p, 'utf8'));
    const items = Array.isArray(d) ? d : d.items || d.programs || [];
    for (const it of items) for (const e of it.exercises || it.content?.exercises || []) add(e.name, it.name);
  }
}
walk('src/data/library');
const W = WORKOUTS;
for (const w of Object.values(W) as any[]) for (const e of w.exercises) add(e.name, `Built-in: ${w.name}`);
for (const n of JSON.parse(fs.readFileSync('../exercise-howto/build/user_program_names.json', 'utf8'))) add(n, 'User program');
fs.writeFileSync('../exercise-howto/build/audit_resolved.json', JSON.stringify(out, null, 1));
const v = Object.values(out);
console.log('names', v.length, 'picture', v.filter((x) => x.idx !== null).length, 'link', v.filter((x) => x.link).length, 'none', v.filter((x) => x.idx === null && !x.link).length);

});
