import type { ChallengeDef, VerifyMetric, VerifySpec } from '../types';
import type { HealthWorkout } from './health';

// Challenges whose progress is counted ONLY from Apple Health data a device
// recorded (owner's rule 2026-11-18: these - and only these - pay coins, see
// lib/coins.ts). Joining one starts a window of `lengthDays` from the join
// date; progress is recomputed from HealthKit every sync, so a day counts
// even if the app wasn't opened that day, and there is no log button.

export type { VerifyMetric, VerifySpec };

const STRENGTH = ['Strength Training', 'Core Training'];
const SPORT_TYPES: Record<string, string[] | undefined> = {
  'strength-training': STRENGTH,
  bodybuilding: STRENGTH,
  powerlifting: STRENGTH,
  calisthenics: STRENGTH,
  running: ['Run'],
  cycling: ['Cycling'],
  swimming: ['Swim'],
  pilates: ['Pilates'],
  'yoga-mobility': ['Yoga', 'Mobility', 'Pilates'],
  hiit: ['HIIT', 'Cross Training', 'Cardio'],
  boxing: ['Boxing'],
  afl: ['AFL'],
  soccer: ['Soccer'],
  basketball: ['Basketball'],
  tennis: ['Tennis'],
  golf: ['Golf'],
  hybrid: ['Strength Training', 'Core Training', 'HIIT', 'Cross Training', 'Cardio', 'Boxing', 'Workout'],
  general: undefined,
};

// Explicit spec wins; otherwise derived from sport + unit for the existing
// pool. Units the watch can't measure (reps, sets, rounds, plank minutes)
// return null and stay self-logged, XP-only.
export function verifySpecFor(def: ChallengeDef): VerifySpec | null {
  if (def.verify) return def.verify;
  if (!(def.sport in SPORT_TYPES)) return null;
  const types = SPORT_TYPES[def.sport];
  switch (def.unit) {
    case 'session':
    case 'workout':
      return { metric: def.id === 'consistency' ? 'activeDays' : 'sessions', types };
    case 'km':
      return def.sport === 'running' || def.sport === 'cycling' || def.sport === 'swimming' ? { metric: 'km', types } : null;
    case 'lap':
      return def.sport === 'swimming' ? { metric: 'laps', types } : null;
    case 'round':
      return def.sport === 'golf' ? { metric: 'sessions', types } : null; // a round of golf = a golf workout
    case 'minute':
      // Plank / wall-sit / hollow-hold minutes aren't a workout the watch records.
      return def.sport === 'calisthenics' ? null : { metric: 'minutes', types };
    case 'day':
      return /get active/i.test(def.desc) ? { metric: 'activeDays', types } : null;
    default:
      return null;
  }
}

// Anti-couch check for a single workout - lenient on purpose (owner: never
// penalise a real lighter session, only a watch left running doing nothing).
const LIGHT = ['Walk', 'Hike', 'Yoga', 'Mobility', 'Pilates', 'Golf'];
export function qualifies(w: HealthWorkout, types?: string[]): boolean {
  if (w.userEntered) return false;
  if (types && !types.includes(w.activityName)) return false;
  if (w.durationMinutes < 10) return false;
  const perMin = w.durationMinutes > 0 ? (w.kcal || 0) / w.durationMinutes : 0;
  return perMin >= (LIGHT.includes(w.activityName) ? 0.8 : 1.3);
}

function localDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function addDays(isoDate: string, n: number): string {
  const d = new Date(`${isoDate}T00:00:00`);
  d.setDate(d.getDate() + n);
  return localDate(d.toISOString());
}

function longestRun(days: string[], from: string, to: string): number {
  const set = new Set(days);
  let best = 0;
  let run = 0;
  for (let d = from; d <= to; d = addDays(d, 1)) {
    run = set.has(d) ? run + 1 : 0;
    best = Math.max(best, run);
  }
  return best;
}

// The challenge's window: join date .. join date + lengthDays - 1 (capped at today).
export function challengeWindow(def: ChallengeDef, joinedAt: string, today: string): { from: string; to: string } {
  const end = addDays(joinedAt, def.lengthDays - 1);
  return { from: joinedAt, to: end < today ? end : today };
}

// Owner's rule (2026-11-18): progress counts for everyone - workouts finished
// in the app and the challenge's log button count toward the challenge (and
// its XP) - but only the Apple Health part counts toward coins.
const IN_APP_CATEGORIES: Record<string, string[] | undefined> = {
  'strength-training': ['gym', 'fitness'],
  bodybuilding: ['gym', 'fitness'],
  powerlifting: ['gym', 'fitness'],
  calisthenics: ['gym', 'fitness'],
  hybrid: ['gym', 'fitness', 'other'],
  hiit: ['gym', 'fitness', 'other'],
  running: ['run'],
  cycling: ['ride'],
  swimming: ['swim'],
  pilates: ['pilates', 'reformer'],
  'yoga-mobility': ['fitness', 'other', 'pilates'],
  boxing: ['other', 'fitness', 'gym'],
  afl: ['other', 'fitness', 'gym'],
  soccer: ['other', 'fitness', 'gym'],
  basketball: ['other', 'fitness', 'gym'],
  tennis: ['other', 'fitness', 'gym'],
  golf: ['other', 'fitness'],
  general: undefined,
};

const DAY_METRICS = new Set(['sessions', 'activeDays', 'workoutStreak']);
// Metrics a challenge's log button can add to (unverified, XP only).
export function manualLogAllowed(spec: VerifySpec): boolean {
  return ['sessions', 'activeDays', 'minutes', 'km', 'laps'].includes(spec.metric);
}

export interface InAppDay {
  date: string;
  category: string;
}

// total = what the challenge shows and completes on (XP); verified = Apple
// Health only (coins). Day-based metrics count each day once, whether the
// watch recorded it, a workout was finished in the app, or both.
export function computeChallengeProgress(
  def: ChallengeDef,
  spec: VerifySpec,
  joinedAt: string,
  today: string,
  workouts: HealthWorkout[],
  dailySteps: { date: string; steps: number }[],
  inAppDays: InAppDay[],
  manual: number,
): { total: number; verified: number } {
  const verified = computeVerifiedProgress(def, spec, joinedAt, today, workouts, dailySteps);
  if (spec.metric === 'stepDays' || spec.metric === 'stepStreak') return { total: verified, verified };
  if (!DAY_METRICS.has(spec.metric)) return { total: verified + manual, verified };
  const { from, to } = challengeWindow(def, joinedAt, today);
  const cats = def.verify ? undefined : IN_APP_CATEGORIES[def.sport];
  const watchDays = workouts
    .filter((w) => qualifies(w, spec.types))
    .map((w) => localDate(w.startDate))
    .filter((d) => d >= from && d <= to);
  const appDays = inAppDays.filter((d) => d.date >= from && d.date <= to && (!cats || cats.includes(d.category))).map((d) => d.date);
  const all = [...new Set([...watchDays, ...appDays])];
  const dayTotal = spec.metric === 'workoutStreak' ? longestRun(all, from, to) : all.length;
  return { total: dayTotal + (spec.metric === 'workoutStreak' ? 0 : manual), verified };
}

export function computeVerifiedProgress(
  def: ChallengeDef,
  spec: VerifySpec,
  joinedAt: string,
  today: string,
  workouts: HealthWorkout[],
  dailySteps: { date: string; steps: number }[],
): number {
  const { from, to } = challengeWindow(def, joinedAt, today);
  const inWindow = (date: string) => date >= from && date <= to;
  if (spec.metric === 'stepDays' || spec.metric === 'stepStreak') {
    const goal = spec.dailySteps ?? Infinity; // every step challenge sets its own daily target
    const hitDays = dailySteps.filter((d) => inWindow(d.date) && d.steps >= goal).map((d) => d.date);
    return spec.metric === 'stepDays' ? hitDays.length : longestRun(hitDays, from, to);
  }
  const ok = workouts.filter((w) => inWindow(localDate(w.startDate)) && qualifies(w, spec.types));
  const days = [...new Set(ok.map((w) => localDate(w.startDate)))];
  switch (spec.metric) {
    case 'sessions':
    case 'activeDays':
      return days.length; // at most one per day - one workout can't be split into several
    case 'workoutStreak':
      return longestRun(days, from, to);
    case 'minutes':
      return Math.floor(ok.reduce((n, w) => n + w.durationMinutes, 0));
    case 'km':
      return Math.floor(ok.reduce((n, w) => n + (w.distanceMeters ?? 0), 0) / 100) / 10;
    case 'laps':
      return ok.reduce((n, w) => n + (w.lapLengthMeters ? Math.floor((w.distanceMeters ?? 0) / w.lapLengthMeters) : 0), 0);
    default:
      return 0;
  }
}
