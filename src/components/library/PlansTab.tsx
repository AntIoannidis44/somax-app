import { useMemo, useState } from 'react';
import { Icon } from '../Icon';
import { TypeIconBadge } from '../TypeIconBadge';
import { useAppStore } from '../../store/useAppStore';
import { useUserId } from '../../lib/useSession';
import { exerciseMeta } from '../../data/workouts';
import { saveWorkout } from '../../lib/customWorkouts';
import { RUN_DISTANCES, buildRunPlan, fmtTime, parseTime, type RunDistanceId, type RunPlan } from '../../lib/plans/running';
import { currentWeekIndex, endPlan, logPlanTime, planFor, startPlan, useActivePlan } from '../../lib/plans/activePlan';
import type { WorkoutDef } from '../../types';

interface GoalPreset {
  id: string;
  label: string;
  sub: string;
  distance: RunDistanceId;
  targetSec: number | null;
  firstTimer?: boolean;
}

const RUN_GOALS: GoalPreset[] = [
  { id: 'first-5k', label: 'Run your first 5K', sub: 'From walking to running 5K non-stop', distance: '5k', targetSec: null, firstTimer: true },
  { id: '5k-30', label: 'Break 30:00 for 5K', sub: '6:00/km', distance: '5k', targetSec: 30 * 60 },
  { id: '5k-25', label: 'Break 25:00 for 5K', sub: '5:00/km', distance: '5k', targetSec: 25 * 60 },
  { id: '5k-20', label: 'Break 20:00 for 5K', sub: '4:00/km', distance: '5k', targetSec: 20 * 60 },
  { id: '10k-60', label: 'Break 60:00 for 10K', sub: '6:00/km', distance: '10k', targetSec: 60 * 60 },
  { id: '10k-50', label: 'Break 50:00 for 10K', sub: '5:00/km', distance: '10k', targetSec: 50 * 60 },
  { id: 'half-2h', label: 'Half marathon under 2 hours', sub: '5:41/km', distance: 'half', targetSec: 2 * 3600 },
  { id: 'mar-4h', label: 'Marathon under 4 hours', sub: '5:41/km', distance: 'marathon', targetSec: 4 * 3600 },
  { id: 'custom', label: 'Custom running goal', sub: 'Any distance, any time', distance: '5k', targetSec: null },
];

const COMING = [
  { label: 'Strength', sub: 'Squat, bench, deadlift and pull-up goals', cat: 'gym' },
  { label: 'Cycling', sub: 'FTP and distance goals', cat: 'ride' },
  { label: 'Swimming', sub: 'Swim further, swim faster', cat: 'swim' },
  { label: 'Sport performance', sub: 'Football, basketball, tennis, boxing, golf', cat: 'fitness' },
  { label: 'Fat loss & general fitness', sub: 'Training + nutrition goals', cat: 'fitness' },
  { label: 'Pilates & mobility', sub: 'Core, flexibility and posture', cat: 'pilates' },
];

function SessionRow({ s }: { s: WorkoutDef }) {
  const userId = useUserId();
  const showToast = useAppStore((st) => st.showToast);
  const [open, setOpen] = useState(false);
  const [added, setAdded] = useState(false);
  async function add() {
    if (!userId) return;
    const id = await saveWorkout(userId, { name: s.name, duration: s.duration, exercises: s.exercises, category: s.category });
    if (id) {
      setAdded(true);
      showToast('Added to your programs');
    } else showToast('Could not add this session');
  }
  return (
    <div className="lib-ex-row">
      <button type="button" className="plan-session-head" onClick={() => setOpen((v) => !v)}>
        <span className="lib-ex-name">{s.name}</span>
        <span className="lib-ex-meta">{s.duration}</span>
        <Icon name="chevron" style={{ width: 13, height: 13, transform: open ? 'rotate(90deg)' : undefined, color: 'var(--text-faint)' }} />
      </button>
      {open && (
        <div className="plan-session-body">
          {s.exercises.map((e, i) => (
            <div key={i} className="lib-ex-meta">
              <b style={{ color: 'var(--text)' }}>{e.name}</b> · {e.reps && e.sets === 1 ? e.reps : exerciseMeta(e)}
              {e.sets > 1 && e.reps ? ` × ${e.reps}` : ''}
            </div>
          ))}
          <button className="btn btn-sm btn-ghost" style={{ marginTop: 8 }} disabled={added} onClick={add}>
            {added ? 'Added' : 'Add to my programs'}
          </button>
        </div>
      )}
    </div>
  );
}

function WeekList({ plan, highlight }: { plan: RunPlan; highlight?: number }) {
  const [openWeek, setOpenWeek] = useState<number | null>(highlight ?? 0);
  return (
    <div className="lib-list">
      {plan.weeks.map((w, i) => (
        <div key={w.week} className={`plan-week${i === highlight ? ' current' : ''}`}>
          <button type="button" className="plan-week-head" onClick={() => setOpenWeek(openWeek === i ? null : i)}>
            <span className="plan-week-no">Week {w.week}</span>
            <span className="plan-week-focus">{w.focus}</span>
            <span className={`plan-phase plan-phase-${w.phase}`}>{w.phase}</span>
          </button>
          {openWeek === i && (
            <div className="plan-week-body">
              {w.sessions.map((s, j) => (
                <SessionRow key={j} s={s} />
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function PaceStrip({ plan }: { plan: RunPlan }) {
  if (!plan.paces) return null;
  const p = plan.paces;
  return (
    <div className="recipe-stat-row plan-paces">
      <div className="recipe-stat"><b>{p.easy.replace('/km', '')}</b><span>easy /km</span></div>
      <div className="recipe-stat"><b>{p.threshold.replace('/km', '')}</b><span>tempo</span></div>
      <div className="recipe-stat"><b>{p.interval.replace('/km', '')}</b><span>interval</span></div>
      <div className="recipe-stat"><b>{p.goal.replace('/km', '')}</b><span>goal</span></div>
    </div>
  );
}

function Setup({ goal, onBack }: { goal: GoalPreset; onBack: () => void }) {
  const showToast = useAppStore((s) => s.showToast);
  const [distance, setDistance] = useState<RunDistanceId>(goal.distance);
  const [canRun, setCanRun] = useState(!goal.firstTimer);
  const [current, setCurrent] = useState('');
  const [target, setTarget] = useState(goal.targetSec ? fmtTime(goal.targetSec) : '');
  const [days, setDays] = useState<3 | 4 | 5>(4);
  const distLabel = RUN_DISTANCES.find((d) => d.id === distance)!.label;

  const currentSec = canRun ? parseTime(current) : null;
  const targetSec = canRun ? parseTime(target) : null;
  const ready = !canRun || (currentSec != null && targetSec != null);
  const plan = useMemo(() => (ready ? buildRunPlan({ distance, currentSec, targetSec, daysPerWeek: days }) : null), [ready, distance, currentSec, targetSec, days]);
  const alreadyThere = currentSec != null && targetSec != null && currentSec <= targetSec;

  return (
    <>
      <button className="link-btn" style={{ margin: '8px 0 10px' }} onClick={onBack}>
        <Icon name="chevron" style={{ width: 12, height: 12, transform: 'rotate(180deg)' }} /> All goals
      </button>
      <h2 className="plan-h">{goal.label}</h2>

      {goal.id === 'custom' && (
        <>
          <div className="lib-filter-label">Distance</div>
          <div className="feed-filters lib-chips">
            {RUN_DISTANCES.map((d) => (
              <button key={d.id} className={`type-chip${distance === d.id ? ' active' : ''}`} onClick={() => setDistance(d.id)}>
                {d.label}
              </button>
            ))}
          </div>
        </>
      )}

      <div className="lib-filter-label">Can you run {distLabel} non-stop right now?</div>
      <div className="composer-visibility" style={{ marginBottom: 10 }}>
        <button className={`composer-visibility-opt${canRun ? ' active' : ''}`} onClick={() => setCanRun(true)}>Yes</button>
        <button className={`composer-visibility-opt${!canRun ? ' active' : ''}`} onClick={() => setCanRun(false)}>Not yet</button>
      </div>

      {canRun && (
        <div className="plan-times">
          <label>
            <span>Your current {distLabel} time</span>
            <input className="lib-name-input" inputMode="numeric" placeholder={distance === '5k' ? 'e.g. 30:00' : 'h:mm:ss'} value={current} onChange={(e) => setCurrent(e.target.value)} />
          </label>
          <label>
            <span>Target time</span>
            <input className="lib-name-input" inputMode="numeric" placeholder="e.g. 25:00" value={target} onChange={(e) => setTarget(e.target.value)} />
          </label>
        </div>
      )}

      <div className="lib-filter-label">Runs per week</div>
      <div className="composer-visibility" style={{ marginBottom: 12 }}>
        {([3, 4, 5] as const).map((d) => (
          <button key={d} className={`composer-visibility-opt${days === d ? ' active' : ''}`} onClick={() => setDays(d)}>
            {d} days
          </button>
        ))}
      </div>

      {alreadyThere && <div className="macro-search-hint">You're already at that time - set a faster target.</div>}
      {plan && !alreadyThere && (
        <>
          <div className="plan-summary card">
            <div className="plan-summary-top">
              <TypeIconBadge category="run" size={40} />
              <div>
                <b>{plan.title}</b>
                <div className="lib-card-meta">
                  <span className={`lib-level lib-level-${plan.level}`}>{plan.level}</span>
                  <span>{plan.weeks.length} weeks</span>
                  <span>{days} runs/week</span>
                </div>
              </div>
            </div>
            {plan.milestoneSec && targetSec && (
              <div className="plan-milestone">
                <Icon name="trophy" style={{ width: 14, height: 14, display: 'inline', verticalAlign: '-2px' }} /> {fmtTime(targetSec)} is a big jump from {fmtTime(currentSec!)} for one block, so this plan
                takes you to <b>{fmtTime(plan.milestoneSec)}</b> first. Hit it and we'll build the next step.
              </div>
            )}
            <p className="lib-desc" style={{ margin: '8px 0 0' }}>{plan.summary}</p>
          </div>
          <PaceStrip plan={plan} />
          <button
            className="btn btn-primary"
            style={{ marginBottom: 14 }}
            onClick={() => {
              // Keep the real target: the engine re-derives the stepping stone
              // each time, so logging a time after block 1 plans block 2.
              startPlan(plan.title, { distance, currentSec, targetSec, daysPerWeek: days });
              showToast('Plan started');
              onBack();
            }}
          >
            <Icon name="go" style={{ width: 15, height: 15 }} /> Start this plan
          </button>
          <div className="section-label">Week by week</div>
          <WeekList plan={plan} />
        </>
      )}
    </>
  );
}

function ActivePlanCard() {
  const active = useActivePlan()!;
  const plan = useMemo(() => planFor(active), [active]);
  const wk = currentWeekIndex(active, plan);
  const [logging, setLogging] = useState(false);
  const [time, setTime] = useState('');
  const showToast = useAppStore((s) => s.showToast);
  const distLabel = RUN_DISTANCES.find((d) => d.id === active.input.distance)!.label;
  const best = active.results.length ? Math.min(...active.results.map((r) => r.sec)) : null;

  function submit() {
    const sec = parseTime(time);
    if (!sec) return showToast('Enter a time like 27:30');
    const before = plan.weeks.length - wk;
    logPlanTime(sec);
    const after = buildRunPlan({ ...active.input, currentSec: sec }).weeks.length;
    setLogging(false);
    setTime('');
    showToast(active.input.targetSec && sec <= active.input.targetSec ? 'Goal hit! Set your next target' : `Plan updated - ${after} week${after === 1 ? '' : 's'} to go (was ${before})`);
  }

  return (
    <>
      <div className="section-label">Your plan</div>
      <div className="plan-summary card">
        <div className="plan-summary-top">
          <TypeIconBadge category="run" size={40} />
          <div style={{ flex: 1 }}>
            <b>{plan.title}</b>
            <div className="lib-card-meta">
              {plan.milestoneSec && active.input.targetSec && <span>Step 1 towards {fmtTime(active.input.targetSec)}</span>}
              <span>Week {wk + 1} of {plan.weeks.length}</span>
              {best && <span>Best {fmtTime(best)}</span>}
            </div>
          </div>
        </div>
        <div className="plan-progress"><span style={{ width: `${((wk + 1) / plan.weeks.length) * 100}%` }} /></div>
        {active.results.length > 1 && (
          <div className="lib-card-meta" style={{ marginTop: 8 }}>
            {active.results.map((r, i) => (
              <span key={i}>{fmtTime(r.sec)}</span>
            ))}
          </div>
        )}
        {logging ? (
          <div className="plan-times" style={{ marginTop: 10 }}>
            <label>
              <span>{distLabel} time trial result</span>
              <input className="lib-name-input" inputMode="numeric" placeholder="e.g. 27:30" value={time} onChange={(e) => setTime(e.target.value)} autoFocus />
            </label>
            <div className="lib-anon" style={{ marginTop: 8 }}>
              <button className="btn btn-ghost" onClick={() => setLogging(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={submit}>Update my plan</button>
            </div>
          </div>
        ) : (
          <div className="lib-anon" style={{ marginTop: 10 }}>
            <button className="btn btn-primary" onClick={() => setLogging(true)}>
              <Icon name="clock" style={{ width: 15, height: 15 }} /> Log a time
            </button>
            <button className="btn btn-ghost" onClick={() => window.confirm('End this plan?') && endPlan()}>End plan</button>
          </div>
        )}
      </div>
      <PaceStrip plan={plan} />
      <WeekList plan={plan} highlight={wk} />
    </>
  );
}

export function PlansTab() {
  const active = useActivePlan();
  const [goal, setGoal] = useState<GoalPreset | null>(null);

  if (goal) return <Setup goal={goal} onBack={() => setGoal(null)} />;

  return (
    <>
      {active && <ActivePlanCard />}
      <p className="lib-desc" style={{ marginTop: 10 }}>
        Pick a goal and log where you are now. Your plan's length, volume and paces are built from the gap, and it updates every time you log a new time.
      </p>
      <div className="section-label">Running</div>
      <div className="lib-list">
        {RUN_GOALS.map((g) => (
          <button key={g.id} type="button" className="lib-card" onClick={() => setGoal(g)}>
            <TypeIconBadge category="run" size={40} />
            <div className="lib-card-main">
              <div className="lib-card-name">{g.label}</div>
              <div className="lib-card-credit">{g.sub}</div>
            </div>
            <Icon name="chevron" className="lib-card-chev" />
          </button>
        ))}
      </div>
      <div className="section-label">More sports</div>
      <div className="lib-list">
        {COMING.map((c) => (
          <div key={c.label} className="lib-card" style={{ opacity: 0.6, cursor: 'default' }}>
            <TypeIconBadge category={c.cat} size={40} />
            <div className="lib-card-main">
              <div className="lib-card-name">{c.label}</div>
              <div className="lib-card-credit">{c.sub}</div>
            </div>
            <span className="lib-level lib-level-intermediate">Soon</span>
          </div>
        ))}
      </div>
    </>
  );
}
