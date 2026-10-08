import { useAppStore } from '../../store/useAppStore';
import { WEEKDAY_LABELS, todayPlanIndex } from '../../lib/schedule';

export function WeekStrip() {
  const weekPlan = useAppStore((s) => s.weekPlan);
  const todayIdx = todayPlanIndex();

  return (
    <div className="week-strip">
      {weekPlan.map((_, i) => {
        const isToday = i === todayIdx;
        return (
          <div key={i} className={`day-pill${isToday ? ' today iscurrent' : ''}`}>
            <div className="dp-label">{WEEKDAY_LABELS[i]}</div>
            <div className="dp-dot" />
          </div>
        );
      })}
    </div>
  );
}
