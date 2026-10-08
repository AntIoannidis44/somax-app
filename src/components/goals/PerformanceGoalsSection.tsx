import { useEffect, useState } from 'react';
import { Icon } from '../Icon';
import { useAppStore } from '../../store/useAppStore';
import { useUserId } from '../../lib/useSession';
import { WORKOUT_TYPES, workoutTypeById, type WorkoutType } from '../../data/workoutTypes';
import { abandonFitnessGoal, createFitnessGoal, fetchActiveFitnessGoals, type FitnessGoal, type FitnessGoalType } from '../../lib/fitnessGoals';

// Only sports that actually report a real GPS/HealthKit distance make
// sense for a distance goal - gym/fitness/other have no distance to verify
// against.
const DISTANCE_SPORTS = ['run', 'ride', 'swim', 'walk'];

const GOAL_TYPES: { id: FitnessGoalType; label: string; desc: string }[] = [
  { id: 'distance_time', label: 'Beat a time', desc: 'e.g. run 5km under 25:00 - verified from your next matching Apple Health activity' },
  { id: 'distance_total', label: 'Total distance', desc: 'e.g. ride 100km this month - adds up every matching activity automatically' },
  { id: 'frequency', label: 'Train X times', desc: 'e.g. train 4 times this month - any workout counts, gym or synced' },
];

function defaultPeriodEnd(months: number): string {
  const d = new Date();
  d.setMonth(d.getMonth() + months);
  return d.toISOString().slice(0, 10);
}

function formatMMSS(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = Math.round(totalSeconds % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

function parseMMSS(text: string): number | null {
  const m = text.trim().match(/^(\d+):([0-5]?\d)$/);
  if (!m) return null;
  return parseInt(m[1], 10) * 60 + parseInt(m[2], 10);
}

function SportPicker({ sports, value, onChange }: { sports: WorkoutType[]; value: string; onChange: (id: string) => void }) {
  return (
    <div className="type-tabs" style={{ marginBottom: 14 }}>
      {sports.map((s) => (
        <button key={s.id} type="button" className={`type-chip${value === s.id ? ' active' : ''}`} onClick={() => onChange(s.id)}>
          <Icon name={s.icon} style={{ width: 14, height: 14 }} />
          {s.label}
        </button>
      ))}
    </div>
  );
}

function GoalCard({ goal, onAbandon }: { goal: FitnessGoal; onAbandon: (id: string) => void }) {
  const sport = workoutTypeById(goal.sport === 'any' ? null : goal.sport);
  const title =
    goal.goal_type === 'distance_time'
      ? `${sport?.label ?? 'Any'} ${((goal.target_distance_m ?? 0) / 1000).toFixed(1)}km under ${formatMMSS(goal.target_seconds ?? 0)}`
      : goal.goal_type === 'distance_total'
        ? `${sport?.label ?? 'Any'} ${((goal.target_distance_m ?? 0) / 1000).toFixed(0)}km total`
        : `Train ${goal.target_count}x${sport ? ` (${sport.label})` : ''}`;

  return (
    <div className="challenge-card card">
      <div className="ch-head">
        <div>
          <div className="ch-title">{title}</div>
          <div className="ch-desc">
            {goal.goal_type === 'distance_time' && goal.best_seconds != null
              ? `Best so far: ${formatMMSS(goal.best_seconds)}`
              : `By ${new Date(goal.period_end).toLocaleDateString()}`}
          </div>
        </div>
        <div className="ch-badge live">Active</div>
      </div>
      {goal.goal_type !== 'distance_time' && (
        <div className="progress-track" style={{ marginBottom: 8 }}>
          <div
            className="progress-fill"
            style={{
              width: `${Math.min(
                100,
                Math.round(
                  goal.goal_type === 'distance_total'
                    ? (goal.progress_distance_m / (goal.target_distance_m || 1)) * 100
                    : (goal.progress_count / (goal.target_count || 1)) * 100,
                ),
              )}%`,
            }}
          />
        </div>
      )}
      <div className="ch-foot">
        <span className="ch-days">
          {goal.goal_type === 'distance_total'
            ? `${(goal.progress_distance_m / 1000).toFixed(1)} / ${((goal.target_distance_m ?? 0) / 1000).toFixed(0)} km`
            : goal.goal_type === 'frequency'
              ? `${goal.progress_count} / ${goal.target_count}`
              : `Target: ${formatMMSS(goal.target_seconds ?? 0)}`}
        </span>
        <button className="btn btn-sm btn-ghost" onClick={() => onAbandon(goal.id)}>
          Abandon
        </button>
      </div>
    </div>
  );
}

export function PerformanceGoalsSection() {
  const userId = useUserId();
  const showToast = useAppStore((s) => s.showToast);
  const [goals, setGoals] = useState<FitnessGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [busy, setBusy] = useState(false);

  const [goalType, setGoalType] = useState<FitnessGoalType>('distance_time');
  const [sport, setSport] = useState('run');
  const [distanceKm, setDistanceKm] = useState('5');
  const [timeText, setTimeText] = useState('25:00');
  const [count, setCount] = useState('4');
  const [periodEnd, setPeriodEnd] = useState(defaultPeriodEnd(1));

  async function reload() {
    if (!userId) return;
    setLoading(true);
    setGoals(await fetchActiveFitnessGoals(userId));
    setLoading(false);
  }

  useEffect(() => {
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  async function handleAbandon(id: string) {
    await abandonFitnessGoal(id);
    setGoals((prev) => prev.filter((g) => g.id !== id));
  }

  async function handleCreate() {
    if (!userId) return;
    const distanceM = parseFloat(distanceKm) * 1000;
    if (goalType === 'distance_time') {
      const seconds = parseMMSS(timeText);
      if (!Number.isFinite(distanceM) || distanceM <= 0 || seconds == null) {
        showToast('Enter a distance and a target time as mm:ss');
        return;
      }
      setBusy(true);
      const g = await createFitnessGoal(userId, { goalType, sport, targetDistanceM: distanceM, targetSeconds: seconds, periodEnd });
      setBusy(false);
      if (!g) { showToast('Could not create goal - try again'); return; }
    } else if (goalType === 'distance_total') {
      if (!Number.isFinite(distanceM) || distanceM <= 0) {
        showToast('Enter a target distance');
        return;
      }
      setBusy(true);
      const g = await createFitnessGoal(userId, { goalType, sport, targetDistanceM: distanceM, periodEnd });
      setBusy(false);
      if (!g) { showToast('Could not create goal - try again'); return; }
    } else {
      const targetCount = parseInt(count, 10);
      if (!Number.isFinite(targetCount) || targetCount <= 0) {
        showToast('Enter a target number of workouts');
        return;
      }
      setBusy(true);
      const g = await createFitnessGoal(userId, { goalType, sport, targetCount, periodEnd });
      setBusy(false);
      if (!g) { showToast('Could not create goal - try again'); return; }
    }
    showToast('Goal set');
    setCreating(false);
    reload();
  }

  if (!userId || loading) return <div className="banner">Loading…</div>;

  return (
    <>
      {goals.map((g) => (
        <GoalCard key={g.id} goal={g} onAbandon={handleAbandon} />
      ))}

      {creating ? (
        <div className="card">
          <div className="ch-title" style={{ marginBottom: 10 }}>New performance goal</div>
          <div className="type-tabs" style={{ marginBottom: 4 }}>
            {GOAL_TYPES.map((t) => (
              <button
                key={t.id}
                type="button"
                className={`type-chip${goalType === t.id ? ' active' : ''}`}
                onClick={() => {
                  setGoalType(t.id);
                  setSport(t.id === 'frequency' ? 'any' : 'run');
                }}
              >
                {t.label}
              </button>
            ))}
          </div>
          <div className="ch-desc" style={{ marginBottom: 14 }}>{GOAL_TYPES.find((t) => t.id === goalType)?.desc}</div>

          {goalType === 'frequency' ? (
            <SportPicker
              sports={[{ id: 'any', label: 'Any', icon: 'zap', colorVar: '--accent' }, ...WORKOUT_TYPES]}
              value={sport}
              onChange={setSport}
            />
          ) : (
            <SportPicker sports={DISTANCE_SPORTS.map((id) => workoutTypeById(id)!)} value={sport} onChange={setSport} />
          )}

          {goalType !== 'frequency' && (
            <div className="field">
              <label>Distance (km)</label>
              <input type="number" inputMode="decimal" value={distanceKm} onChange={(e) => setDistanceKm(e.target.value)} placeholder="5" />
            </div>
          )}
          {goalType === 'distance_time' && (
            <div className="field">
              <label>Target time (mm:ss)</label>
              <input type="text" inputMode="numeric" value={timeText} onChange={(e) => setTimeText(e.target.value)} placeholder="25:00" />
            </div>
          )}
          {goalType === 'frequency' && (
            <div className="field">
              <label>Number of workouts</label>
              <input type="number" inputMode="numeric" value={count} onChange={(e) => setCount(e.target.value)} placeholder="4" />
            </div>
          )}
          <div className="field">
            <label>{goalType === 'distance_time' ? 'Deadline' : 'By'}</label>
            <input type="date" value={periodEnd} onChange={(e) => setPeriodEnd(e.target.value)} />
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-primary" style={{ flex: 1 }} disabled={busy} onClick={handleCreate}>
              {busy ? 'Setting…' : 'Set goal'}
            </button>
            <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setCreating(false)}>
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => setCreating(true)}>
          <Icon name="plus" style={{ width: 16, height: 16 }} /> Add a performance goal
        </button>
      )}
    </>
  );
}
