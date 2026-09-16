import { WEEK_PLAN, WORKOUTS } from '../data/workouts';
import type { PlanDay, TodayGoal, WorkoutState } from '../types';

export function todayPlanIndex(simDay: number): number {
  return simDay % 7;
}

export function todayPlan(simDay: number): PlanDay {
  return WEEK_PLAN[todayPlanIndex(simDay)];
}

export function dayLabel(simDay: number): string {
  const plan = todayPlan(simDay);
  const name = plan.type === 'train' && plan.key ? WORKOUTS[plan.key].name : 'Recovery Day';
  return `Day ${simDay + 1} · ${name}`;
}

export function buildTodayGoals(simDay: number): TodayGoal[] {
  const plan = todayPlan(simDay);
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
