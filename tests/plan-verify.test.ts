// On-demand verification of the image gap plan: PLAN_ROWS=<rows.json> npx vitest run tests/plan-verify.test.ts
import fs from 'node:fs';
import { it } from 'vitest';
import { nameMatchesPicture } from '../src/lib/howtoNameMatch';
it.runIf(!!process.env.PLAN_ROWS)('plan verify', () => {
  const rows = JSON.parse(fs.readFileSync(process.env.PLAN_ROWS!, 'utf8'));
  const pics = JSON.parse(fs.readFileSync('../exercise-howto/audit/picture_names.json', 'utf8'));
  const planAka = fs.existsSync('../exercise-howto/plan/planned_aka.json') ? JSON.parse(fs.readFileSync('../exercise-howto/plan/planned_aka.json', 'utf8')) : {};
  const existing = Object.values(pics) as { name: string; aka: string[] }[];
  const byName = new Map(existing.map((p) => [p.name, p]));
  const out: any = { B: [], C: [], D: [], E: [] };
  const planned = new Map<string, string[]>();
  for (const r of rows) {
    if (r.decision === 'EXISTING') {
      const p = byName.get(r.image_or_reason);
      if (!p) out.B.push({ ex: r.exercise, why: 'no such picture ' + r.image_or_reason });
      else if (!nameMatchesPicture(r.exercise, p.name, p.aka)) out.B.push({ ex: r.exercise, pic: p.name });
    }
    if (r.decision === 'NEW') { const l = planned.get(r.image_or_reason) ?? []; l.push(r.exercise); planned.set(r.image_or_reason, l); }
  }
  for (const [img, names] of planned) {
    for (const n of names) if (!nameMatchesPicture(n, img, planAka[img] ?? [])) out.C.push({ ex: n, img });
    for (const p of existing) {
      const hit = [img, ...names].filter((n) => nameMatchesPicture(n, p.name, p.aka));
      if (hit.length) out.D.push({ img, existing: p.name, matched: hit });
    }
    for (const [img2] of planned) if (img2 !== img && nameMatchesPicture(img, img2, planAka[img2] ?? [])) out.E.push({ img, img2 });
  }
  fs.writeFileSync(process.env.PLAN_OUT!, JSON.stringify(out, null, 1));
  console.log('B', out.B.length, 'C', out.C.length, 'D', out.D.length, 'E', out.E.length);
});
