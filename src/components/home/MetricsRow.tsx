import { Icon } from '../Icon';
import type { IconName } from '../../data/icons';
import { useAppStore } from '../../store/useAppStore';
import { isWorkoutDone, todayMetrics, todayPlan } from '../../lib/schedule';
import { healthAvailableOnPlatform } from '../../lib/health';

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

// Mirrors the ring goals baked into todayMetrics()'s fake demo data, so
// real Health numbers fill the same rings consistently.
const STEPS_GOAL = 8000;
const KCAL_GOAL = 1600;
const MINS_GOAL = 60;

export function MetricsRow() {
  const simDay = useAppStore((s) => s.simDay);
  const weekPlan = useAppStore((s) => s.weekPlan);
  const goals = useAppStore((s) => s.today.goals);
  const workoutState = useAppStore((s) => s.workoutState);
  const health = useAppStore((s) => s.today.health);

  const plan = todayPlan(weekPlan);
  const workoutDone = plan.type === 'train' && !!plan.key && isWorkoutDone(workoutState, simDay, plan.key);
  const goalsDone = goals.filter((g) => g.done).length;

  // On native iOS, never show fabricated numbers - either real Health
  // data (once connected) or an explicit connect prompt, never a stand-in.
  if (healthAvailableOnPlatform() && !health) {
    return (
      <div className="banner" style={{ marginBottom: 18 }}>
        <Icon name="heart" />
        <span>Connect Apple Health in Profile to see today's real steps, active time and heart rate here.</span>
      </div>
    );
  }

  if (health) {
    return (
      <div className="metrics">
        <RingTile iconName="steps" color="#3b82f6" val={health.steps.toLocaleString()} label="Steps" pct={health.steps / STEPS_GOAL} />
        <RingTile iconName="flame" color="#f97316" val={Math.round(health.kcal).toLocaleString()} label="Calories" pct={health.kcal / KCAL_GOAL} />
        <RingTile iconName="clock" color="#10b981" val={Math.round(health.activeMinutes)} unit="min" label="Active" pct={health.activeMinutes / MINS_GOAL} />
        <RingTile
          iconName="heart"
          color="#ec4899"
          val={health.hr ? Math.round(health.hr) : 'Pair watch'}
          unit={health.hr ? 'bpm' : undefined}
          label="Heart rate"
          pct={health.hr ? 0.62 : 0}
        />
      </div>
    );
  }

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
