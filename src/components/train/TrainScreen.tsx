import { useState } from 'react';
import { Icon } from '../Icon';
import { WeekStrip } from './WeekStrip';
import { WORKOUTS } from '../../data/workouts';
import { useAppStore } from '../../store/useAppStore';
import { useUserId } from '../../lib/useSession';
import { getWorkout, useMyWorkouts, shareLinkFor, deleteWorkout } from '../../lib/customWorkouts';
import { isWorkoutDone, todayPlan, todayPlanIndex } from '../../lib/schedule';

export function TrainScreen() {
  const simDay = useAppStore((s) => s.simDay);
  const weekPlan = useAppStore((s) => s.weekPlan);
  const workoutState = useAppStore((s) => s.workoutState);
  const openWorkout = useAppStore((s) => s.openWorkout);
  const openWorkoutEditor = useAppStore((s) => s.openWorkoutEditor);
  const setDayWorkout = useAppStore((s) => s.setDayWorkout);
  const showToast = useAppStore((s) => s.showToast);
  const userId = useUserId();
  const myPrograms = useMyWorkouts();

  const [pickerDay, setPickerDay] = useState<number | null>(null);

  const plan = todayPlan(simDay, weekPlan);
  const todayIdx = todayPlanIndex(simDay);
  const todayWorkout = plan.type === 'train' && plan.key ? getWorkout(plan.key) : undefined;

  const pickerOptions = [
    ...Object.entries(WORKOUTS).map(([key, w]) => ({ key, name: w.name })),
    ...myPrograms.map((w) => ({ key: w.id, name: w.name })),
  ];

  function pickDay(i: number, key: string | null) {
    setDayWorkout(i, key);
    setPickerDay(null);
  }

  function handleShare(id: string) {
    const link = shareLinkFor(id);
    navigator.clipboard?.writeText(link).then(
      () => showToast('Share link copied'),
      () => showToast(link),
    );
  }

  async function handleDelete(id: string) {
    if (!userId) return;
    await deleteWorkout(userId, id);
    showToast('Program deleted');
  }

  return (
    <>
      <WeekStrip />
      {plan.type !== 'train' || !todayWorkout ? (
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
            <div className="wc-title">{todayWorkout.name}</div>
            <div className="wc-sub">
              {isWorkoutDone(workoutState, simDay, plan.key!)
                ? 'Completed today'
                : `${todayWorkout.duration} · ${todayWorkout.exercises.length} exercises`}
            </div>
          </div>
          <div className="wc-arrow">
            <Icon name="chevron" />
          </div>
        </div>
      )}

      <div className="section-label">This week</div>
      <div className="card">
        {weekPlan.map((p, i) => {
          const w = p.type === 'train' && p.key ? getWorkout(p.key) : undefined;
          const label = w?.name ?? (p.type === 'train' ? 'Workout' : 'Recovery Day');
          const isToday = i === todayIdx;
          return (
            <div key={i}>
              <div className="goal-row">
                <div className="ex-num" style={isToday ? { background: 'var(--accent-soft)', color: 'var(--accent)' } : undefined}>
                  {i + 1}
                </div>
                <div
                  className="goal-main"
                  style={{ cursor: p.type === 'train' && w ? 'pointer' : 'default' }}
                  onClick={p.type === 'train' && w ? () => openWorkout(p.key!) : undefined}
                >
                  <div className="goal-title">
                    {label}
                    {isToday && <span style={{ color: 'var(--accent)', fontWeight: 700 }}> • Today</span>}
                  </div>
                  {w ? (
                    <div className="goal-meta">{w.duration}</div>
                  ) : (
                    <div className="goal-meta">Mobility &amp; hydration goals only</div>
                  )}
                </div>
                <button className="icon-btn" onClick={() => setPickerDay(pickerDay === i ? null : i)}>
                  <Icon name={pickerDay === i ? 'x' : 'edit'} />
                </button>
              </div>
              {pickerDay === i && (
                <div className="day-picker">
                  <div className={`day-picker-opt${p.type === 'rest' ? ' current' : ''}`} onClick={() => pickDay(i, null)}>
                    Rest day
                  </div>
                  {pickerOptions.map((opt) => (
                    <div
                      key={opt.key}
                      className={`day-picker-opt${p.type === 'train' && p.key === opt.key ? ' current' : ''}`}
                      onClick={() => pickDay(i, opt.key)}
                    >
                      {opt.name}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="section-label">
        My programs
        <button className="link-btn" onClick={() => openWorkoutEditor('new')}>
          <Icon name="plus" style={{ width: 13, height: 13 }} /> Create
        </button>
      </div>
      <div className="card">
        {myPrograms.length === 0 && <div className="empty-hint">No custom programs yet — create one or import a shared link.</div>}
        {myPrograms.map((w) => (
          <div className="program-row" key={w.id}>
            <div className="goal-main" onClick={() => openWorkoutEditor(w.id)}>
              <div className="goal-title">{w.name}</div>
              <div className="goal-meta">
                {w.duration} · {w.exercises.length} exercises
              </div>
            </div>
            <div className="program-actions">
              <button className="icon-btn" onClick={() => handleShare(w.id)}>
                <Icon name="link" />
              </button>
              <button className="icon-btn" onClick={() => openWorkoutEditor(w.id)}>
                <Icon name="edit" />
              </button>
              <button className="icon-btn" onClick={() => handleDelete(w.id)}>
                <Icon name="trash" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
