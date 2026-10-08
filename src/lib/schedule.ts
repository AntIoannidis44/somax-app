import { WORKOUTS } from '../data/workouts';
import { getWorkout } from './customWorkouts';
import type { PlanDay, TodayGoal, TrainingFocus, WorkoutState } from '../types';

// weekPlan is a fixed Sun-Sat template that repeats every real calendar
// week - "today's" slot is always the real weekday, independent of
// simDay (which just counts days since onboarding, for streaks/history).
export const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// Matches MetricsRow's step ring target - hitting it awards a one-off
// bonus for the day, same as any other goal, but driven by real Health
// data rather than a tap (see StepChallengeCard + syncHealthMetrics).
export const STEP_GOAL = 8000;
export const STEP_GOAL_XP = 20;

// Matches the hydration goal's "2L" meta text in buildTodayGoals below -
// see HydrationBar for the draggable UI that tracks toward this.
export const HYDRATION_TARGET_ML = 2000;

export function todayPlanIndex(): number {
  return new Date().getDay();
}

export function todayPlan(weekPlan: PlanDay[]): PlanDay {
  return weekPlan[todayPlanIndex()];
}

export function dayLabel(weekPlan: PlanDay[]): string {
  const plan = todayPlan(weekPlan);
  const name =
    plan.type === 'train' && plan.key
      ? getWorkout(plan.key)?.name || 'Workout'
      : plan.type === 'watch'
        ? 'Synced from Watch'
        : 'Recovery Day';
  return `${WEEKDAY_LABELS[todayPlanIndex()]} · ${name}`;
}

// Chooses which workout types to favor and in what order, based on the
// goals and training focus picked in Training preferences. Not a real
// periodization model - a simple, defensible heuristic: focus decides the
// modality (gym vs. run/walk vs. swim vs. ride vs. a blend of all of
// them), and within that, goals tilt the balance further (strength-
// leaning goals get the classic push/pull/legs rotation, cardio-leaning
// goals lean on conditioning or the focus's own cardio modality more).
function workoutOrderFor(goals: string[], focus: TrainingFocus): string[] {
  const wantsStrength = goals.includes('Build strength') || goals.includes('Muscle gain');
  const wantsCardio = goals.includes('Lose fat') || goals.includes('Endurance') || goals.includes('Aerobic fitness');

  if (focus === 'running') {
    if (wantsStrength) return ['run', 'push', 'run', 'walk', 'run', 'legs'];
    return ['run', 'walk', 'run', 'run', 'walk'];
  }
  if (focus === 'swim') {
    if (wantsStrength) return ['swim', 'push', 'swim', 'pull', 'swim', 'legs'];
    return ['swim', 'cond', 'swim', 'swim', 'cond'];
  }
  if (focus === 'ride') {
    if (wantsStrength) return ['ride', 'push', 'ride', 'legs', 'ride', 'pull'];
    return ['ride', 'cond', 'ride', 'ride', 'cond'];
  }
  if (focus === 'hybrid') {
    if (wantsCardio && !wantsStrength) return ['run', 'push', 'walk', 'pull', 'run', 'legs'];
    return ['push', 'run', 'pull', 'legs', 'walk', 'cond'];
  }
  // gym
  if (wantsCardio && !wantsStrength) return ['cond', 'push', 'cond', 'pull', 'cond', 'legs'];
  if (wantsCardio) return ['push', 'cond', 'pull', 'legs', 'cond'];
  return ['push', 'pull', 'legs', 'cond'];
}

// Spreads `availability` training days as evenly as possible across the
// 7-day week (e.g. 3 days -> roughly every other day, 5 days -> only 2
// rest days), then assigns workout types from `workoutOrderFor` in order.
export function generateWeekPlan(availability: string, goals: string[], focus: TrainingFocus = 'gym'): PlanDay[] {
  const days = Math.max(2, Math.min(6, parseInt(availability, 10) || 4));
  const order = workoutOrderFor(goals, focus);
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

// Used by "Revise this week's program": regenerating the whole 7-day
// array from scratch would silently rewrite days that have already
// happened this cycle, which makes no sense - you can't revise the past.
// Keeps indices before `fromIdx` exactly as they were, and only
// redistributes training days across `fromIdx..6`, using however many
// of the target weekly total haven't already happened.
export function reviseWeekPlanFrom(
  oldPlan: PlanDay[],
  fromIdx: number,
  availability: string,
  goals: string[],
  focus: TrainingFocus = 'gym',
): PlanDay[] {
  const targetDays = Math.max(2, Math.min(6, parseInt(availability, 10) || 4));
  const already = oldPlan.slice(0, fromIdx).filter((p) => p.type === 'train').length;
  const remainingSlotCount = 7 - fromIdx;
  const remainingTrainDays = Math.max(0, Math.min(remainingSlotCount, targetDays - already));
  const order = workoutOrderFor(goals, focus);

  const rest: PlanDay[] = new Array(remainingSlotCount).fill(null).map(() => ({ type: 'rest' as const }));
  const used = new Set<number>();
  const slots = Array.from({ length: remainingTrainDays }, (_, i) => Math.round((i * remainingSlotCount) / Math.max(1, remainingTrainDays)))
    .map((slot) => {
      let s = slot;
      while (used.has(s)) s = (s + 1) % remainingSlotCount;
      used.add(s);
      return s;
    })
    .sort((a, b) => a - b);
  slots.forEach((slot, i) => {
    const key = order[i % order.length];
    rest[slot] = { type: 'train', key, label: WORKOUTS[key].name };
  });
  return [...oldPlan.slice(0, fromIdx), ...rest];
}

export function buildTodayGoals(weekPlan: PlanDay[]): TodayGoal[] {
  const plan = todayPlan(weekPlan);
  const goals: TodayGoal[] = [];
  if (plan.type === 'train' && plan.key) {
    const w = getWorkout(plan.key);
    goals.push({ id: 'workout', label: `Complete ${w?.name || 'workout'}`, meta: w?.duration || '', xp: 40, type: 'workout', done: false });
  } else if (plan.type === 'watch') {
    goals.push({
      id: 'watch_workout',
      label: 'Log a workout on Apple Fitness',
      meta: 'Syncs automatically once detected',
      xp: 40,
      type: 'watch',
      done: false,
    });
  } else {
    goals.push({ id: 'mobility_rest', label: 'Mobility & stretch (10 min)', meta: 'Recovery day', xp: 15, type: 'toggle', done: false });
  }
  goals.push({ id: 'warmup', label: 'Warm-up & mobility (5 min)', meta: 'Habit', xp: 10, type: 'toggle', done: false });
  goals.push({ id: 'hydration', label: 'Hit hydration target', meta: '2L', xp: 10, type: 'toggle', done: false });
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
    stepsGoal: 8000,
    kcal: 380 + Math.round(seed * 0.6) + goalsDone * 95 + (workoutDone ? 420 : 0),
    kcalGoal: 1600,
    mins: 8 + goalsDone * 6 + (workoutDone ? 48 : 0),
    minsGoal: 60,
    hr: 62 + (seed % 9) + (workoutDone ? 6 : 0),
  };
}
