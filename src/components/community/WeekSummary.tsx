import { Icon } from '../Icon';
import { useAppStore } from '../../store/useAppStore';
import { WEEKDAY_LABELS, isWorkoutDone, todayPlanIndex } from '../../lib/schedule';

// "Your week" card above the feed: sessions done vs planned, XP earned per
// day this week (from history), and the current streak. Real data only.
export function WeekSummary() {
  const weekPlan = useAppStore((s) => s.weekPlan);
  const workoutState = useAppStore((s) => s.workoutState);
  const simDay = useAppStore((s) => s.simDay);
  const history = useAppStore((s) => s.history);
  const streak = useAppStore((s) => s.progress.currentStreak);
  const todayIdx = todayPlanIndex();

  const planned = weekPlan.filter((p) => p.type !== 'rest').length;
  const done = weekPlan.filter(
    (p, i) => i <= todayIdx && p.type === 'train' && !!p.key && isWorkoutDone(workoutState, simDay - (todayIdx - i), p.key),
  ).length;
  const xpByDay = weekPlan.map((_, i) =>
    i > todayIdx ? 0 : history.filter((h) => h.type === 'xp' && h.day === simDay - (todayIdx - i)).reduce((sum, h) => sum + h.xp, 0),
  );
  const weekXp = xpByDay.reduce((a, b) => a + b, 0);
  const maxXp = Math.max(1, ...xpByDay);

  return (
    <div className="weeksum">
      <div style={{ minWidth: 0 }}>
        <div className="k">Your week</div>
        <div className="big">
          {done}
          <small>of {planned} sessions</small>
        </div>
        <div className="meta">
          <span>
            <Icon name="zap" /> {weekXp.toLocaleString()} XP
          </span>
          <span>
            <Icon name="flame" /> {streak}d streak
          </span>
        </div>
      </div>
      <div className="wbars" aria-hidden="true">
        {weekPlan.map((p, i) => (
          <div key={i} className={i === todayIdx ? 't' : ''}>
            <i
              className={xpByDay[i] > 0 ? 'f' : p.type === 'rest' ? 'r' : ''}
              style={{ height: Math.max(6, Math.round((xpByDay[i] / maxXp) * 40)) }}
            />
            {WEEKDAY_LABELS[i][0]}
          </div>
        ))}
      </div>
    </div>
  );
}
