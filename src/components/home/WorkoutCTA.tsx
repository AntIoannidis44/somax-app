import { Icon } from '../Icon';
import { getWorkout } from '../../lib/customWorkouts';
import { useAppStore } from '../../store/useAppStore';
import { WEEKDAY_LABELS, isWorkoutDone, todayPlan, todayPlanIndex } from '../../lib/schedule';

const FULL_DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

// Home's "Today" card: what's on today, at a glance, with one primary action.
export function WorkoutCTA() {
  const simDay = useAppStore((s) => s.simDay);
  const weekPlan = useAppStore((s) => s.weekPlan);
  const workoutState = useAppStore((s) => s.workoutState);
  const programName = useAppStore((s) => s.profile?.program.name ?? '');
  const openWorkout = useAppStore((s) => s.openWorkout);
  const go = useAppStore((s) => s.go);
  const selectedWatchWorkouts = useAppStore((s) => s.today.selectedWatchWorkouts);
  const availableWatchWorkouts = useAppStore((s) => s.today.availableWatchWorkouts);

  const plan = todayPlan(weekPlan);
  const eyebrow = [FULL_DAYS[todayPlanIndex()] ?? WEEKDAY_LABELS[todayPlanIndex()], programName].filter(Boolean).join(' · ');

  if (plan.type === 'watch') {
    // Home has no room for the activity picker (Train has it) - this links
    // over to make or change a pick.
    const selectedCount = selectedWatchWorkouts?.length ?? 0;
    const unselectedCount = (availableWatchWorkouts?.length ?? 0) - selectedCount;
    const totalMin = Math.round((selectedWatchWorkouts ?? []).reduce((sum, w) => sum + w.durationMinutes, 0));
    return (
      <div className="today-card">
        <div className="today-k">{eyebrow}</div>
        <div className="today-t">{selectedCount > 0 ? `${selectedCount} ${selectedCount === 1 ? 'activity' : 'activities'} synced` : 'Sync from Apple Fitness'}</div>
        <div className="today-m">
          <span>
            <Icon name="watch" /> Any Watch workout counts
          </span>
          {selectedCount > 0 && (
            <span>
              <Icon name="clock" /> {totalMin} min
            </span>
          )}
        </div>
        <div className="today-chips">
          {(availableWatchWorkouts ?? []).slice(0, 3).map((w, i) => (
            <span key={i}>{w.activityName}</span>
          ))}
          {(availableWatchWorkouts?.length ?? 0) === 0 && <span>Log a workout on your Watch and it counts automatically</span>}
        </div>
        {(unselectedCount > 0 || selectedCount > 0) && (
          <button className="btn btn-primary" onClick={() => go('train')}>
            {unselectedCount > 0 ? `Choose from ${unselectedCount} ${unselectedCount === 1 ? 'activity' : 'activities'}` : 'Review on Train'}
          </button>
        )}
      </div>
    );
  }

  if (plan.type !== 'train' || !plan.key) {
    return (
      <div className="today-card">
        <div className="today-k">{eyebrow}</div>
        <div className="today-t">Recovery day</div>
        <div className="today-m">
          <span>
            <Icon name="moon" /> No session scheduled
          </span>
        </div>
        <div className="today-chips">
          <span>Mobility</span>
          <span>Hydration</span>
          <span>Steps</span>
        </div>
        <button className="btn btn-ghost" onClick={() => go('train')}>
          See this week
        </button>
      </div>
    );
  }

  const wid = plan.key;
  const w = getWorkout(wid);
  const done = isWorkoutDone(workoutState, simDay, wid);
  if (!w) return null;

  return (
    <div className="today-card">
      <div className="today-k">{eyebrow}</div>
      <div className="today-t">{w.name}</div>
      <div className="today-m">
        <span>
          <Icon name="clock" /> {w.duration}
        </span>
        <span>
          <Icon name="dumbbell" /> {w.exercises.length} exercises
        </span>
        <span>
          <Icon name="zap" /> +40 XP
        </span>
      </div>
      <div className="today-chips">
        {w.exercises.slice(0, 3).map((ex, i) => (
          <span key={i}>{ex.name}</span>
        ))}
        {w.exercises.length > 3 && <span>+{w.exercises.length - 3} more</span>}
      </div>
      <button className={`btn ${done ? 'btn-ghost' : 'btn-primary'}`} onClick={() => openWorkout(wid)}>
        {done ? (
          <>
            <Icon name="check" style={{ width: 16, height: 16 }} /> Completed · review
          </>
        ) : (
          'Start workout'
        )}
      </button>
    </div>
  );
}
