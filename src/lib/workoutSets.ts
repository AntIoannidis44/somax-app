import type { ExerciseDef, SetDef } from '../types';

// Splits an exercise into its individual sets. Newer programs store this as
// setList; older ones use flat "12, 10, 8" style strings, so those are split
// here (and padded with the last value if there are fewer entries than sets).
export function expandSets(ex: ExerciseDef): SetDef[] {
  if (ex.setList && ex.setList.length > 0) return ex.setList;
  const count = Math.max(1, ex.sets || 1);
  const repParts = ex.reps.split(',').map((r) => r.trim()).filter(Boolean);
  const weightParts = (ex.weight ?? '').split(',').map((w) => w.trim()).filter(Boolean);
  return Array.from({ length: count }, (_, i) => ({
    reps: repParts[i] ?? repParts[repParts.length - 1] ?? ex.reps,
    weight: weightParts[i] ?? weightParts[weightParts.length - 1] ?? undefined,
  }));
}

export interface SetRow {
  exIndex: number;
  setIndex: number;
  reps: string;
  weight?: string;
}

// A block is one numbered section on screen: a single exercise (1, 6, 7, ...)
// or a superset (2a + 2b, 9a..9e for core). Each item keeps its own sets so
// the screen can show "Set 1, Set 2, ..." under every exercise.
export interface BlockItem {
  exIndex: number;
  label: string;
  sets: SetRow[];
}

export interface WorkoutBlock {
  number: number;
  superset: boolean;
  group?: string;
  items: BlockItem[];
}

const LETTERS = 'abcdefghijklmnopqrstuvwxyz';

export function buildBlocks(exercises: ExerciseDef[]): WorkoutBlock[] {
  const blocks: WorkoutBlock[] = [];
  let i = 0;
  while (i < exercises.length) {
    const group = exercises[i].group;
    let j = i + 1;
    if (group) while (j < exercises.length && exercises[j].group === group) j++;
    const number = blocks.length + 1;
    const superset = !!group && j - i > 1;
    const items: BlockItem[] = [];
    for (let e = i; e < j; e++) {
      const label = superset ? `${number}${LETTERS[e - i]}` : `${number}`;
      const sets = expandSets(exercises[e]).map((set, r) => ({ exIndex: e, setIndex: r, ...set }));
      items.push({ exIndex: e, label, sets });
    }
    blocks.push({ number, superset, group: superset ? group : undefined, items });
    i = j;
  }
  return blocks;
}

export function setKey(exIndex: number, setIndex: number): string {
  return `${exIndex}-${setIndex}`;
}
