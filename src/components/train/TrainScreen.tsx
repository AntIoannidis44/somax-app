import { useState } from 'react';
import { Clipboard } from '@capacitor/clipboard';
import { Icon } from '../Icon';
import { TypeIconBadge } from '../TypeIconBadge';
import { WeekStrip } from './WeekStrip';
import { WORKOUTS } from '../../data/workouts';
import { useAppStore } from '../../store/useAppStore';
import { useUserId } from '../../lib/useSession';
import { healthAvailableOnPlatform, getWorkoutRoute } from '../../lib/health';
import { getWorkout, useMyWorkouts, deleteWorkout } from '../../lib/customWorkouts';
import { createShareLink } from '../../lib/shareLinks';
import { WEEKDAY_LABELS, isWorkoutDone, todayPlan, todayPlanIndex } from '../../lib/schedule';
import { formatTime } from '../../lib/format';
import { categoryForActivityName, workoutTypeById } from '../../data/workoutTypes';
import { ShareSessionButton } from './ShareSessionButton';
import { Modal } from '../layout/Modal';
import { exerciseMeta } from '../../data/workouts';
import type { PostWorkout } from '../../lib/social';
import type { HealthWorkoutSummary } from '../../types';

// Shared by "Share with a friend" and "Post to feed" - both need the exact
// same real session data (a route only makes sense for one specific
// GPS-tracked activity, not a combined multi-activity day). Guarded with a
// try/catch and a uuid check: a workout synced before this session's uuid
// field existed (still sitting in persisted state) would reject the native
// lookup outright, and that must never block sharing/posting entirely - no
// route beats no share.
async function resolveWatchActivity(selectedWatchWorkouts: HealthWorkoutSummary[]): Promise<PostWorkout> {
  const totalMin = Math.round(selectedWatchWorkouts.reduce((sum, w) => sum + w.durationMinutes, 0));
  const totalMeters = selectedWatchWorkouts.reduce((sum, w) => sum + (w.distanceMeters ?? 0), 0);
  const names = selectedWatchWorkouts.map((w) => w.activityName).join(' + ');
  const category = categoryForActivityName(selectedWatchWorkouts[0].activityName);
  let route: Awaited<ReturnType<typeof getWorkoutRoute>> = [];
  if (selectedWatchWorkouts.length === 1 && selectedWatchWorkouts[0].uuid) {
    try {
      route = await getWorkoutRoute(selectedWatchWorkouts[0].uuid);
    } catch {
      route = [];
    }
  }
  return {
    name: names,
    duration: `${totalMin} min`,
    category,
    exercises: selectedWatchWorkouts.map((w) => ({ name: w.activityName, sets: 1, reps: `${Math.round(w.durationMinutes)} min` })),
    isActivity: true,
    distanceMeters: totalMeters > 0 ? totalMeters : undefined,
    route: route.length > 1 ? route : undefined,
  };
}

function DayRecap({ sim }: { sim: number }) {
  const workoutState = useAppStore((s) => s.workoutState);
  const entries = Object.entries(workoutState[sim] ?? {}).filter(([, ws]) => ws.completed || Object.keys(ws.exDone).length > 0);
  if (entries.length === 0) return <div className="empty-hint">Nothing was logged that day.</div>;
  return (
    <>
      {entries.map(([wid, ws]) => {
        const w = getWorkout(wid);
        return (
          <div key={wid} style={{ marginBottom: 16 }}>
            <div className="goal-title" style={{ marginBottom: 6 }}>
              {w?.name ?? 'Workout'} {ws.completed ? '· completed' : '· partly done'}
            </div>
            {(w?.exercises ?? []).map((ex, i) => (
              <div key={i} className="goal-row" style={{ padding: '6px 0' }}>
                <div className="goal-main">
                  <div className={`goal-title${ws.exDone[i] ? ' done' : ''}`}>{ex.name}</div>
                  <div className="goal-meta">{exerciseMeta(ex)}</div>
                </div>
                <div className="goal-xp">{ws.exDone[i] ? 'Done' : 'Skipped'}</div>
              </div>
            ))}
          </div>
        );
      })}
    </>
  );
}

export function TrainScreen() {
  const simDay = useAppStore((s) => s.simDay);
  const weekPlan = useAppStore((s) => s.weekPlan);
  const workoutState = useAppStore((s) => s.workoutState);
  const openWorkout = useAppStore((s) => s.openWorkout);
  const openWorkoutEditor = useAppStore((s) => s.openWorkoutEditor);
  const setDayWorkout = useAppStore((s) => s.setDayWorkout);
  const setDayToWatchSync = useAppStore((s) => s.setDayToWatchSync);
  const watchSynced = useAppStore((s) => s.today._watchWorkoutSynced);
  const selectedWatchWorkouts = useAppStore((s) => s.today.selectedWatchWorkouts);
  const availableWatchWorkouts = useAppStore((s) => s.today.availableWatchWorkouts);
  const toggleWatchWorkoutSelection = useAppStore((s) => s.toggleWatchWorkoutSelection);
  const showToast = useAppStore((s) => s.showToast);
  const openComposer = useAppStore((s) => s.openComposer);
  const userId = useUserId();
  const myPrograms = useMyWorkouts();

  const [pickerDay, setPickerDay] = useState<number | null>(null);
  const [recapDay, setRecapDay] = useState<number | null>(null);

  const plan = todayPlan(weekPlan);
  const todayIdx = todayPlanIndex();
  const todayWorkout = plan.type === 'train' && plan.key ? getWorkout(plan.key) : undefined;

  const pickerOptions = [
    ...Object.entries(WORKOUTS).map(([key, w]) => ({ key, name: w.name })),
    ...myPrograms.map((w) => ({ key: w.id, name: w.name })),
  ];

  function pickDay(i: number, key: string | null) {
    setDayWorkout(i, key);
    setPickerDay(null);
  }

  function pickDayWatchSync(i: number) {
    setDayToWatchSync(i);
    setPickerDay(null);
  }

  function renderDayPicker(i: number, currentType: 'train' | 'rest' | 'watch', currentKey?: string) {
    return (
      <div className="day-picker">
        <div className={`day-picker-opt${currentType === 'rest' ? ' current' : ''}`} onClick={() => pickDay(i, null)}>
          Rest day
        </div>
        {healthAvailableOnPlatform() && (
          <div className={`day-picker-opt${currentType === 'watch' ? ' current' : ''}`} onClick={() => pickDayWatchSync(i)}>
            Sync from Apple Fitness
          </div>
        )}
        {pickerOptions.map((opt) => (
          <div
            key={opt.key}
            className={`day-picker-opt${currentType === 'train' && currentKey === opt.key ? ' current' : ''}`}
            onClick={() => pickDay(i, opt.key)}
          >
            {opt.name}
          </div>
        ))}
      </div>
    );
  }

  const changeProgramButton = (
    <button
      className="icon-btn"
      style={{ position: 'absolute', top: 12, right: 12 }}
      onClick={(e) => {
        e.stopPropagation();
        setPickerDay(pickerDay === todayIdx ? null : todayIdx);
      }}
    >
      <Icon name={pickerDay === todayIdx ? 'x' : 'edit'} />
    </button>
  );


  async function handleDelete(id: string) {
    if (!userId) return;
    await deleteWorkout(userId, id);
    showToast('Program deleted');
  }

  async function handleShareLink(w: (typeof myPrograms)[number]) {
    if (!userId) return;
    const url = await createShareLink(userId, { name: w.name, duration: w.duration, exercises: w.exercises, category: w.category });
    if (!url) {
      showToast('Could not create the link');
      return;
    }
    try {
      await Clipboard.write({ string: url });
      showToast('Link copied');
    } catch {
      showToast(url);
    }
  }

  return (
    <>
      <WeekStrip />
      {plan.type === 'watch' ? (
        <div className="rest-hero card" style={{ position: 'relative' }}>
          {changeProgramButton}
          <Icon name={watchSynced ? 'check' : 'watch'} />
          <h3 style={{ fontSize: 17, marginBottom: 6 }}>
            {selectedWatchWorkouts && selectedWatchWorkouts.length > 0
              ? `${selectedWatchWorkouts.length} ${selectedWatchWorkouts.length === 1 ? 'activity' : 'activities'} synced`
              : 'Sync from Apple Fitness'}
          </h3>
          <p style={{ color: 'var(--text-dim)', fontSize: 13, maxWidth: 230, margin: '0 auto' }}>
            {selectedWatchWorkouts && selectedWatchWorkouts.length > 0
              ? `${Math.round(selectedWatchWorkouts.reduce((sum, w) => sum + w.durationMinutes, 0))} min · ${Math.round(selectedWatchWorkouts.reduce((sum, w) => sum + w.kcal, 0))} kcal total · +40 XP`
              : availableWatchWorkouts && availableWatchWorkouts.length > 0
                ? 'Tap any activity below to count it — you can pick more than one.'
                : 'Log any workout on Apple Fitness today and it counts automatically — no need to pick a session in advance.'}
          </p>
          {availableWatchWorkouts && availableWatchWorkouts.length > 0 && (
            <div className="day-picker" style={{ marginTop: 12, textAlign: 'left' }}>
              {availableWatchWorkouts.map((w, i) => {
                const isSelected = !!selectedWatchWorkouts?.some((sel) => sel.startDate === w.startDate);
                return (
                  <div
                    key={i}
                    className={`day-picker-opt${isSelected ? ' current' : ''}`}
                    onClick={() => toggleWatchWorkoutSelection(w)}
                  >
                    {isSelected ? '✓ ' : ''}
                    {w.activityName} · {formatTime(w.startDate)} · {Math.round(w.durationMinutes)} min
                  </div>
                );
              })}
            </div>
          )}
          {watchSynced && selectedWatchWorkouts && selectedWatchWorkouts.length > 0 && (
            <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
              <ShareSessionButton resolveActivity={() => resolveWatchActivity(selectedWatchWorkouts)} />
              <button
                className="btn btn-ghost"
                onClick={async () => {
                  const activity = await resolveWatchActivity(selectedWatchWorkouts);
                  openComposer({
                    workout: activity,
                    defaultCaption: `Just finished ${activity.name} via Apple Fitness — ${activity.duration}`,
                    defaultType: activity.category,
                    locked: true,
                  });
                }}
              >
                <Icon name={workoutTypeById(categoryForActivityName(selectedWatchWorkouts[0].activityName))?.icon ?? 'zap'} style={{ width: 15, height: 15 }} />
                Post to feed
              </button>
            </div>
          )}
          {pickerDay === todayIdx && renderDayPicker(todayIdx, plan.type, plan.key)}
        </div>
      ) : plan.type !== 'train' || !todayWorkout ? (
        <div className="rest-hero card" style={{ position: 'relative' }}>
          {changeProgramButton}
          <Icon name="moon" />
          <h3 style={{ fontSize: 17, marginBottom: 6 }}>Recovery day</h3>
          <p style={{ color: 'var(--text-dim)', fontSize: 13, maxWidth: 230, margin: '0 auto' }}>
            No lifting session today. Light mobility and hydration goals still earn XP on Home.
          </p>
          {pickerDay === todayIdx && renderDayPicker(todayIdx, plan.type, plan.key)}
        </div>
      ) : (
        <>
          <div className="workout-cta" style={{ marginBottom: pickerDay === todayIdx ? 8 : 18, position: 'relative' }} onClick={() => openWorkout(plan.key!)}>
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
            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 2 }}>
              <button
                className="icon-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  setPickerDay(pickerDay === todayIdx ? null : todayIdx);
                }}
              >
                <Icon name={pickerDay === todayIdx ? 'x' : 'edit'} />
              </button>
              <div className="wc-arrow" style={{ marginLeft: 0 }}>
                <Icon name="chevron" />
              </div>
            </div>
          </div>
          {pickerDay === todayIdx && <div style={{ marginBottom: 18 }}>{renderDayPicker(todayIdx, plan.type, plan.key)}</div>}
        </>
      )}

      <div className="section-label">This week</div>
      <div className="week-legend">
        <span className="legend-today">Today: log sets</span>
        <span>Ahead: edit your program</span>
        <span>Past: view what you did</span>
      </div>
      <div className="card">
        {weekPlan.map((p, i) => {
          const w = p.type === 'train' && p.key ? getWorkout(p.key) : undefined;
          const label = w?.name ?? (p.type === 'train' ? 'Workout' : p.type === 'watch' ? 'Sync from Watch' : 'Recovery Day');
          const isToday = i === todayIdx;
          const isPast = i < todayIdx;
          const todayStyle = isToday
            ? { background: 'var(--accent-soft)', border: '1.5px solid var(--accent)', borderRadius: 14, padding: '8px 10px', margin: '4px -10px' }
            : undefined;
          let onMain: (() => void) | undefined;
          if (isToday) {
            onMain = p.type === 'train' && w ? () => openWorkout(p.key!) : undefined;
          } else if (isPast) {
            onMain = () => setRecapDay(i);
          } else if (p.type === 'train' && p.key) {
            // Same view as Today and My programs (program + Track workout);
            // editing a program stays on its pencil icon.
            onMain = () => openWorkout(p.key!);
          }
          return (
            <div key={i} style={todayStyle}>
              <div className="goal-row">
                <TypeIconBadge category={w?.category} fallbackIcon={p.type === 'watch' ? 'watch' : 'moon'} />
                <div className="goal-main" style={{ cursor: onMain ? 'pointer' : 'default' }} onClick={onMain}>
                  <div className="goal-day-label">{WEEKDAY_LABELS[i]}</div>
                  <div className="goal-title">
                    {label}
                    {isToday && <span style={{ color: 'var(--accent)', fontWeight: 700 }}> • Today</span>}
                    {isPast && <span style={{ color: 'var(--text-faint)', fontWeight: 600 }}> • Done</span>}
                  </div>
                  {w ? (
                    <div className="goal-meta">{w.duration}</div>
                  ) : p.type === 'watch' ? (
                    <div className="goal-meta">Any workout logged on Apple Fitness counts</div>
                  ) : (
                    <div className="goal-meta">Mobility &amp; hydration goals only</div>
                  )}
                </div>
                {!isPast && (
                  <button className="icon-btn" onClick={() => setPickerDay(pickerDay === i ? null : i)}>
                    <Icon name={pickerDay === i ? 'x' : 'edit'} />
                  </button>
                )}
              </div>
              {pickerDay === i && !isPast && renderDayPicker(i, p.type, p.key)}
            </div>
          );
        })}
      </div>
      {recapDay !== null && (
        <Modal open onClose={() => setRecapDay(null)} title={`${WEEKDAY_LABELS[recapDay]} - what you did`}>
          <DayRecap sim={simDay - (todayIdx - recapDay)} />
        </Modal>
      )}

      <div className="section-label">
        My programs
        <button className="link-btn" onClick={() => openWorkoutEditor('new')}>
          <Icon name="plus" style={{ width: 13, height: 13 }} /> Create
        </button>
      </div>
      <div className="card">
        {myPrograms.length === 0 && <div className="empty-hint">No custom programs yet — create one or import a shared link.</div>}
        {myPrograms.map((w) => {
          return (
          <div className="program-row" key={w.id}>
            <TypeIconBadge category={w.category} size={32} />
            <div className="goal-main" onClick={() => openWorkout(w.id)}>
              <div className="goal-title">{w.name}</div>
              <div className="goal-meta">
                {w.duration} · {w.exercises.length} exercises
              </div>
            </div>
            <div className="program-actions">
              <button className="icon-btn" onClick={() => handleShareLink(w)} title="Copy share link">
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
          );
        })}
      </div>
    </>
  );
}
