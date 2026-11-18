// Verification gate: every exercise name that opens a how-to picture must match that picture's own
// name (or one of its reviewed alternative names). Runs with the normal test suite.
import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { findHowToIndex } from '../src/lib/exerciseHowTo';
import { nameMatchesPicture } from '../src/lib/howtoNameMatch';
import { WORKOUTS } from '../src/data/workouts';

const data = JSON.parse(fs.readFileSync('public/data/exercise-howto.json', 'utf8'));

function allExerciseNames(): Map<string, string> {
  const out = new Map<string, string>();
  const walk = (dir: string) => {
    for (const f of fs.readdirSync(dir)) {
      const p = path.join(dir, f);
      if (fs.statSync(p).isDirectory()) { walk(p); continue; }
      if (!f.endsWith('.json')) continue;
      const d = JSON.parse(fs.readFileSync(p, 'utf8'));
      const items = Array.isArray(d) ? d : d.items || d.programs || [];
      for (const it of items) for (const e of it.exercises || it.content?.exercises || []) if (e.name && !out.has(e.name)) out.set(e.name, it.name);
    }
  };
  walk('src/data/library');
  for (const w of Object.values(WORKOUTS) as any[]) for (const e of w.exercises) if (!out.has(e.name)) out.set(e.name, `Built-in: ${w.name}`);
  const users = '../exercise-howto/build/user_program_names.json';
  if (fs.existsSync(users)) for (const n of JSON.parse(fs.readFileSync(users, 'utf8'))) if (!out.has(n)) out.set(n, 'User program');
  return out;
}

describe('how-to picture name gate', () => {
  it('every picture that any exercise opens has its own name', () => {
    const unnamed = new Set<number>();
    for (const n of allExerciseNames().keys()) {
      const i = findHowToIndex(data.lookup, n);
      if (i !== undefined && !data.entries[i].name) unnamed.add(i);
    }
    expect([...unnamed]).toEqual([]);
  });

  it('every exercise name matches the name of the picture it opens', () => {
    const fails: { exercise: string; picture: string; program: string }[] = [];
    for (const [n, prog] of allExerciseNames()) {
      const i = findHowToIndex(data.lookup, n);
      if (i === undefined) continue;
      const e = data.entries[i];
      if (!nameMatchesPicture(n, e.name ?? '', e.aka ?? [])) fails.push({ exercise: n, picture: e.name, program: prog });
    }
    if (process.env.GATE_OUT) fs.writeFileSync(process.env.GATE_OUT, JSON.stringify(fails, null, 1));
    expect(fails.map((f) => `${f.exercise}  ->  ${f.picture}`)).toEqual([]);
  });

  it('rule examples', () => {
    expect(nameMatchesPicture('Flat dumbbell bench press (drop set)', 'Dumbbell Bench Press (flat)')).toBe(true);
    expect(nameMatchesPicture('Bench Press – top set', 'Barbell Bench Press (flat)')).toBe(true);
    expect(nameMatchesPicture('Station 3: Forward Lunge', 'Dumbbell Forward Lunge')).toBe(true);
    expect(nameMatchesPicture('Incline Dumbbell Press', 'Dumbbell Bench Press (flat)')).toBe(false);
    expect(nameMatchesPicture('Flat Bench Press', 'Barbell Incline Bench Press')).toBe(false);
    expect(nameMatchesPicture('Seated Dumbbell Press', 'Standing Dumbbell Overhead Press')).toBe(false);
    expect(nameMatchesPicture('Single-arm Cable Row', 'Seated Cable Row (two-hand)')).toBe(false);
    expect(nameMatchesPicture('Plank Saw', 'Forearm Plank')).toBe(false);
  });
});

describe('name gate - number and prop rules', () => {
  it('numbers in a picture name must match', () => {
    expect(nameMatchesPicture('Warrior 1', 'Warrior 2')).toBe(false);
    expect(nameMatchesPicture('Station 10: Leg Tuck', '90/90 Hip Stretch', ['90/90 Hold'])).toBe(false);
    expect(nameMatchesPicture('90/90 hip hold', '90/90 Hip Stretch', ['90/90 Hip Hold'])).toBe(true);
  });
  it('floor press and bench press are different exercises', () => {
    expect(nameMatchesPicture('Dumbbell Floor Press', 'Dumbbell Bench Press (flat)', ['Flat Dumbbell Press'])).toBe(false);
    expect(nameMatchesPicture('Dumbbell Bench Press', 'Dumbbell Shoulder Press (seated)', ['Seated Dumbbell Press'])).toBe(false);
  });
});
