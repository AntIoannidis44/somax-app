import { WORKOUTS } from '../data/workouts';
import type { PlanDay, TodayGoal, WorkoutState } from '../types';

export function todayPlanIndex(simDay: number): number {
  return simDay % 7;
}

export function todayPlan(simDay: number, weekPlan: PlanDay[]): PlanDay {
  return weekPlan[todayPlanIndex(simDay)];
}

export function dayLabel(simDay: number, weekPlan: PlanDay[]): string {
  const plan = todayPlan(simDay, weekPlan);
  const name = plan.type === 'train' && plan.key ? WORKOUTS[plan.key].name : 'Recovery Day';
  return `Day ${simDay + 1} · ${name}`;
}

// Chooses which of the 4 workout types to favor and in what order, based on
// the goals picked in Training preferences. Not a real periodization model -
// a simple, defensible heuristic: strength-leaning goals get the classic
// push/pull/legs rotation, cardio-leaning goals interleave conditioning
// days in place of some of them, and picking both blends the two.
function workoutOrderFor(goals: string[]): string[] {
  const wantsStrength = goals.includes('Build strength') || goals.includes('Muscle gain');
  const wantsCardio = goals.includes('Lose fat') || goals.includes('Endurance');
  if (wantsCardio && !wantsStrength) return ['cond', 'push', 'cond', 'pull', 'cond', 'legs'];
  if (wantsCardio) return ['push', 'cond', 'pull', 'legs', 'cond'];
  return ['push', 'pull', 'legs', 'cond'];
}

// Spreads `availability` training days as evenly as possible across the
// 7-day week (e.g. 3 days -> roughly every other day, 5 days -> only 2
// rest days), then assigns workout types from `workoutOrderFor` in order.
export function generateWeekPlan(availability: string, goals: string[]): PlanDay[] {
  const days = Math.max(2, Math.min(6, parseInt(availability, 10) || 4));
  const order = workoutOrderFor(goals);
  const plan: PlanDay[] = new Array(7).fill(null).map(() => ({ type: 'rest' as const }));
  const used = new Set<number>();
  const slots = Array.from({ length: days }, (_, i) => Math.round((i * 7) / days))
    .map((slot) => {
      let s = slot;
      while (used.has(s)) s = (s + 1) % 7;
      used.add(s);
      return s;
    })
    .sort((a, b) => a - b);
  slots.forEach((slot, i) => {
    const key = order[i % order.length];
    plan[slot] = { type: 'train', key, label: WORKOUTS[key].name };
  });
  return plan;
}

export function buildTodayGoals(simDay: number, weekPlan: PlanDay[]): TodayGoal[] {
  const plan = todayPlan(simDay, weekPlan);
  const goals: TodayGoal[] = [];
  if (plan.type === 'train' && plan.key) {
    const w = WORKOUTS[plan.key];
    goals.push({ id: 'workout', label: `Complete ${w.name}`, meta: w.duration, xp: 40, type: 'workout', done: false });
  } else {
    goals.push({ id: 'mobility_rest', label: 'Mobility & stretch (10 min)', meta: 'Recovery day', xp: 15, type: 'toggle', done: false });
  }
  goals.push({ id: 'warmup', label: 'Warm-up & mobility (5 min)', meta: 'Habit', xp: 10, type: 'toggle', done: false });
  goals.push({ id: 'hydration', label: 'Hit hydration target', meta: '2.5L', xp: 10, type: 'toggle', done: false });
  goals.push({ id: 'logfeel', label: 'Log how you felt', meta: '30 sec', xp: 10, type: 'toggle', done: false });
  return goals;
}

export function isWorkoutDone(workoutState: WorkoutState, simDay: number, wid: string): boolean {
  const ws = workoutState[simDay]?.[wid];
  return !!ws?.completed;
}

export interface TodayMetrics {
  steps: number;
  stepsGoal: number;
  kcal: number;
  kcalGoal: number;
  mins: number;
  minsGoal: number;
  hr: number;
}

export function todayMetrics(simDay: number, goalsDone: number, workoutDone: boolean): TodayMetrics {
  const seed = (simDay * 7919 + 311) % 997;
  return {
    steps: 2400 + seed * 3 + goalsDone * 850 + (workoutDone ? 4200 : 0),
    stepsGoal: 10000,
    kcal: 380 + Math.round(seed * 0.6) + goalsDone * 95 + (workoutDone ? 420 : 0),
    kcalGoal: 1600,
    mins: 8 + goalsDone * 6 + (workoutDone ? 48 : 0),
    minsGoal: 60,
    hr: 62 + (seed % 9) + (workoutDone ? 6 : 0),
  };
}
