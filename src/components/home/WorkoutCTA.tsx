import { Icon } from '../Icon';
import { getWorkout } from '../../lib/customWorkouts';
import { useAppStore } from '../../store/useAppStore';
import { isWorkoutDone, todayPlan } from '../../lib/schedule';

export function WorkoutCTA() {
  const simDay = useAppStore((s) => s.simDay);
  const weekPlan = useAppStore((s) => s.weekPlan);
  const workoutState = useAppStore((s) => s.workoutState);
  const openWorkout = useAppStore((s) => s.openWorkout);
  const go = useAppStore((s) => s.go);

  const plan = todayPlan(weekPlan);
  const selectedWatchWorkouts = useAppStore((s) => s.today.selectedWatchWorkouts);
  const availableWatchWorkouts = useAppStore((s) => s.today.availableWatchWorkouts);

  if (plan.type === 'watch') {
    // Home has no room for the full activity picker (see Train's hero
    // card and Home's Daily goals list, both of which do show it) - this
    // just links over to make/change a pick.
    const selectedCount = selectedWatchWorkouts?.length ?? 0;
    const unselectedCount = (availableWatchWorkouts?.length ?? 0) - selectedCount;
    const canPick = unselectedCount > 0 || selectedCount > 0;
    return (
      <div className="workout-cta" style={{ cursor: canPick ? 'pointer' : 'default' }} onClick={canPick ? () => go('train') : undefined}>
        <div className="wc-icon">
          <Icon name={selectedCount > 0 ? 'check' : 'watch'} />
        </div>
        <div>
          <div className="wc-title">
            {selectedCount > 0 ? `${selectedCount} ${selectedCount === 1 ? 'activity' : 'activities'} synced` : 'Sync from Apple Fitness'}
          </div>
          <div className="wc-sub">
            {selectedCount > 0
              ? `${Math.round(selectedWatchWorkouts!.reduce((sum, w) => sum + w.durationMinutes, 0))} min total${unselectedCount > 0 ? ` · ${unselectedCount} more available` : ''}`
              : unselectedCount > 0
                ? `${unselectedCount} ${unselectedCount === 1 ? 'activity' : 'activities'} ready — tap to choose`
                : 'Log any Watch workout today and it counts automatically'}
          </div>
        </div>
        {canPick && (
          <div className="wc-arrow">
            <Icon name="chevron" />
          </div>
        )}
      </div>
    );
  }

  if (plan.type !== 'train' || !plan.key) {
    return (
      <div className="workout-cta" style={{ cursor: 'default' }}>
        <div className="wc-icon">
          <Icon name="moon" />
        </div>
        <div>
          <div className="wc-title">Recovery day</div>
          <div className="wc-sub">Light mobility, no lifting session scheduled</div>
        </div>
      </div>
    );
  }

  const wid = plan.key;
  const w = getWorkout(wid);
  const done = isWorkoutDone(workoutState, simDay, wid);
  if (!w) return null;

  return (
    <div className="workout-cta" onClick={() => openWorkout(wid)}>
      <div className="wc-icon">
        <Icon name="dumbbell" />
      </div>
      <div>
        <div className="wc-title">{w.name}</div>
        <div className="wc-sub">{done ? 'Completed · tap to review' : `${w.duration} · ${w.exercises.length} exercises · +40 XP`}</div>
      </div>
      <div className="wc-arrow">
        <Icon name="chevron" />
      </div>
    </div>
  );
}
