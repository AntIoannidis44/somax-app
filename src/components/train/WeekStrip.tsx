import { useAppStore } from '../../store/useAppStore';
import { WEEKDAY_LABELS, isWorkoutDone, todayPlanIndex } from '../../lib/schedule';

// Sun-Sat strip for the current calendar week. Tapping a day opens it in
// Train's day sheet (recap for past days, edit for today and ahead).
export function WeekStrip({ onSelect }: { onSelect?: (i: number) => void }) {
  const weekPlan = useAppStore((s) => s.weekPlan);
  const workoutState = useAppStore((s) => s.workoutState);
  const simDay = useAppStore((s) => s.simDay);
  const history = useAppStore((s) => s.history);
  const todayIdx = todayPlanIndex();
  const now = new Date();

  return (
    <div className="week-strip">
      {weekPlan.map((p, i) => {
        const isToday = i === todayIdx;
        const sim = simDay - (todayIdx - i);
        const done =
          i <= todayIdx &&
          (p.type === 'watch'
            ? history.some((h) => h.day === sim && /synced from Apple Fitness/.test(h.label))
            : p.type === 'train' && !!p.key && isWorkoutDone(workoutState, sim, p.key));
        const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (todayIdx - i)).getDate();
        const cls = ['day-pill'];
        if (isToday) cls.push('today', 'iscurrent');
        if (done) cls.push('done');
        if (p.type === 'rest') cls.push('rest');
        return (
          <button key={i} className={cls.join(' ')} onClick={() => onSelect?.(i)}>
            <div className="dp-label">{WEEKDAY_LABELS[i][0]}</div>
            <div className="dp-date">{date}</div>
            <div className="dp-dot" />
          </button>
        );
      })}
    </div>
  );
}
