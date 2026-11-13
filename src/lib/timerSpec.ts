import type { ExerciseDef } from '../types';

// What kind of timer an exercise needs while tracking, worked out from its
// free-text reps/name (see ExerciseDef.reps: "30s", "1 min", "20s on / 10s
// off", "30s/side", "max"...). Reps-only exercises ("12", "10/leg") get null
// - the general timer button is still there for those.

export type TimerMode = 'timer' | 'stopwatch' | 'intervals';

export interface IntervalStep {
  label: string;
  sec: number;
  rest?: boolean;
}

export interface TimerConfig {
  mode: TimerMode;
  // timer mode
  sec: number;
  sides: boolean; // "/side", "/leg": run it once per side with a switch gap
  // intervals mode: either work/rest x rounds, or a custom cycle (10-20-30)
  work: number;
  rest: number;
  rounds: number;
  cycle?: IntervalStep[];
  // How many of the exercise's sets one full run covers (Tabata = all 8).
  coversSets: number;
  // The next exercise is this one's "Rest" (Tabata protocol) - tick it too.
  pairedRest?: boolean;
}

export const DEFAULT_CONFIG: TimerConfig = {
  mode: 'timer',
  sec: 60,
  sides: false,
  work: 20,
  rest: 10,
  rounds: 8,
  coversSets: 1,
};

const NUM = String.raw`(\d+(?:\.\d+)?)`;

// "30s", "45 sec", "2 min", "1.5 min", "20-30s" (takes the low end), "1:30".
export function parseDuration(text: string): number | null {
  const t = text.toLowerCase();
  const mmss = t.match(/\b(\d{1,2}):(\d{2})\b/);
  if (mmss) return Number(mmss[1]) * 60 + Number(mmss[2]);
  const m = t.match(new RegExp(String.raw`${NUM}(?:\s*-\s*${NUM})?\s*(s|sec|secs|seconds?|m|min|mins|minutes?)\b`));
  if (!m) return null;
  const v = Number(m[1]);
  return Math.round(m[3].startsWith('m') ? v * 60 : v);
}

const SIDE_RE = /\/\s*(side|leg|arm)|each (side|leg|arm)|per (side|leg)/i;

// "20s on / 10s off", "20 s on / 10 s off", "20/10" (only with tabata in the text)
function parseOnOff(text: string): { work: number; rest: number } | null {
  const m = text.match(/(\d+)\s*s(?:ec(?:onds?)?)?\s*on\s*[/,]\s*(\d+)\s*s(?:ec(?:onds?)?)?\s*off/i);
  if (m) return { work: Number(m[1]), rest: Number(m[2]) };
  if (/tabata/i.test(text)) return { work: 20, rest: 10 };
  return null;
}

// "30s easy jog / 20s moderate run / 10s near-sprint, x5"
function parseCycle(text: string): { cycle: IntervalStep[]; rounds: number } | null {
  const parts = text.split('/').map((p) => p.trim());
  if (parts.length < 2) return null;
  const cycle: IntervalStep[] = [];
  for (const p of parts) {
    const m = p.match(/^(?:[^:]*:\s*)?(\d+)\s*s(?:ec)?\s+([a-z][a-z -]*?)(?:,|\s+x\d|$)/i);
    if (!m) return null;
    const label = m[2].trim();
    cycle.push({ label: label.charAt(0).toUpperCase() + label.slice(1), sec: Number(m[1]), rest: /easy|rest|recover/i.test(label) });
  }
  const r = text.match(/x\s*(\d+)\b/i);
  return { cycle, rounds: r ? Number(r[1]) : 1 };
}

export function timerForExercise(ex: ExerciseDef, next?: ExerciseDef): TimerConfig | null {
  const text = `${ex.name} ${ex.reps}`;
  const sets = Math.max(1, ex.sets || 1);
  const dur = parseDuration(ex.reps);

  const onOff = parseOnOff(text);
  if (onOff) {
    // "2 min" of 20/10 = 4 rounds per set; "8 sets of 20s on/10s off" = one 8-round run.
    const per = onOff.work + onOff.rest;
    const repsIsBlock = dur !== null && dur > per;
    return {
      ...DEFAULT_CONFIG,
      mode: 'intervals',
      ...onOff,
      rounds: repsIsBlock ? Math.max(1, Math.round(dur! / per)) : sets > 1 ? sets : 8,
      coversSets: repsIsBlock ? 1 : sets,
    };
  }

  // Work exercise followed by a "Rest" exercise with the same set count
  // (the original Tabata protocol is written this way).
  const nextDur = next ? parseDuration(next.reps) : null;
  if (dur && next && /^rest\b/i.test(next.name.trim()) && nextDur && (next.sets || 1) === sets && sets > 1 && dur <= 120) {
    return { ...DEFAULT_CONFIG, mode: 'intervals', work: dur, rest: nextDur, rounds: sets, coversSets: sets, pairedRest: true };
  }

  const cyc = parseCycle(ex.name) ?? parseCycle(ex.reps);
  if (cyc && cyc.cycle.length >= 2) {
    return { ...DEFAULT_CONFIG, mode: 'intervals', cycle: cyc.cycle, rounds: cyc.rounds, coversSets: 1 };
  }

  if (/^\s*max\b/i.test(ex.reps) || /max hold/i.test(ex.name)) {
    return { ...DEFAULT_CONFIG, mode: 'stopwatch' };
  }

  if (dur && dur >= 5 && dur <= 60 * 60) {
    return { ...DEFAULT_CONFIG, mode: 'timer', sec: dur, sides: SIDE_RE.test(ex.reps) };
  }
  return null;
}

export function fmtClock(sec: number): string {
  const s = Math.max(0, Math.ceil(sec));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

// The short chip shown on an exercise: "0:30", "20/10 ×8", "Stopwatch".
export function timerChipLabel(c: TimerConfig): string {
  if (c.mode === 'stopwatch') return 'Stopwatch';
  if (c.mode === 'intervals') {
    if (c.cycle) return `${c.cycle.map((s) => s.sec).join('-')} ×${c.rounds}`;
    return `${c.work}/${c.rest} ×${c.rounds}`;
  }
  return c.sides ? `${fmtClock(c.sec)}/side` : fmtClock(c.sec);
}

export const GET_READY_SEC = 3;
export const SIDE_SWITCH_SEC = 5;

// The full list of steps one run plays, after a short get-ready.
export function buildSteps(c: TimerConfig): IntervalStep[] {
  const steps: IntervalStep[] = [{ label: 'Get ready', sec: GET_READY_SEC, rest: true }];
  if (c.mode === 'timer') {
    if (c.sides) {
      steps.push({ label: 'Side 1', sec: c.sec }, { label: 'Switch sides', sec: SIDE_SWITCH_SEC, rest: true }, { label: 'Side 2', sec: c.sec });
    } else {
      steps.push({ label: 'Go', sec: c.sec });
    }
    return steps;
  }
  const cycle = c.cycle ?? [
    { label: 'Work', sec: c.work },
    { label: 'Rest', sec: c.rest, rest: true },
  ];
  for (let r = 0; r < c.rounds; r++) {
    for (const s of cycle) steps.push({ ...s, label: `${s.label} · ${r + 1}/${c.rounds}` });
  }
  // No trailing rest after the last work interval.
  if (!c.cycle && steps[steps.length - 1]?.rest) steps.pop();
  return steps;
}
