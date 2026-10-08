import { useEffect, useState } from 'react';
import { Icon } from '../Icon';
import { useAppStore } from '../../store/useAppStore';
import { useUserId } from '../../lib/useSession';
import { fetchActiveGoal, fetchWeightLogs, type WeightGoal } from '../../lib/weightGoals';
import { fetchActiveFitnessGoals, type FitnessGoal } from '../../lib/fitnessGoals';
import { workoutTypeById } from '../../data/workoutTypes';

function formatMMSS(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = Math.round(totalSeconds % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

interface Row {
  key: string;
  title: string;
  meta: string;
  pct: number | null;
}

// A read-only, at-a-glance summary of long-term targets (a weight goal, a
// 5K time, total distance, training frequency) - distinct from the
// checklist above it, which is today-only and resets every midnight. Tap
// through to Profile's Goals screen for the actual create/log/abandon UI.
export function GoalsKPI() {
  const userId = useUserId();
  const openGoals = useAppStore((s) => s.openGoals);
  const [weightGoal, setWeightGoal] = useState<WeightGoal | null>(null);
  const [latestWeight, setLatestWeight] = useState<number | null>(null);
  const [fitnessGoals, setFitnessGoals] = useState<FitnessGoal[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!userId) return;
    (async () => {
      const [wg, fg] = await Promise.all([fetchActiveGoal(userId), fetchActiveFitnessGoals(userId)]);
      setWeightGoal(wg);
      setFitnessGoals(fg);
      if (wg) {
        const logs = await fetchWeightLogs(userId, wg.id);
        setLatestWeight(logs[0]?.weight_kg ?? wg.start_weight_kg);
      }
      setLoaded(true);
    })();
  }, [userId]);

  if (!loaded) return null;

  const rows: Row[] = [];
  if (weightGoal) {
    const latest = latestWeight ?? weightGoal.start_weight_kg;
    const span = Math.abs(weightGoal.target_weight_kg - weightGoal.start_weight_kg) || 1;
    const moved = weightGoal.direction === 'gain' ? latest - weightGoal.start_weight_kg : weightGoal.start_weight_kg - latest;
    rows.push({
      key: 'weight',
      title: `${weightGoal.direction === 'gain' ? 'Build up to' : 'Lean down to'} ${weightGoal.target_weight_kg}kg`,
      meta: `${latest.toFixed(1)}kg · by ${new Date(weightGoal.target_date).toLocaleDateString()}`,
      pct: Math.max(0, Math.min(100, Math.round((moved / span) * 100))),
    });
  }
  for (const g of fitnessGoals) {
    const sport = workoutTypeById(g.sport === 'any' ? null : g.sport)?.label ?? 'Any';
    if (g.goal_type === 'distance_time') {
      rows.push({
        key: g.id,
        title: `${sport} ${((g.target_distance_m ?? 0) / 1000).toFixed(1)}km under ${formatMMSS(g.target_seconds ?? 0)}`,
        meta: g.best_seconds != null ? `Best: ${formatMMSS(g.best_seconds)}` : 'No attempt yet',
        pct: null,
      });
    } else if (g.goal_type === 'distance_total') {
      rows.push({
        key: g.id,
        title: `${sport} ${((g.target_distance_m ?? 0) / 1000).toFixed(0)}km total`,
        meta: `${(g.progress_distance_m / 1000).toFixed(1)} / ${((g.target_distance_m ?? 0) / 1000).toFixed(0)}km`,
        pct: Math.min(100, Math.round((g.progress_distance_m / (g.target_distance_m || 1)) * 100)),
      });
    } else {
      rows.push({
        key: g.id,
        title: `Train ${g.target_count}x${g.sport !== 'any' ? ` (${sport})` : ''}`,
        meta: `${g.progress_count} / ${g.target_count}`,
        pct: Math.min(100, Math.round((g.progress_count / (g.target_count || 1)) * 100)),
      });
    }
  }

  if (rows.length === 0) {
    return (
      <button className="card" style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', textAlign: 'left', cursor: 'pointer' }} onClick={() => openGoals()}>
        <div
          style={{
            width: 34, height: 34, borderRadius: 11, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', background: 'linear-gradient(152deg, var(--hero-1), var(--hero-2))',
          }}
        >
          <Icon name="zap" style={{ width: 16, height: 16 }} />
        </div>
        <div style={{ flex: 1 }}>
          <div className="setting-title">No goals set yet</div>
          <div className="setting-sub">Set a weight target or a 5K time - tap to get started</div>
        </div>
        <Icon name="chevron" style={{ flexShrink: 0 }} />
      </button>
    );
  }

  return (
    <div className="card" style={{ cursor: 'pointer' }} onClick={() => openGoals()}>
      {rows.map((r, i) => (
        <div key={r.key} style={{ padding: '8px 0', borderTop: i === 0 ? 'none' : '1px solid var(--line-soft)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 10 }}>
            <span style={{ fontWeight: 700, fontSize: 13 }}>{r.title}</span>
            <span className="ch-days" style={{ flexShrink: 0 }}>{r.meta}</span>
          </div>
          {r.pct != null && (
            <div className="progress-track" style={{ marginTop: 6 }}>
              <div className="progress-fill" style={{ width: `${r.pct}%` }} />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
