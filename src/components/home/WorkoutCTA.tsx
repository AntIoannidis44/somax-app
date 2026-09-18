import { Icon } from '../Icon';
import { WORKOUTS } from '../../data/workouts';
import { useAppStore } from '../../store/useAppStore';
import { isWorkoutDone, todayPlan } from '../../lib/schedule';

export function WorkoutCTA() {
  const simDay = useAppStore((s) => s.simDay);
  const weekPlan = useAppStore((s) => s.weekPlan);
  const workoutState = useAppStore((s) => s.workoutState);
  const openWorkout = useAppStore((s) => s.openWorkout);

  const plan = todayPlan(simDay, weekPlan);

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
  const w = WORKOUTS[wid];
  const done = isWorkoutDone(workoutState, simDay, wid);

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
