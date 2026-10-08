import { useState } from 'react';
import { Icon } from '../Icon';
import { TypeIconBadge } from '../TypeIconBadge';
import { WeekStrip } from './WeekStrip';
import { WORKOUTS } from '../../data/workouts';
import { useAppStore } from '../../store/useAppStore';
import { useUserId } from '../../lib/useSession';
import { healthAvailableOnPlatform, getWorkoutRoute } from '../../lib/health';
import { getWorkout, useMyWorkouts, deleteWorkout } from '../../lib/customWorkouts';
import { WEEKDAY_LABELS, isWorkoutDone, todayPlan, todayPlanIndex } from '../../lib/schedule';
import { formatTime } from '../../lib/format';
import { categoryForActivityName, workoutTypeById } from '../../data/workoutTypes';
import { ShareSessionButton } from './ShareSessionButton';
import { ShareProgramSheet } from './ShareProgramSheet';
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

// What actually happened on a past day: logged gym sets (workoutState) plus
// everything that earned XP that day (Watch syncs, checklist items, goals),
// which is where Apple Fitness days live - they never touch workoutState.
function DayRecap({ sim, dayName }: { sim: number; dayName: string }) {
  const workoutState = useAppStore((s) => s.workoutState);
  const history = useAppStore((s) => s.history);
  const entries = Object.entries(workoutState[sim] ?? {}).filter(([, ws]) => ws.completed || Object.keys(ws.exDone).length > 0);
  const earned = history.filter((h) => h.type === 'xp' && h.day === sim);
  const totalXp = earned.reduce((sum, h) => sum + h.xp, 0);

  if (entries.length === 0 && earned.length === 0) {
    return (
      <div className="recap-empty">
        <Icon name="moon" />
        <b>Nothing logged on {dayName}</b>
        <span>Workouts, Apple Watch syncs and checklist items you complete show up here.</span>
      </div>
    );
  }

  return (
    <>
      <div className="recap-stats">
        <div>
          XP earned<b>+{totalXp}</b>
        </div>
        <div>
          Workouts<b>{entries.filter(([, ws]) => ws.completed).length + earned.filter((h) => /synced from Apple Fitness/.test(h.label)).length}</b>
        </div>
        <div>
          Items<b>{earned.length}</b>
        </div>
      </div>
      {entries.map(([wid, ws]) => {
        const w = getWorkout(wid);
        return (
          <div key={wid}>
            <div className="sheet-sub">
              {w?.name ?? 'Workout'} · {ws.completed ? 'completed' : 'partly done'}
            </div>
            {(w?.exercises ?? []).map((ex, i) => (
              <div key={i} className="sheet-ex">
                <span className="n">{ex.name}</span>
                <span className="r">{exerciseMeta(ex)}</span>
                <span className={ws.exDone[i] ? 'donepill' : 'viewpill'}>{ws.exDone[i] ? 'Done' : 'Skipped'}</span>
              </div>
            ))}
          </div>
        );
      })}
      {earned.length > 0 && (
        <>
          <div className="sheet-sub">What you earned XP for</div>
          {earned.map((h, i) => (
            <div key={i} className="sheet-ex">
              <span className="n">{h.label}</span>
              <span className="goal-xp">+{h.xp} XP</span>
            </div>
          ))}
        </>
      )}
    </>
  );
}

export function TrainScreen() {
  const simDay = useAppStore((s) => s.simDay);
  const history = useAppStore((s) => s.history);
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

  const [weekOpen, setWeekOpen] = useState(false);
  const [sheetDay, setSheetDay] = useState<number | null>(null);
  const [progMenu, setProgMenu] = useState<(typeof myPrograms)[number] | null>(null);
  const [sharingProg, setSharingProg] = useState<(typeof myPrograms)[number] | null>(null);

  const plan = todayPlan(weekPlan);
  const todayIdx = todayPlanIndex();
  const todayWorkout = plan.type === 'train' && plan.key ? getWorkout(plan.key) : undefined;

  const pickerOptions = [
    ...Object.entries(WORKOUTS).map(([key, w]) => ({ key, name: w.name })),
    ...myPrograms.map((w) => ({ key: w.id, name: w.name })),
  ];

  function pickDay(i: number, key: string | null) {
    setDayWorkout(i, key);
  }

  function pickDayWatchSync(i: number) {
    setDayToWatchSync(i);
  }

  // Real calendar date for each slot of this Sun-Sat week.
  function dateOf(i: number): number {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate() - (todayIdx - i)).getDate();
  }
  function dayDone(i: number): boolean {
    const p = weekPlan[i];
    const sim = simDay - (todayIdx - i);
    if (p.type === 'watch') return history.some((h) => h.day === sim && /synced from Apple Fitness/.test(h.label));
    return p.type === 'train' && !!p.key && isWorkoutDone(workoutState, sim, p.key);
  }
  function dayName(i: number): string {
    const p = weekPlan[i];
    if (p.type === 'train' && p.key) return getWorkout(p.key)?.name ?? 'Workout';
    return p.type === 'watch' ? 'Apple Fitness sync' : 'Recovery day';
  }
  const sessionCount = weekPlan.filter((p) => p.type !== 'rest').length;
  const doneCount = weekPlan.filter((_, i) => i < todayIdx && dayDone(i)).length + (dayDone(todayIdx) ? 1 : 0);

  function chooseForDay(apply: () => void) {
    apply();
    setSheetDay(null);
    showToast('Plan updated');
  }

  function renderDaySheet(i: number) {
    const p = weekPlan[i];
    if (i < todayIdx) return <DayRecap sim={simDay - (todayIdx - i)} dayName={['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][i]} />;
    const w = p.type === 'train' && p.key ? getWorkout(p.key) : undefined;
    return (
      <>
        {w && (
          <>
            <div className="sheet-sub" style={{ marginTop: 0 }}>
              {w.exercises.length} exercises · {w.duration}
            </div>
            {w.exercises.map((ex, j) => (
              <div className="sheet-ex" key={j}>
                <span className="n">{ex.name}</span>
                <span className="r">{exerciseMeta(ex)}</span>
              </div>
            ))}
            <div style={{ display: 'grid', gap: 8, marginTop: 16 }}>
              {i === todayIdx && (
                <button className="btn btn-primary" onClick={() => { setSheetDay(null); openWorkout(p.key!); }}>
                  Start workout
                </button>
              )}
              <button className="btn btn-ghost" onClick={() => { setSheetDay(null); openWorkoutEditor(p.key!); }}>
                <Icon name="edit" style={{ width: 15, height: 15 }} /> Edit exercises
              </button>
            </div>
          </>
        )}
        <div className="sheet-sub">{w ? 'Swap for' : 'Change to'}</div>
        <button className={`sheet-opt${p.type === 'rest' ? ' on' : ''}`} onClick={() => chooseForDay(() => pickDay(i, null))}>
          <div className="type-icon-badge muted" style={{ width: 34, height: 34 }}>
            <Icon name="moon" />
          </div>
          <div>
            <div className="t">Rest day</div>
            <div className="s">Mobility and hydration only</div>
          </div>
          {p.type === 'rest' && <Icon name="check" className="tick" />}
        </button>
        {healthAvailableOnPlatform() && (
          <button className={`sheet-opt${p.type === 'watch' ? ' on' : ''}`} onClick={() => chooseForDay(() => pickDayWatchSync(i))}>
            <div className="type-icon-badge" style={{ width: 34, height: 34, background: 'linear-gradient(140deg,#1f2937,#0a0f1a)' }}>
              <Icon name="watch" />
            </div>
            <div>
              <div className="t">Sync from Apple Fitness</div>
              <div className="s">Any Watch workout counts</div>
            </div>
            {p.type === 'watch' && <Icon name="check" className="tick" />}
          </button>
        )}
        {pickerOptions.map((opt) => {
          const ow = getWorkout(opt.key);
          const on = p.type === 'train' && p.key === opt.key;
          return (
            <button key={opt.key} className={`sheet-opt${on ? ' on' : ''}`} onClick={() => chooseForDay(() => pickDay(i, opt.key))}>
              <TypeIconBadge category={ow?.category} />
              <div>
                <div className="t">{opt.name}</div>
                {ow && <div className="s">{ow.duration} · {ow.exercises.length} exercise{ow.exercises.length === 1 ? '' : 's'}</div>}
              </div>
              {on && <Icon name="check" className="tick" />}
            </button>
          );
        })}
      </>
    );
  }

  async function handleDelete(id: string) {
    if (!userId) return;
    await deleteWorkout(userId, id);
    showToast('Program deleted');
  }

  return (
    <>
      <WeekStrip onSelect={(i) => setSheetDay(i)} />
      <div className={`weekcard${weekOpen ? ' open' : ''}`}>
        <button className="wc-top" onClick={() => setWeekOpen((o) => !o)}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="t">This week</div>
            <div className="s">
              {doneCount} of {sessionCount} sessions done · {weekOpen ? 'tap a day to edit or review' : 'tap to see every day'}
            </div>
            <div className="pips">
              {weekPlan.map((p, i) => (
                <i key={i} className={p.type === 'rest' ? 'r' : i < todayIdx ? (dayDone(i) ? 'd' : '') : i === todayIdx ? 'n' : ''} />
              ))}
            </div>
          </div>
          <Icon name="chevron" className="chev" />
        </button>
        {weekOpen && (
          <>
            <div className="week-legend2">
              <span style={{ ['--c' as string]: 'var(--success)' }}>
                <i />
                Past: see what you did
              </span>
              <span style={{ ['--c' as string]: 'var(--accent)' }}>
                <i />
                Today: log sets
              </span>
              <span style={{ ['--c' as string]: 'var(--text-faint)' }}>
                <i />
                Ahead: edit
              </span>
            </div>
            {weekPlan.map((p, i) => {
              const w = p.type === 'train' && p.key ? getWorkout(p.key) : undefined;
              const isToday = i === todayIdx;
              const isPast = i < todayIdx;
              return (
                <button key={i} className={`drow${isToday ? ' now' : ''}${isPast ? ' past' : ''}`} onClick={() => setSheetDay(i)}>
                  {w ? (
                    <TypeIconBadge category={w.category} />
                  ) : (
                    <div className={`type-icon-badge${p.type === 'rest' ? ' muted' : ''}`} style={p.type === 'watch' ? { background: 'linear-gradient(140deg,#1f2937,#0a0f1a)' } : undefined}>
                      <Icon name={p.type === 'watch' ? 'watch' : 'moon'} />
                    </div>
                  )}
                  <div className="main">
                    <div className="dl">
                      {WEEKDAY_LABELS[i]} {dateOf(i)}
                      {isToday ? ' · Today' : ''}
                    </div>
                    <div className="t">{dayName(i)}</div>
                    <div className="s">
                      {w ? `${w.duration} · ${w.exercises.length} exercises` : p.type === 'watch' ? 'Any Apple Fitness workout counts' : 'Mobility and hydration only'}
                    </div>
                  </div>
                  {isPast && (p.type === 'rest' || dayDone(i)) ? (
                    <span className="donepill">
                      <Icon name="check" />
                      {p.type === 'rest' ? 'Rested' : 'Done'}
                    </span>
                  ) : isPast ? (
                    <span className="viewpill">View</span>
                  ) : isToday ? (
                    <Icon name="chevron" style={{ width: 16, height: 16, color: 'var(--text-faint)' }} />
                  ) : (
                    <span className="editpill">
                      <Icon name="edit" />
                    </span>
                  )}
                </button>
              );
            })}
          </>
        )}
      </div>
      {sheetDay !== null && (
        <Modal
          open
          onClose={() => setSheetDay(null)}
          title={`${WEEKDAY_LABELS[sheetDay]} ${dateOf(sheetDay)} · ${sheetDay < todayIdx ? 'what you did' : dayName(sheetDay)}`}
        >
          {renderDaySheet(sheetDay)}
        </Modal>
      )}

      {plan.type === 'watch' ? (
        <div className="tbig">
          <div className="tbig-top">
            <div className="k">Today · Apple Fitness</div>
            <button className="tbig-edit" onClick={() => setSheetDay(todayIdx)} aria-label="Change today's workout">
              <Icon name="edit" />
            </button>
          </div>
          <h2>
            {selectedWatchWorkouts && selectedWatchWorkouts.length > 0
              ? `${selectedWatchWorkouts.length} ${selectedWatchWorkouts.length === 1 ? 'activity' : 'activities'} synced`
              : 'Sync from Apple Watch'}
          </h2>
          <div className="m">
            <div>
              Activities<b>{availableWatchWorkouts?.length ?? 0}</b>
            </div>
            <div>
              Counted<b>{Math.round((selectedWatchWorkouts ?? []).reduce((sum, w) => sum + w.durationMinutes, 0))} min</b>
            </div>
            <div>
              Reward<b>+40 XP</b>
            </div>
          </div>
          {availableWatchWorkouts && availableWatchWorkouts.length > 0 ? (
            <div className="watch-list">
              {availableWatchWorkouts.map((w, i) => {
                const isSelected = !!selectedWatchWorkouts?.some((sel) => sel.startDate === w.startDate);
                const wt = workoutTypeById(categoryForActivityName(w.activityName));
                return (
                  <button key={i} className={`watch-act${isSelected ? ' on' : ''}`} onClick={() => toggleWatchWorkoutSelection(w)}>
                    <span className="wa-ic">
                      <Icon name={wt?.icon ?? 'watch'} />
                    </span>
                    <span className="wa-main">
                      <span className="wa-t">{w.activityName}</span>
                      <span className="wa-s">
                        {formatTime(w.startDate)} · {Math.round(w.durationMinutes)} min
                        {w.distanceMeters ? ` · ${(w.distanceMeters / 1000).toFixed(2)} km` : ''} · {Math.round(w.kcal)} kcal
                      </span>
                    </span>
                    <span className="wa-check">{isSelected && <Icon name="check" />}</span>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="watch-empty">
              <Icon name="watch" />
              <span>Log any workout on your Apple Watch today and it counts automatically. No need to pick one in advance.</span>
            </div>
          )}
          {watchSynced && selectedWatchWorkouts && selectedWatchWorkouts.length > 0 ? (
            <div className="tbig-actions">
              <button
                className="btn"
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
                <Icon name={workoutTypeById(categoryForActivityName(selectedWatchWorkouts[0].activityName))?.icon ?? 'zap'} style={{ width: 16, height: 16 }} />
                Post to feed
              </button>
              <ShareSessionButton resolveActivity={() => resolveWatchActivity(selectedWatchWorkouts)} />
            </div>
          ) : (
            availableWatchWorkouts &&
            availableWatchWorkouts.length > 0 && (
              <>
                {(selectedWatchWorkouts?.length ?? 0) === 0 && (
                  <button
                    className="btn"
                    onClick={() => availableWatchWorkouts.forEach((w) => toggleWatchWorkoutSelection(w))}
                  >
                    <Icon name="watch" style={{ width: 16, height: 16 }} />
                    {availableWatchWorkouts.length === 1 ? 'Count this activity' : `Count all ${availableWatchWorkouts.length} activities`}
                  </button>
                )}
                <div className="tbig-hint">Tap an activity to count it or leave it out.</div>
              </>
            )
          )}
        </div>
      ) : plan.type !== 'train' || !todayWorkout ? (
        <div className="tbig rest">
          <div className="tbig-top">
            <div className="k">Today</div>
            <button className="tbig-edit" onClick={() => setSheetDay(todayIdx)} aria-label="Change today's workout">
              <Icon name="edit" />
            </button>
          </div>
          <h2>Recovery day</h2>
          <div className="m">
            <div>
              Session<b>None</b>
            </div>
            <div>
              Focus<b>Mobility</b>
            </div>
          </div>
          <div className="watch-empty">
            <Icon name="moon" />
            <span>No session today. Light mobility, water and steps still count toward your daily XP.</span>
          </div>
        </div>
      ) : (
        <div className="tbig">
          <div className="tbig-top">
            <div className="k">Today</div>
            <button className="tbig-edit" onClick={() => setSheetDay(todayIdx)} aria-label="Change today's workout">
              <Icon name="edit" />
            </button>
          </div>
          <h2>{todayWorkout.name}</h2>
          <div className="m">
            <div>
              Exercises<b>{todayWorkout.exercises.length}</b>
            </div>
            <div>
              Est. time<b>{todayWorkout.duration}</b>
            </div>
            <div>
              Reward<b>+40 XP</b>
            </div>
          </div>
          <button className="btn" onClick={() => openWorkout(plan.key!)}>
            {isWorkoutDone(workoutState, simDay, plan.key!) ? (
              <>
                <Icon name="check" style={{ width: 16, height: 16 }} /> Completed · review
              </>
            ) : (
              <>
                <Icon name="go" style={{ width: 16, height: 16 }} /> Start workout
              </>
            )}
          </button>
        </div>
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
                {w.duration} · {w.exercises.length} exercise{w.exercises.length === 1 ? "" : "s"}
              </div>
            </div>
            <button className="icon-btn ghost" onClick={() => setProgMenu(w)} aria-label={`${w.name} options`}>
              <Icon name="more" style={{ width: 20, height: 20 }} />
            </button>
          </div>
          );
        })}
      </div>
      {progMenu && (
        <Modal open onClose={() => setProgMenu(null)} title={progMenu.name}>
          <div style={{ display: 'grid', gap: 8 }}>
            <button className="btn btn-primary" onClick={() => { setProgMenu(null); openWorkout(progMenu.id); }}>
              <Icon name="go" style={{ width: 16, height: 16 }} /> Open workout
            </button>
            <button className="btn btn-ghost" onClick={() => { setProgMenu(null); openWorkoutEditor(progMenu.id); }}>
              <Icon name="edit" style={{ width: 15, height: 15 }} /> Edit program
            </button>
            <button className="btn btn-ghost" onClick={() => { const w = progMenu; setProgMenu(null); setSharingProg(w); }}>
              <Icon name="send" style={{ width: 15, height: 15 }} /> Share program
            </button>
            <button className="btn btn-ghost" style={{ color: 'var(--danger)' }} onClick={() => { const id = progMenu.id; setProgMenu(null); handleDelete(id); }}>
              <Icon name="trash" style={{ width: 15, height: 15 }} /> Delete program
            </button>
          </div>
        </Modal>
      )}
      {sharingProg && (
        <ShareProgramSheet
          program={{ name: sharingProg.name, duration: sharingProg.duration, exercises: sharingProg.exercises, category: sharingProg.category }}
          onClose={() => setSharingProg(null)}
        />
      )}
    </>
  );
}
