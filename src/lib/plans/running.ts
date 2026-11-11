import type { ExerciseDef, WorkoutDef } from '../../types';

// Adaptive running plan engine: current race time + target + days/week ->
// a week-by-week plan whose length, volume and paces depend on the gap.
//
// Fitness model: Jack Daniels & Jimmy Gilbert's VO2/"VDOT" equations - a
// race time maps to one fitness number, and every training pace (easy,
// threshold, interval, repetition) is a fixed % of it. That's what makes a
// 30:00 runner chasing 25:00 get slower paces and a longer build than a
// 26:00 runner chasing the same goal.
//
// CALIBRATION holds every tunable assumption in one place - these are the
// numbers the running research playbook and, later, real user outcomes
// (start time -> retest times -> finish time) are meant to refine.

// Values from scripts/program-library/playbooks/running.json (running
// expert research agent, 2026-11-12) - rates are Somax heuristics bounded
// by Daniels' "~1 VDOT per 4-6 weeks" and 10-20-30 trial results; tune
// them against real retest data from goal_plan_runs.
export const CALIBRATION = {
  // Expected VDOT gain per week, looked up each simulated week so
  // improvement slows as the runner gets fitter.
  vdotGain: [
    { below: 30, gain: 0.5 },
    { below: 35, gain: 0.4 },
    { below: 42, gain: 0.25 },
    { below: 50, gain: 0.18 },
    { below: 58, gain: 0.1 },
    { below: 99, gain: 0.05 },
  ],
  daysMultiplier: { 3: 0.85, 4: 1.0, 5: 1.1 } as Record<number, number>,
  // Stepping-stone targets use the cautious scenario.
  conservative: 0.7,
  levelThresholds: { intermediate: 35, advanced: 48 },
  maxBlockWeeks: { beginner: 16, intermediate: 16, advanced: 18, marathon: 20 },
  // Without a new race/time trial, paces only step up 1 VDOT per this many weeks.
  paceStepWeeks: 5,
  cutbackEvery: 4,
  cutbackVolume: 0.8,
  weeklyVolumeGrowth: 0.06,
  volumeBuildWeeks: 10,
  pct: { easySlow: 0.62, easyFast: 0.7, marathon: 0.8, threshold: 0.88, interval: 0.975, rep: 1.06 },
} as const;

function gainAt(vdot: number): number {
  return (CALIBRATION.vdotGain.find((g) => vdot < g.below) ?? CALIBRATION.vdotGain[CALIBRATION.vdotGain.length - 1]).gain;
}

// Weeks of training until fitness reaches target (simulated week by week).
function simulateWeeks(vFrom: number, vTo: number, days: number, scale = 1, cap = 200): number {
  let v = vFrom, w = 0;
  const mult = CALIBRATION.daysMultiplier[days] ?? 1;
  while (v < vTo && w < cap) {
    v += gainAt(v) * mult * scale;
    w++;
  }
  return w;
}
function simulateVdot(vFrom: number, weeks: number, days: number, scale = 1): number {
  let v = vFrom;
  const mult = CALIBRATION.daysMultiplier[days] ?? 1;
  for (let i = 0; i < weeks; i++) v += gainAt(v) * mult * scale;
  return v;
}

export type RunLevel = 'beginner' | 'intermediate' | 'advanced';

export const RUN_DISTANCES = [
  { id: '5k', label: '5K', meters: 5000, minWeeks: 6, taperWeeks: 1, longRunCapMin: 60 },
  { id: '10k', label: '10K', meters: 10000, minWeeks: 8, taperWeeks: 1, longRunCapMin: 80 },
  { id: 'half', label: 'Half marathon', meters: 21097.5, minWeeks: 10, taperWeeks: 2, longRunCapMin: 120 },
  { id: 'marathon', label: 'Marathon', meters: 42195, minWeeks: 16, taperWeeks: 3, longRunCapMin: 150 },
] as const;
export type RunDistanceId = (typeof RUN_DISTANCES)[number]['id'];

export interface RunPlanInput {
  distance: RunDistanceId;
  // Null = can't run the distance yet -> a walk/run build-up instead.
  currentSec: number | null;
  targetSec: number | null;
  daysPerWeek: 3 | 4 | 5;
}

export interface PlanWeek {
  week: number;
  phase: 'base' | 'build' | 'peak' | 'taper' | 'walk-run';
  focus: string;
  cutback: boolean;
  sessions: WorkoutDef[];
}

export interface RunPlan {
  title: string;
  level: RunLevel;
  weeks: PlanWeek[];
  paces: Record<'easy' | 'threshold' | 'interval' | 'rep' | 'goal', string> | null;
  summary: string;
  // Set when the target is too far for one block: a realistic stepping stone.
  milestoneSec: number | null;
}

// ---------- Daniels/Gilbert model ----------

function vo2AtVelocity(v: number): number {
  return -4.6 + 0.182258 * v + 0.000104 * v * v; // v in m/min
}
function pctMaxForDuration(tMin: number): number {
  return 0.8 + 0.1894393 * Math.exp(-0.012778 * tMin) + 0.2989558 * Math.exp(-0.1932605 * tMin);
}
export function vdotFromRace(meters: number, sec: number): number {
  const tMin = sec / 60;
  return vo2AtVelocity(meters / tMin) / pctMaxForDuration(tMin);
}
function velocityForVo2(vo2: number): number {
  const a = 0.000104, b = 0.182258, c = -4.6 - vo2;
  return (-b + Math.sqrt(b * b - 4 * a * c)) / (2 * a);
}
// Seconds per km at a given fraction of VDOT.
function paceAt(vdot: number, pct: number): number {
  return 60000 / velocityForVo2(vdot * pct);
}
// Race time predicted for a VDOT (bisection - vdotFromRace is monotonic).
export function raceTimeForVdot(meters: number, vdot: number): number {
  let lo = 60, hi = 60 * 60 * 10;
  for (let i = 0; i < 60; i++) {
    const mid = (lo + hi) / 2;
    if (vdotFromRace(meters, mid) > vdot) lo = mid;
    else hi = mid;
  }
  return Math.round((lo + hi) / 2);
}

export function levelForVdot(vdot: number): RunLevel {
  if (vdot >= CALIBRATION.levelThresholds.advanced) return 'advanced';
  if (vdot >= CALIBRATION.levelThresholds.intermediate) return 'intermediate';
  return 'beginner';
}

// ---------- formatting ----------

export function fmtTime(sec: number): string {
  const s = Math.round(sec);
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), r = s % 60;
  return h ? `${h}:${String(m).padStart(2, '0')}:${String(r).padStart(2, '0')}` : `${m}:${String(r).padStart(2, '0')}`;
}
export function parseTime(text: string): number | null {
  const parts = text.trim().split(':').map((p) => Number(p));
  if (!parts.length || parts.some((p) => !Number.isFinite(p) || p < 0)) return null;
  const sec = parts.reduce((acc, p) => acc * 60 + p, 0);
  return sec > 0 ? sec : null;
}
function fmtPace(secPerKm: number): string {
  return `${fmtTime(secPerKm)}/km`;
}

// ---------- session builders ----------

const ex = (name: string, reps: string, sets = 1, extra: Partial<ExerciseDef> = {}): ExerciseDef => ({ name, sets, reps, ...extra });

function session(name: string, exercises: ExerciseDef[]): WorkoutDef {
  const mins = exercises.reduce((sum, e) => {
    const m = /(\d+(?:\.\d+)?)\s*min/.exec(e.reps);
    return sum + (m ? Number(m[1]) * e.sets : e.sets * 3);
  }, 0);
  return { name, category: 'run', duration: `${Math.max(15, Math.round(mins / 5) * 5)} min`, exercises };
}

interface Paces { easy: string; threshold: string; interval: string; rep: string; goal: string }

function paceSet(vdot: number, goalSecPerKm: number): Paces {
  const p = CALIBRATION.pct;
  return {
    easy: `${fmtTime(paceAt(vdot, p.easyFast))}-${fmtPace(paceAt(vdot, p.easySlow))}`,
    threshold: fmtPace(paceAt(vdot, p.threshold)),
    interval: fmtPace(paceAt(vdot, p.interval)),
    rep: fmtPace(paceAt(vdot, p.rep)),
    goal: fmtPace(goalSecPerKm),
  };
}

const warmup = () => ex('Warm-up jog + drills', '10 min');
const cooldown = () => ex('Cool-down jog', '5 min');

function easyRun(min: number, pace: Paces, strides = false): WorkoutDef {
  return session(strides ? 'Easy run + strides' : 'Easy run', [
    ex(`Easy run @ ${pace.easy}`, `${min} min`),
    ...(strides ? [ex('Strides (fast, relaxed, walk back)', '20s', 6)] : []),
  ]);
}

function longRun(min: number, pace: Paces): WorkoutDef {
  return session('Long run', [ex(`Long easy run @ ${pace.easy}`, `${min} min`)]);
}

function quality(phase: PlanWeek['phase'], slot: 1 | 2, level: RunLevel, distance: RunDistanceId, weekInPhase: number, pace: Paces): WorkoutDef {
  const lvl = level === 'beginner' ? 0 : level === 'intermediate' ? 1 : 2;
  if (phase === 'base') {
    return slot === 1
      ? session('Fartlek', [warmup(), ex(`Surges @ ~${pace.threshold}, easy jog between`, '1 min', 6 + lvl * 2 + weekInPhase), cooldown()])
      : session('Hill repeats', [warmup(), ex('Uphill run, strong effort - jog down', '45s', 5 + lvl * 2 + weekInPhase), cooldown()]);
  }
  if (phase === 'build') {
    if (slot === 1) {
      const reps = Math.min(2 + Math.floor(weekInPhase / 2) + lvl, 5);
      return session('Threshold intervals', [warmup(), ex(`Tempo @ ${pace.threshold} (2 min jog between)`, `${level === 'beginner' ? 5 : 8} min`, reps), cooldown()]);
    }
    const reps = Math.min(4 + weekInPhase + lvl, 8);
    return session('VO2 intervals', [warmup(), ex(`Interval @ ${pace.interval} (equal-time jog)`, level === 'beginner' ? '400m' : '800m', reps, { distance: level === 'beginner' ? '400m' : '800m', reps: '' }), cooldown()]);
  }
  if (phase === 'peak') {
    if (slot === 1) {
      const rep = distance === '5k' ? '1km' : distance === '10k' ? '2km' : distance === 'half' ? '3km' : '5km';
      const reps = distance === '5k' ? Math.min(3 + weekInPhase + lvl, 6) : Math.min(2 + weekInPhase + lvl, 4);
      return session('Goal-pace reps', [warmup(), ex(`Goal pace @ ${pace.goal} (2-3 min jog between)`, '', reps, { distance: rep }), cooldown()]);
    }
    return session('Speed reps', [warmup(), ex(`Rep @ ${pace.rep} (full recovery)`, '', 6 + lvl * 2, { distance: '200m' }), cooldown()]);
  }
  // taper
  return session('Sharpener', [warmup(), ex(`Goal pace @ ${pace.goal}`, '', 3, { distance: '400m' }), cooldown()]);
}

function timeTrial(label: string): WorkoutDef {
  return session(`Time trial - ${label}`, [warmup(), ex(`${label} all-out time trial - log your time`, '', 1, { distance: label }), cooldown()]);
}

function raceDay(label: string, pace: Paces): WorkoutDef {
  return session(`Race day - ${label}`, [ex('Easy jog + 4 strides', '10 min'), ex(`${label} goal race @ ${pace.goal}`, '', 1, { distance: label }), ex('Walk + stretch', '10 min')]);
}

// ---------- walk/run build-up (can't run the distance yet) ----------

function walkRunPlan(input: RunPlanInput): RunPlan {
  // Run interval minutes per week; walk recovery shrinks as runs grow.
  const runMin = [1, 1.5, 2, 3, 4, 5, 8, 12, 20, 25, 30];
  const weeks: PlanWeek[] = runMin.map((r, i) => {
    const walk = r < 4 ? 1.5 : r < 10 ? 2 : 0;
    const reps = walk ? Math.max(2, Math.round(24 / (r + walk))) : 1;
    const run: WorkoutDef = walk
      ? session(`Walk/run - ${r} min runs`, [ex('Brisk walk warm-up', '5 min'), ex(`Run ${r} min easy / walk ${walk} min`, `${r + walk} min`, reps), ex('Walk cool-down', '5 min')])
      : session(`Continuous run - ${r} min`, [ex('Brisk walk warm-up', '5 min'), ex('Easy continuous run', `${r} min`), ex('Walk cool-down', '5 min')]);
    const sessions = Array.from({ length: input.daysPerWeek === 3 ? 3 : 3 }, () => run);
    return { week: i + 1, phase: 'walk-run', focus: walk ? `Build to ${r}-minute runs` : `Run ${r} minutes non-stop`, cutback: false, sessions };
  });
  weeks[weeks.length - 1].sessions[2] = timeTrial(RUN_DISTANCES.find((d) => d.id === input.distance)!.label);
  return {
    title: `Run your first ${RUN_DISTANCES.find((d) => d.id === input.distance)!.label}`,
    level: 'beginner',
    weeks,
    paces: null,
    summary: `${weeks.length} weeks of walk/run, 3 sessions a week. Run slowly enough to talk. Repeat any week that felt too hard - there's no rush. Your final session is a time trial: log it and we'll build your next plan from that time.`,
    milestoneSec: null,
  };
}

// ---------- main generator ----------

export function buildRunPlan(input: RunPlanInput): RunPlan {
  const dist = RUN_DISTANCES.find((d) => d.id === input.distance)!;
  if (input.currentSec == null || input.targetSec == null) return walkRunPlan(input);

  const vCur = vdotFromRace(dist.meters, input.currentSec);
  let targetSec = input.targetSec;
  let vTgt = vdotFromRace(dist.meters, targetSec);
  const level = levelForVdot(vCur);
  const days = input.daysPerWeek;
  const maxBlock = input.distance === 'marathon' ? CALIBRATION.maxBlockWeeks.marathon : CALIBRATION.maxBlockWeeks[level];

  // Too big a jump for one block -> a stepping-stone target reachable in
  // one block (cautious scenario, rounded to a friendly :30), then retest.
  let milestoneSec: number | null = null;
  if (simulateWeeks(vCur, vTgt, days) + dist.taperWeeks > maxBlock) {
    const reachable = simulateVdot(vCur, maxBlock - dist.taperWeeks, days, CALIBRATION.conservative);
    milestoneSec = Math.ceil(raceTimeForVdot(dist.meters, reachable) / 30) * 30;
    targetSec = milestoneSec;
    vTgt = vdotFromRace(dist.meters, targetSec);
  }
  // A stepping-stone block runs its full length (the milestone was set
  // cautiously, so there's slack built in); otherwise as long as needed.
  const totalWeeks = milestoneSec ? maxBlock : Math.min(maxBlock, Math.max(dist.minWeeks, simulateWeeks(vCur, vTgt, days) + dist.taperWeeks));
  const taperStart = totalWeeks - dist.taperWeeks + 1;
  const goalPace = targetSec / (dist.meters / 1000);

  const baseEnd = Math.max(1, Math.round(totalWeeks * 0.35));
  const peakStart = taperStart - Math.max(1, Math.round(totalWeeks * 0.25));
  const baseEasy = level === 'beginner' ? 25 : level === 'intermediate' ? 35 : 45;

  const weeks: PlanWeek[] = [];
  for (let w = 1; w <= totalWeeks; w++) {
    const phase: PlanWeek['phase'] = w >= taperStart ? 'taper' : w <= baseEnd ? 'base' : w >= peakStart ? 'peak' : 'build';
    const phaseStart = phase === 'base' ? 1 : phase === 'build' ? baseEnd + 1 : phase === 'peak' ? peakStart : taperStart;
    const weekInPhase = w - phaseStart;
    const cutback = phase !== 'taper' && w % CALIBRATION.cutbackEvery === 0;
    // Paces step up 1 VDOT every few weeks (never past target) - a logged
    // time trial is what moves them faster than that.
    const vWeek = Math.min(vTgt, vCur + Math.floor((w - 1) / CALIBRATION.paceStepWeeks));
    const pace = paceSet(vWeek, goalPace);

    // Volume builds for the first ~10 weeks, then holds - the later weeks
    // get harder through pace, not ever-longer runs.
    const growth = Math.pow(1 + CALIBRATION.weeklyVolumeGrowth, Math.min(w - 1, CALIBRATION.volumeBuildWeeks));
    const vol = cutback ? CALIBRATION.cutbackVolume : phase === 'taper' ? 0.6 : 1;
    const longMin = Math.min(dist.longRunCapMin, Math.round((baseEasy * 1.5 * growth * vol) / 5) * 5);
    // An easy day never outgrows the long run.
    const easyMin = Math.min(Math.round((longMin * 0.7) / 5) * 5, Math.round((baseEasy * growth * vol) / 5) * 5);

    let sessions: WorkoutDef[];
    if (phase === 'taper' && w < totalWeeks) {
      sessions = [quality('peak', 1, level, input.distance, 0, pace), easyRun(easyMin, pace, true), longRun(Math.round(longMin * 0.75 / 5) * 5, pace)];
      if (input.daysPerWeek >= 4) sessions.splice(2, 0, easyRun(Math.max(20, easyMin - 5), pace));
    } else if (phase === 'taper') {
      sessions = [quality('taper', 1, level, input.distance, 0, pace), easyRun(Math.round(easyMin * 0.8 / 5) * 5, pace, true), raceDay(dist.label, pace)];
      if (input.daysPerWeek >= 4) sessions.splice(2, 0, easyRun(20, pace));
    } else {
      const q1 = cutback ? timeTrial(dist.meters >= 21000 ? '5K' : dist.label) : quality(phase, 1, level, input.distance, weekInPhase, pace);
      const q2 = quality(phase, 2, level, input.distance, weekInPhase, pace);
      const easy = easyRun(easyMin, pace, phase !== 'base');
      const long = longRun(longMin, pace);
      sessions =
        input.daysPerWeek === 3
          ? [q1, easy, long]
          : input.daysPerWeek === 4
            ? [q1, easy, level === 'beginner' || cutback ? easyRun(Math.max(20, easyMin - 5), pace) : q2, long]
            : [q1, easy, cutback ? easyRun(easyMin, pace) : q2, easyRun(Math.max(20, easyMin - 5), pace), long];
    }

    const focus =
      phase === 'base' ? 'Aerobic base - mostly easy, a little speed'
      : phase === 'build' ? 'Build - threshold and VO2 work'
      : phase === 'peak' ? 'Peak - practise goal pace'
      : 'Taper - stay sharp, freshen up, race';
    weeks.push({ week: w, phase, focus: cutback ? `${focus} · lighter week + time trial` : focus, cutback, sessions });
  }

  const pacesNow = paceSet(vCur, goalPace);
  return {
    title: `${dist.label} in ${fmtTime(targetSec)}`,
    level,
    weeks,
    paces: pacesNow,
    summary:
      `${totalWeeks}-week plan, ${input.daysPerWeek} runs a week, from ${fmtTime(input.currentSec)} to ${fmtTime(targetSec)}. ` +
      `About 80% of your running is easy - that's what lets the hard sessions work. ` +
      `Every ${CALIBRATION.cutbackEvery}th week is lighter with a time trial: log it and your paces update to match.`,
    milestoneSec,
  };
}
