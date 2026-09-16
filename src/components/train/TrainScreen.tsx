import { Icon } from '../Icon';
import { WeekStrip } from './WeekStrip';
import { WEEK_PLAN, WORKOUTS } from '../../data/workouts';
import { useAppStore } from '../../store/useAppStore';
import { isWorkoutDone, todayPlan, todayPlanIndex } from '../../lib/schedule';

export function TrainScreen() {
  const simDay = useAppStore((s) => s.simDay);
  const workoutState = useAppStore((s) => s.workoutState);
  const openWorkout = useAppStore((s) => s.openWorkout);

  const plan = todayPlan(simDay);
  const todayIdx = todayPlanIndex(simDay);

  return (
    <>
      <WeekStrip />
      {plan.type === 'rest' ? (
        <div className="rest-hero card">
          <Icon name="moon" />
          <h3 style={{ fontSize: 17, marginBottom: 6 }}>Recovery day</h3>
          <p style={{ color: 'var(--text-dim)', fontSize: 13, maxWidth: 230, margin: '0 auto' }}>
            No lifting session today. Light mobility and hydration goals still earn XP on Home.
          </p>
        </div>
      ) : (
        <div className="workout-cta" style={{ marginBottom: 18 }} onClick={() => openWorkout(plan.key!)}>
          <div className="wc-icon">
            <Icon name="dumbbell" />
          </div>
          <div>
            <div className="wc-title">{WORKOUTS[plan.key!].name}</div>
            <div className="wc-sub">
              {isWorkoutDone(workoutState, simDay, plan.key!)
                ? 'Completed today'
                : `${WORKOUTS[plan.key!].duration} · ${WORKOUTS[plan.key!].exercises.length} exercises`}
            </div>
          </div>
          <div className="wc-arrow">
            <Icon name="chevron" />
          </div>
        </div>
      )}

      <div className="section-label">This week</div>
      <div className="card">
        {WEEK_PLAN.map((p, i) => {
          const label = p.type === 'train' ? WORKOUTS[p.key!].name : 'Recovery Day';
          const isToday = i === todayIdx;
          return (
            <div
              key={i}
              className="goal-row"
              style={{ cursor: p.type === 'train' ? 'pointer' : 'default' }}
              onClick={p.type === 'train' ? () => openWorkout(p.key!) : undefined}
            >
              <div className="ex-num" style={isToday ? { background: 'var(--accent-soft)', color: 'var(--accent)' } : undefined}>
                {i + 1}
              </div>
              <div className="goal-main">
                <div className="goal-title">
                  {label}
                  {isToday && <span style={{ color: 'var(--accent)', fontWeight: 700 }}> • Today</span>}
                </div>
                {p.type === 'train' ? (
                  <div className="goal-meta">{WORKOUTS[p.key!].duration}</div>
                ) : (
                  <div className="goal-meta">Mobility &amp; hydration goals only</div>
                )}
              </div>
              {p.type === 'train' && (
                <div className="wc-arrow">
                  <Icon name="chevron" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}
