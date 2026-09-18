import { Icon } from '../Icon';
import type { IconName } from '../../data/icons';
import { useAppStore } from '../../store/useAppStore';
import { isWorkoutDone, todayMetrics, todayPlan } from '../../lib/schedule';

function RingTile({
  iconName,
  color,
  val,
  unit,
  label,
  pct,
}: {
  iconName: IconName;
  color: string;
  val: string | number;
  unit?: string;
  label: string;
  pct: number;
}) {
  const R = 21;
  const C = 2 * Math.PI * R;
  const off = C * (1 - Math.max(0, Math.min(1, pct)));
  return (
    <div className="metric">
      <div className="metric-ring">
        <svg viewBox="0 0 52 52">
          <circle className="mr-track" cx="26" cy="26" r={R} />
          <circle className="mr-fill" cx="26" cy="26" r={R} stroke={color} strokeDasharray={C} strokeDashoffset={off} />
        </svg>
        <div className="mr-icon" style={{ color }}>
          <Icon name={iconName} />
        </div>
      </div>
      <div className="metric-val">
        {val}
        {unit && <small>{unit}</small>}
      </div>
      <div className="metric-label">{label}</div>
    </div>
  );
}

export function MetricsRow() {
  const simDay = useAppStore((s) => s.simDay);
  const weekPlan = useAppStore((s) => s.weekPlan);
  const goals = useAppStore((s) => s.today.goals);
  const workoutState = useAppStore((s) => s.workoutState);

  const plan = todayPlan(simDay, weekPlan);
  const workoutDone = plan.type === 'train' && !!plan.key && isWorkoutDone(workoutState, simDay, plan.key);
  const goalsDone = goals.filter((g) => g.done).length;
  const m = todayMetrics(simDay, goalsDone, workoutDone);

  return (
    <div className="metrics">
      <RingTile iconName="steps" color="#3b82f6" val={m.steps.toLocaleString()} label="Steps" pct={m.steps / m.stepsGoal} />
      <RingTile iconName="flame" color="#f97316" val={m.kcal.toLocaleString()} label="Calories" pct={m.kcal / m.kcalGoal} />
      <RingTile iconName="clock" color="#10b981" val={m.mins} unit="min" label="Active" pct={m.mins / m.minsGoal} />
      <RingTile iconName="heart" color="#ec4899" val={m.hr} unit="bpm" label="Heart rate" pct={0.62} />
    </div>
  );
}
