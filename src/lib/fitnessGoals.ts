import { supabase } from './supabase';

export type FitnessGoalType = 'distance_time' | 'distance_total' | 'frequency';

export interface FitnessGoal {
  id: string;
  user_id: string;
  goal_type: FitnessGoalType;
  // A WORKOUT_TYPES id (run/ride/swim/walk/gym/fitness/other), or 'any' -
  // only frequency goals meaningfully use 'any' (distance goals need a
  // sport that actually reports a distance).
  sport: string;
  target_distance_m: number | null;
  target_seconds: number | null;
  target_count: number | null;
  period_start: string;
  period_end: string;
  status: 'active' | 'completed' | 'abandoned';
  progress_distance_m: number;
  progress_count: number;
  best_seconds: number | null;
  created_at: string;
  updated_at: string;
}

export async function fetchActiveFitnessGoals(userId: string): Promise<FitnessGoal[]> {
  const { data, error } = await supabase
    .from('fitness_goals')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'active')
    .order('created_at', { ascending: false });
  if (error) {
    console.error('[fitnessGoals] fetchActiveFitnessGoals:', error.message);
    return [];
  }
  return data as FitnessGoal[];
}

export async function createFitnessGoal(
  userId: string,
  input: {
    goalType: FitnessGoalType;
    sport: string;
    targetDistanceM?: number;
    targetSeconds?: number;
    targetCount?: number;
    periodEnd: string;
  },
): Promise<FitnessGoal | null> {
  const { data, error } = await supabase
    .from('fitness_goals')
    .insert({
      user_id: userId,
      goal_type: input.goalType,
      sport: input.sport,
      target_distance_m: input.targetDistanceM ?? null,
      target_seconds: input.targetSeconds ?? null,
      target_count: input.targetCount ?? null,
      period_start: new Date().toISOString().slice(0, 10),
      period_end: input.periodEnd,
    })
    .select('*')
    .single();
  if (error) {
    console.error('[fitnessGoals] createFitnessGoal:', error.message);
    return null;
  }
  return data as FitnessGoal;
}

export async function abandonFitnessGoal(goalId: string): Promise<void> {
  const { error } = await supabase
    .from('fitness_goals')
    .update({ status: 'abandoned', updated_at: new Date().toISOString() })
    .eq('id', goalId);
  if (error) console.error('[fitnessGoals] abandonFitnessGoal:', error.message);
}

export interface ActivityInput {
  // Stable per-activity id - a Watch workout's HealthKit uuid, or a
  // synthetic `${workoutId}-day${simDay}` for an in-app gym session - used
  // to credit each real activity against a given goal at most once, even
  // if the same HealthKit workout gets re-read on a later app foreground.
  sourceId: string;
  category: string;
  distanceMeters: number | null;
  durationSeconds: number | null;
  occurredAt: string;
}

export interface GoalCredit {
  goal: FitnessGoal;
  justCompleted: boolean;
  isNewBest: boolean;
}

// GPS/HealthKit distance for "a 5K" is never exactly 5000m - a real run
// logged as 5.3km should still count as an attempt at a "5km" goal.
const DISTANCE_TOLERANCE = 0.12;

// Evaluates one real, already-happened activity against every active goal
// it's eligible for (matched by sport, or 'any' for frequency) and persists
// any progress - called from App.tsx whenever new HealthKit workouts come
// in, and from the gym finish-workout flow (distance/duration null there,
// so only frequency goals can match). Returns only the goals this activity
// actually changed, so the caller knows what XP/toast to show.
export async function recordActivityForGoals(userId: string, activity: ActivityInput): Promise<GoalCredit[]> {
  const { data: goals, error } = await supabase
    .from('fitness_goals')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'active')
    .or(`sport.eq.${activity.category},sport.eq.any`)
    .lte('period_start', activity.occurredAt.slice(0, 10))
    .gte('period_end', activity.occurredAt.slice(0, 10));
  if (error) {
    console.error('[fitnessGoals] recordActivityForGoals fetch:', error.message);
    return [];
  }

  const credits: GoalCredit[] = [];
  for (const goal of (goals ?? []) as FitnessGoal[]) {
    if (goal.goal_type === 'distance_time' && (activity.distanceMeters == null || activity.durationSeconds == null)) continue;
    if (goal.goal_type === 'distance_total' && activity.distanceMeters == null) continue;
    // Only a distance_time goal needs "this one activity roughly matches
    // the target distance" (a genuine 5K attempt, not a 2K jog) - a
    // distance_total goal accumulates any matching-sport activity
    // regardless of its individual length, so no tolerance check there.
    if (goal.goal_type === 'distance_time') {
      const target = goal.target_distance_m ?? 0;
      const within = Math.abs((activity.distanceMeters ?? 0) - target) <= target * DISTANCE_TOLERANCE;
      if (!within) continue;
    }

    // Claim this (goal, activity) pair before touching progress - a no-op
    // insert (ignoreDuplicates) means it was already credited, so skip.
    const { data: claimed, error: claimErr } = await supabase
      .from('fitness_goal_credits')
      .upsert({ goal_id: goal.id, user_id: userId, source_id: activity.sourceId }, { onConflict: 'goal_id,source_id', ignoreDuplicates: true })
      .select('id');
    if (claimErr) {
      console.error('[fitnessGoals] claim credit:', claimErr.message);
      continue;
    }
    if (!claimed || claimed.length === 0) continue; // already credited

    const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
    let justCompleted = false;
    let isNewBest = false;

    if (goal.goal_type === 'distance_time') {
      const seconds = activity.durationSeconds!;
      if (goal.best_seconds == null || seconds < goal.best_seconds) {
        patch.best_seconds = seconds;
        isNewBest = true;
      }
      if (seconds <= (goal.target_seconds ?? 0)) {
        patch.status = 'completed';
        justCompleted = true;
      }
    } else if (goal.goal_type === 'distance_total') {
      const total = goal.progress_distance_m + (activity.distanceMeters ?? 0);
      patch.progress_distance_m = total;
      if (total >= (goal.target_distance_m ?? 0)) {
        patch.status = 'completed';
        justCompleted = true;
      }
    } else {
      const count = goal.progress_count + 1;
      patch.progress_count = count;
      if (count >= (goal.target_count ?? 0)) {
        patch.status = 'completed';
        justCompleted = true;
      }
    }

    const { data: updated, error: updateErr } = await supabase.from('fitness_goals').update(patch).eq('id', goal.id).select('*').single();
    if (updateErr) {
      console.error('[fitnessGoals] update goal:', updateErr.message);
      continue;
    }
    credits.push({ goal: updated as FitnessGoal, justCompleted, isNewBest });
  }
  return credits;
}
