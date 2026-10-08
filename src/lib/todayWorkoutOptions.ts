import { useAppStore } from '../store/useAppStore';
import { getWorkout } from './customWorkouts';
import { getWorkoutRoute } from './health';
import { todayPlanIndex } from './schedule';
import { categoryForActivityName } from '../data/workoutTypes';
import type { PostWorkout } from './social';
import type { HealthWorkoutSummary } from '../types';

// The only two legitimate sources for a post's attached workout - today's
// actually-completed gym program, and today's real Apple Watch-synced
// activities - shared by the Community composer (an unprompted post) and
// Train's "Post to feed" entry points (which seed a specific one of these
// directly). Never a free pick of any saved program or built-in preset,
// which would let a post claim a workout that never happened.
export function useTodayPostableWorkouts() {
  const simDay = useAppStore((s) => s.simDay);
  const weekPlan = useAppStore((s) => s.weekPlan);
  const workoutState = useAppStore((s) => s.workoutState);
  const watchOptions = useAppStore((s) => s.today.selectedWatchWorkouts) ?? [];

  const todayPlanEntry = weekPlan[todayPlanIndex()];
  const todayKey = todayPlanEntry?.type === 'train' ? todayPlanEntry.key : undefined;
  const todayGymState = todayKey ? workoutState[simDay]?.[todayKey] : undefined;
  const todayGymWorkout = todayGymState?.completed && todayKey ? getWorkout(todayKey) : undefined;
  const gymOption: PostWorkout | null = todayGymWorkout
    ? { name: todayGymWorkout.name, duration: todayGymWorkout.duration, category: todayGymWorkout.category, exercises: todayGymWorkout.exercises }
    : null;

  async function resolveWatchWorkout(w: HealthWorkoutSummary): Promise<PostWorkout> {
    const category = categoryForActivityName(w.activityName);
    const points = await getWorkoutRoute(w.uuid);
    return {
      name: w.activityName,
      duration: `${Math.round(w.durationMinutes)} min`,
      category,
      exercises: [{ name: w.activityName, sets: 1, reps: `${Math.round(w.durationMinutes)} min` }],
      isActivity: true,
      distanceMeters: w.distanceMeters ?? undefined,
      route: points.length > 1 ? points : undefined,
    };
  }

  return { gymOption, watchOptions, resolveWatchWorkout };
}
