import { workoutTypeById } from '../../data/workoutTypes';
import type { IconName } from '../../data/icons';
import type { WeightGoal } from '../../lib/weightGoals';
import type { FitnessGoal } from '../../lib/fitnessGoals';

// XP amounts mirror the store: WEIGHT_LOG_XP / WEIGHT_GOAL_BONUS_XP and
// the 20 XP awardFitnessGoalXP call sites (WorkoutScreen, App sync).
export interface GoalView {
  key: string;
  icon: IconName;
  colorVar: string;
  title: string;
  meta: string;
  pct: number | null;
  due: string;
  xp: string;
  xpShort: string;
  verify: string;
  best?: number | null;
  target?: number | null;
}

export function formatMMSS(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = Math.round(totalSeconds % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

export function daysLeft(dateStr: string): number {
  const end = new Date(`${dateStr}T23:59:59`);
  return Math.max(0, Math.ceil((end.getTime() - Date.now()) / 86400000));
}

export function shortDate(dateStr: string): string {
  return new Date(`${dateStr}T12:00:00`).toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
}

const clamp = (v: number) => Math.max(0, Math.min(100, Math.round(v)));

export function weightGoalView(goal: WeightGoal, latest: number): GoalView {
  const span = Math.abs(goal.target_weight_kg - goal.start_weight_kg) || 1;
  const moved = goal.direction === 'gain' ? latest - goal.start_weight_kg : goal.start_weight_kg - latest;
  return {
    key: `w-${goal.id}`,
    icon: 'scale',
    colorVar: '--stat-recovery',
    title: `${goal.direction === 'gain' ? 'Build up to' : 'Lean down to'} ${goal.target_weight_kg} kg`,
    meta: `${latest.toFixed(1)} kg now · ${Math.max(0, span - moved).toFixed(1)} kg to go`,
    pct: clamp((moved / span) * 100),
    due: goal.target_date,
    xp: '+20 XP per weigh-in · +80 at goal',
    xpShort: '+80',
    verify: 'Scale photo weigh-ins',
  };
}

export function fitnessGoalView(g: FitnessGoal): GoalView {
  const wt = workoutTypeById(g.sport === 'any' ? null : g.sport);
  const sport = wt?.label ?? 'Any';
  const base = { key: g.id, due: g.period_end, xpShort: '+20', verify: 'Checked against Apple Health' };
  if (g.goal_type === 'distance_time') {
    const target = g.target_seconds ?? 0;
    return {
      ...base,
      icon: wt?.icon ?? 'clock',
      colorVar: wt?.colorVar ?? '--stat-endurance',
      title: `${sport} ${((g.target_distance_m ?? 0) / 1000).toFixed(1).replace(/\.0$/, '')} km under ${formatMMSS(target)}`,
      meta:
        g.best_seconds == null
          ? 'No attempt yet'
          : g.best_seconds > target
            ? `Best ${formatMMSS(g.best_seconds)} · ${g.best_seconds - target}s to go`
            : `Beaten with ${formatMMSS(g.best_seconds)}`,
      pct: null,
      xp: '+20 XP when you beat it',
      best: g.best_seconds,
      target,
    };
  }
  if (g.goal_type === 'distance_total') {
    const targetKm = (g.target_distance_m ?? 0) / 1000;
    return {
      ...base,
      icon: wt?.icon ?? 'run',
      colorVar: wt?.colorVar ?? '--stat-agility',
      title: `${sport} ${targetKm.toFixed(0)} km by ${shortDate(g.period_end)}`,
      meta: `${(g.progress_distance_m / 1000).toFixed(1)} of ${targetKm.toFixed(0)} km`,
      pct: clamp((g.progress_distance_m / (g.target_distance_m || 1)) * 100),
      xp: '+20 XP per activity',
      verify: 'Adds up Apple Health activities',
    };
  }
  return {
    ...base,
    icon: g.sport === 'any' ? 'flame' : (wt?.icon ?? 'flame'),
    colorVar: g.sport === 'any' ? '--stat-discipline' : (wt?.colorVar ?? '--stat-discipline'),
    title: `Train ${g.target_count} times${wt ? ` (${sport})` : ''}`,
    meta: `${g.progress_count} of ${g.target_count} sessions`,
    pct: clamp((g.progress_count / (g.target_count || 1)) * 100),
    xp: '+20 XP per session',
    verify: 'Logged or synced workouts count',
  };
}
