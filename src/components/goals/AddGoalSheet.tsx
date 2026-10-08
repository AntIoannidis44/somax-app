import { useState } from 'react';
import { Icon } from '../Icon';
import { Modal } from '../layout/Modal';
import { useAppStore } from '../../store/useAppStore';
import { workoutTypeById } from '../../data/workoutTypes';
import { createWeightGoal } from '../../lib/weightGoals';
import { createFitnessGoal } from '../../lib/fitnessGoals';
import type { IconName } from '../../data/icons';
import { formatMMSS, shortDate } from './goalView';

type GoalKind = 'weightLose' | 'weightGain' | 'time' | 'total' | 'freq';

const KINDS: { id: GoalKind; title: string; sub: string; icon: IconName; colorVar: string }[] = [
  { id: 'weightLose', title: 'Lose weight', sub: 'Lean down by a date', icon: 'scale', colorVar: '--stat-recovery' },
  { id: 'weightGain', title: 'Gain weight', sub: 'Build muscle by a date', icon: 'dumbbell', colorVar: '--stat-strength' },
  { id: 'time', title: 'Beat a time', sub: 'Like 5 km under 25:00', icon: 'clock', colorVar: '--stat-endurance' },
  { id: 'total', title: 'Total distance', sub: 'Like 100 km this month', icon: 'ride', colorVar: '--stat-agility' },
  { id: 'freq', title: 'Train more often', sub: 'Like 16 sessions this month', icon: 'flame', colorVar: '--stat-discipline' },
];

// Only sports that report a real distance can back a distance goal.
const DISTANCE_SPORTS = ['run', 'ride', 'swim', 'walk'];
const PRESET_KM: Record<string, number[]> = { run: [1, 5, 10, 21.1], ride: [20, 40, 100], swim: [0.4, 1, 1.5], walk: [5, 10] };
// Rough default target pace (seconds per km) when switching sport.
const DEFAULT_PACE: Record<string, number> = { run: 300, ride: 150, swim: 120, walk: 600 };

function isoInDays(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}
function endOfWeek(): string {
  const d = new Date();
  d.setDate(d.getDate() + (6 - d.getDay()));
  return d.toISOString().slice(0, 10);
}
function endOfMonth(): string {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth() + 1, 0, 12).toISOString().slice(0, 10);
}
const round1 = (n: number) => Math.round(n * 10) / 10;

function Chips<T extends string | number>({ options, value, onChange }: { options: [T, string][]; value: T; onChange: (v: T) => void }) {
  return (
    <div className="opts">
      {options.map(([v, label]) => (
        <button key={String(v)} className={value === v ? 'on' : ''} onClick={() => onChange(v)}>
          {label}
        </button>
      ))}
    </div>
  );
}

function Stepper({ label, value, unit, steps, onChange, accent }: { label: string; value: string; unit?: string; steps: [string, number][]; onChange: (delta: number) => void; accent?: boolean }) {
  return (
    <div className={`numcard${accent ? ' accent' : ''}`}>
      <div className="k">{label}</div>
      <div className="bignum">
        {value}
        {unit && <small>{unit}</small>}
      </div>
      <div className="stepbtns">
        {steps.map(([l, d]) => (
          <button key={l} onClick={() => onChange(d)}>
            {l}
          </button>
        ))}
      </div>
    </div>
  );
}

// Two-step sheet: pick what kind of goal, then set it with steppers and
// preset chips. A live preview sanity-checks the pace before saving.
export function AddGoalSheet({
  userId,
  hasWeightGoal,
  currentWeight,
  trainingDays,
  onClose,
  onCreated,
}: {
  userId: string;
  hasWeightGoal: boolean;
  currentWeight: number | null;
  trainingDays: string;
  onClose: () => void;
  onCreated: () => void;
}) {
  const showToast = useAppStore((s) => s.showToast);
  const [kind, setKind] = useState<GoalKind | null>(null);
  const [busy, setBusy] = useState(false);

  const startWeight = currentWeight ?? 80;
  const [now, setNow] = useState(round1(startWeight));
  const [target, setTarget] = useState(round1(startWeight - 3));
  const [weeks, setWeeks] = useState(12);
  const [sport, setSport] = useState('run');
  const [km, setKm] = useState(5);
  const [secs, setSecs] = useState(1500);
  const [totalKm, setTotalKm] = useState(100);
  const [count, setCount] = useState(12);
  const [period, setPeriod] = useState<'week' | 'month' | '12w'>('month');

  function pick(k: GoalKind) {
    setKind(k);
    if (k === 'weightLose') { setTarget(round1(startWeight - 3)); setWeeks(12); }
    if (k === 'weightGain') { setTarget(round1(startWeight + 3)); setWeeks(16); }
    if (k === 'time') { setSport('run'); setKm(5); setSecs(1500); setWeeks(8); }
    if (k === 'total') { setSport('ride'); setTotalKm(100); setPeriod('month'); }
    if (k === 'freq') { setSport('any'); setCount(12); setPeriod('month'); }
  }

  function changeSport(s: string) {
    setSport(s);
    if (kind === 'time') {
      const presets = PRESET_KM[s];
      const k = presets[Math.min(1, presets.length - 1)];
      setKm(k);
      setSecs(Math.round((k * DEFAULT_PACE[s]) / 15) * 15);
    }
  }

  const periodEnd = period === 'week' ? endOfWeek() : period === 'month' ? endOfMonth() : isoInDays(84);
  const periodWeeks = period === 'week' ? 1 : period === 'month' ? Math.max(1, (new Date(`${endOfMonth()}T12:00`).getTime() - Date.now()) / 604800000) : 12;

  async function create() {
    if (!kind) return;
    setBusy(true);
    let ok = false;
    if (kind === 'weightLose' || kind === 'weightGain') {
      ok = !!(await createWeightGoal(userId, now, target, isoInDays(weeks * 7)));
    } else if (kind === 'time') {
      ok = !!(await createFitnessGoal(userId, { goalType: 'distance_time', sport, targetDistanceM: km * 1000, targetSeconds: secs, periodEnd: isoInDays(weeks * 7) }));
    } else if (kind === 'total') {
      ok = !!(await createFitnessGoal(userId, { goalType: 'distance_total', sport, targetDistanceM: totalKm * 1000, periodEnd }));
    } else {
      ok = !!(await createFitnessGoal(userId, { goalType: 'frequency', sport, targetCount: count, periodEnd }));
    }
    setBusy(false);
    if (!ok) {
      showToast('Could not save that goal - try again');
      return;
    }
    showToast(kind.startsWith('weight') ? 'Goal set - log a weigh-in to start tracking' : 'Goal set');
    onCreated();
  }

  const meta = KINDS.find((k) => k.id === kind);
  const sportLabel = workoutTypeById(sport)?.label ?? 'Workout';

  let body = null;
  let preview = null;
  let reward = null;
  if (kind === 'weightLose' || kind === 'weightGain') {
    const lose = kind === 'weightLose';
    const diff = Math.abs(target - now);
    const perWeek = diff / weeks;
    const fast = lose ? perWeek > 1 : perWeek > 0.5;
    const wrongWay = lose ? target >= now : target <= now;
    body = (
      <>
        <div className="numcards">
          <Stepper label="Now" value={now.toFixed(1)} unit="kg" steps={[['−', -0.5], ['+', 0.5]]} onChange={(d) => setNow(round1(now + d))} />
          <Stepper label="Target" value={target.toFixed(1)} unit="kg" steps={[['−', -0.5], ['+', 0.5]]} onChange={(d) => setTarget(round1(target + d))} accent />
        </div>
        <div className="sheet-sub">Timeframe</div>
        <Chips options={[[4, '4 weeks'], [8, '8 weeks'], [12, '12 weeks'], [16, '16 weeks']]} value={weeks} onChange={setWeeks} />
      </>
    );
    preview = (
      <div className={`preview${fast || wrongWay ? ' warn' : ''}`}>
        <Icon name={fast || wrongWay ? 'info' : 'zap'} />
        <span>
          {wrongWay ? (
            `Set a target ${lose ? 'below' : 'above'} your current weight.`
          ) : (
            <>
              <b>
                {lose ? '−' : '+'}
                {diff.toFixed(1)} kg by {shortDate(isoInDays(weeks * 7))}
              </b>{' '}
              · about {perWeek.toFixed(2)} kg a week.{' '}
              {fast ? (lose ? 'That’s fast. Under 1 kg a week is easier to keep off.' : 'Above 0.5 kg a week is mostly not muscle.') : 'A steady, realistic pace.'}
            </>
          )}
        </span>
      </div>
    );
    reward = (
      <div className="reward">
        <span>
          <Icon name="camera" /> Weigh in with a photo of your scale
        </span>
        <b>+20 XP each · +80 at goal</b>
      </div>
    );
  } else if (kind === 'time') {
    body = (
      <>
        <div className="sheet-sub" style={{ marginTop: 0 }}>Sport</div>
        <Chips options={DISTANCE_SPORTS.map((s) => [s, workoutTypeById(s)!.label] as [string, string])} value={sport} onChange={changeSport} />
        <div className="sheet-sub">Distance</div>
        <Chips options={PRESET_KM[sport].map((k) => [k, k === 21.1 ? 'Half' : `${k} km`] as [number, string])} value={km} onChange={setKm} />
        <div className="sheet-sub">Target time</div>
        <div className="timebig">
          <div className="bignum">{formatMMSS(secs)}</div>
          <div className="stepbtns">
            {([['−1m', -60], ['−15s', -15], ['+15s', 15], ['+1m', 60]] as [string, number][]).map(([l, d]) => (
              <button key={l} onClick={() => setSecs(Math.max(30, secs + d))}>
                {l}
              </button>
            ))}
          </div>
        </div>
        <div className="sheet-sub">Deadline</div>
        <Chips options={[[4, '4 weeks'], [8, '8 weeks'], [12, '12 weeks']]} value={weeks} onChange={setWeeks} />
      </>
    );
    preview = (
      <div className="preview">
        <Icon name="clock" />
        <span>
          That’s <b>{formatMMSS(secs / km)} per km</b>. Your next {km} km {sportLabel.toLowerCase()} on Apple Watch is checked automatically.
        </span>
      </div>
    );
    reward = (
      <div className="reward">
        <span>
          <Icon name="shield" /> Verified from Apple Health
        </span>
        <b>+20 XP when beaten</b>
      </div>
    );
  } else if (kind === 'total') {
    body = (
      <>
        <div className="sheet-sub" style={{ marginTop: 0 }}>Sport</div>
        <Chips options={DISTANCE_SPORTS.map((s) => [s, workoutTypeById(s)!.label] as [string, string])} value={sport} onChange={changeSport} />
        <div className="numcards single" style={{ marginTop: 14 }}>
          <Stepper label="Distance" value={String(totalKm)} unit="km" steps={[['−25', -25], ['−5', -5], ['+5', 5], ['+25', 25]]} onChange={(d) => setTotalKm(Math.max(5, totalKm + d))} accent />
        </div>
        <div className="sheet-sub">By</div>
        <Chips options={[['week', 'End of this week'], ['month', 'End of this month'], ['12w', '12 weeks']]} value={period} onChange={setPeriod} />
      </>
    );
    preview = (
      <div className="preview">
        <Icon name={workoutTypeById(sport)?.icon ?? 'run'} />
        <span>
          About <b>{Math.round(totalKm / periodWeeks)} km a week</b>. Every matching Apple Health activity adds up automatically.
        </span>
      </div>
    );
    reward = (
      <div className="reward">
        <span>
          <Icon name="shield" /> Verified from Apple Health
        </span>
        <b>+20 XP per activity</b>
      </div>
    );
  } else if (kind === 'freq') {
    body = (
      <>
        <div className="numcards single">
          <Stepper label="Sessions" value={String(count)} unit="times" steps={[['−', -1], ['+', 1]]} onChange={(d) => setCount(Math.max(1, count + d))} accent />
        </div>
        <div className="sheet-sub">Counts as</div>
        <Chips options={[['any', 'Any workout'], ['gym', 'Gym'], ['run', 'Run'], ['ride', 'Ride'], ['swim', 'Swim']]} value={sport} onChange={setSport} />
        <div className="sheet-sub">By</div>
        <Chips options={[['week', 'End of this week'], ['month', 'End of this month']]} value={period} onChange={setPeriod} />
      </>
    );
    preview = (
      <div className="preview">
        <Icon name="calendar" />
        <span>
          About <b>{(count / periodWeeks).toFixed(1)} sessions a week</b>. Your schedule has {trainingDays || '—'}.
        </span>
      </div>
    );
    reward = (
      <div className="reward">
        <span>
          <Icon name="shield" /> Logged or synced workouts count
        </span>
        <b>+20 XP per session</b>
      </div>
    );
  }

  const weightBlocked = (kind === 'weightLose' || kind === 'weightGain') && (kind === 'weightLose' ? target >= now : target <= now);

  return (
    <Modal open onClose={onClose} title={meta ? meta.title : 'What are you working towards?'}>
      {!kind ? (
        <div className="gtiles">
          {KINDS.map((k, i) => {
            const blocked = hasWeightGoal && k.id.startsWith('weight');
            return (
              <button
                key={k.id}
                className={`gtile${i === KINDS.length - 1 ? ' wide' : ''}`}
                disabled={blocked}
                onClick={() => pick(k.id)}
              >
                <span className="type-icon-badge" style={{ width: 36, height: 36, background: `var(${k.colorVar})` }}>
                  <Icon name={k.icon} style={{ width: 17, height: 17 }} />
                </span>
                <div>
                  <div className="t">{k.title}</div>
                  <div className="s">{blocked ? 'You already have a weight goal' : k.sub}</div>
                </div>
              </button>
            );
          })}
        </div>
      ) : (
        <>
          <button className="link-btn" style={{ margin: '0 0 12px' }} onClick={() => setKind(null)}>
            <Icon name="chevron" style={{ width: 12, height: 12, transform: 'rotate(180deg)' }} /> Goal type
          </button>
          {body}
          {preview}
          {reward}
          <button className="btn btn-primary" style={{ marginTop: 16 }} disabled={busy || weightBlocked} onClick={create}>
            <Icon name="check" style={{ width: 16, height: 16 }} /> {busy ? 'Saving…' : 'Set goal'}
          </button>
        </>
      )}
    </Modal>
  );
}
