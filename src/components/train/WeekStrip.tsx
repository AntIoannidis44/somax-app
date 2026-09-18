import { useAppStore } from '../../store/useAppStore';
import { todayPlanIndex } from '../../lib/schedule';

export function WeekStrip() {
  const simDay = useAppStore((s) => s.simDay);
  const weekPlan = useAppStore((s) => s.weekPlan);
  const todayIdx = todayPlanIndex(simDay);

  return (
    <div className="week-strip">
      {weekPlan.map((_, i) => {
        const isToday = i === todayIdx;
        const complete = i < todayIdx;
        return (
          <div key={i} className={`day-pill${isToday ? ' today iscurrent' : ''}${complete ? ' complete' : ''}`}>
            <div className="dp-label">D{i + 1}</div>
            <div className="dp-dot" />
          </div>
        );
      })}
    </div>
  );
}
