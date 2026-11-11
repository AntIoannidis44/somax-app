import { useEffect, useState } from 'react';
import { buildRunPlan, type RunPlan, type RunPlanInput } from './running';

// The user's current goal plan. Local-first for now (localStorage); the
// goal_plan_runs table in supabase/migrations/20261112_library_items.sql
// is where this moves so it follows the account across devices and so
// start -> retest -> finish outcomes can calibrate the engines.

export interface PlanResult {
  date: string; // ISO
  sec: number;
  kind: 'start' | 'retest' | 'finish';
}

export interface ActivePlan {
  sport: 'running';
  goalLabel: string;
  input: RunPlanInput;
  // The plan regenerates from here whenever a new time is logged.
  startedAt: string;
  originalStartAt: string;
  results: PlanResult[];
}

const KEY = 'somax.activePlan.v1';
const listeners = new Set<() => void>();

function read(): ActivePlan | null {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as ActivePlan) : null;
  } catch {
    return null;
  }
}

function write(plan: ActivePlan | null) {
  try {
    if (plan) localStorage.setItem(KEY, JSON.stringify(plan));
    else localStorage.removeItem(KEY);
  } catch {
    // Storage unavailable - plan lives for this session only.
  }
  memo = plan;
  listeners.forEach((l) => l());
}

let memo: ActivePlan | null = read();

export function useActivePlan(): ActivePlan | null {
  const [plan, setPlan] = useState(memo);
  useEffect(() => {
    const l = () => setPlan(memo);
    listeners.add(l);
    return () => {
      listeners.delete(l);
    };
  }, []);
  return plan;
}

export function startPlan(goalLabel: string, input: RunPlanInput) {
  const now = new Date().toISOString();
  write({
    sport: 'running',
    goalLabel,
    input,
    startedAt: now,
    originalStartAt: now,
    results: input.currentSec ? [{ date: now, sec: input.currentSec, kind: 'start' }] : [],
  });
}

export function endPlan() {
  write(null);
}

// A logged time trial re-plans the rest of the block from the new time:
// faster than expected -> shorter plan and quicker paces, slower -> the
// opposite. That's the adapt-to-you loop.
export function logPlanTime(sec: number, finish = false) {
  const p = memo;
  if (!p) return;
  const now = new Date().toISOString();
  write({
    ...p,
    input: { ...p.input, currentSec: sec },
    startedAt: now,
    results: [...p.results, { date: now, sec, kind: finish ? 'finish' : 'retest' }],
  });
}

export function planFor(p: ActivePlan): RunPlan {
  return buildRunPlan(p.input);
}

export function currentWeekIndex(p: ActivePlan, plan: RunPlan): number {
  const days = Math.floor((Date.now() - new Date(p.startedAt).getTime()) / 86400000);
  return Math.min(plan.weeks.length - 1, Math.max(0, Math.floor(days / 7)));
}
