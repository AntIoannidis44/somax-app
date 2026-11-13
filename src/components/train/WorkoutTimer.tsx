import { useEffect, useMemo, useRef, useState } from 'react';
import { Modal } from '../layout/Modal';
import { Icon } from '../Icon';
import { buildSteps, fmtClock, type TimerConfig, type TimerMode } from '../../lib/timerSpec';

// Workout timer sheet used while tracking: a plain countdown (planks,
// holds, "30s/side"), a stopwatch (max holds), and an interval timer
// (Tabata 20/10 x 8, 10-20-30, any work/rest/rounds).
//
// Time is measured from Date.now() anchors, not by counting ticks, so it
// stays right if the phone locks or the tab is throttled - on return it
// jumps to where the clock really is.

// ---- sound -------------------------------------------------------------
// iOS only lets Web Audio make sound after a user tap, so the context is
// created (and resumed) from the Start button.
let audioCtx: AudioContext | null = null;
function unlockAudio() {
  try {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!audioCtx && AC) audioCtx = new AC();
    void audioCtx?.resume();
  } catch {
    /* no audio - the timer still works silently */
  }
}
function beep(freq: number, ms: number) {
  if (!audioCtx) return;
  try {
    const o = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    o.frequency.value = freq;
    o.type = 'sine';
    const t = audioCtx.currentTime;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.35, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + ms / 1000);
    o.connect(g).connect(audioCtx.destination);
    o.start(t);
    o.stop(t + ms / 1000 + 0.02);
  } catch {
    /* ignore */
  }
  try {
    navigator.vibrate?.(ms > 300 ? 300 : 60);
  } catch {
    /* ignore */
  }
}

// Keep the screen on while the timer runs (where the browser supports it).
function useWakeLock(on: boolean) {
  useEffect(() => {
    if (!on) return;
    let lock: { release: () => Promise<void> } | null = null;
    const nav = navigator as Navigator & { wakeLock?: { request: (t: 'screen') => Promise<{ release: () => Promise<void> }> } };
    nav.wakeLock?.request('screen').then((l) => (lock = l)).catch(() => {});
    return () => {
      void lock?.release().catch(() => {});
    };
  }, [on]);
}

// ---- clock -------------------------------------------------------------
function useClock() {
  // anchor = Date.now() when the current run segment started (null = paused);
  // banked = ms elapsed before it; now = last tick's Date.now().
  const [t, setT] = useState<{ anchor: number | null; banked: number; now: number }>({ anchor: null, banked: 0, now: 0 });
  const running = t.anchor !== null;

  useEffect(() => {
    if (!running) return;
    const tick = () => setT((s) => ({ ...s, now: Date.now() }));
    const id = window.setInterval(tick, 100);
    document.addEventListener('visibilitychange', tick);
    return () => {
      window.clearInterval(id);
      document.removeEventListener('visibilitychange', tick);
    };
  }, [running]);

  const elapsedMs = t.banked + (t.anchor !== null ? Math.max(0, t.now - t.anchor) : 0);
  return {
    running,
    elapsed: elapsedMs / 1000,
    start() {
      const n = Date.now();
      setT((s) => ({ ...s, anchor: n, now: n }));
    },
    pause() {
      const n = Date.now();
      setT((s) => (s.anchor === null ? s : { anchor: null, banked: s.banked + (n - s.anchor), now: n }));
    },
    reset() {
      setT({ anchor: null, banked: 0, now: 0 });
    },
  };
}

function Stepper({ label, value, display, onChange, step, min, max }: { label: string; value: number; display: string; onChange: (v: number) => void; step: number; min: number; max: number }) {
  return (
    <div className="wt-stepper">
      <span className="wt-stepper-label">{label}</span>
      <div className="wt-stepper-row">
        <button type="button" className="wt-step-btn" onClick={() => onChange(Math.max(min, value - step))} aria-label={`Less ${label}`}>
          −
        </button>
        <span className="wt-stepper-value">{display}</span>
        <button type="button" className="wt-step-btn" onClick={() => onChange(Math.min(max, value + step))} aria-label={`More ${label}`}>
          +
        </button>
      </div>
    </div>
  );
}

export interface WorkoutTimerProps {
  open: boolean;
  onClose: () => void;
  title: string;
  initial: TimerConfig;
  // Shown after a run finishes, e.g. "Tick set 2" / "Tick all 8 sets".
  completeLabel?: string;
  onComplete?: () => void;
}

export function WorkoutTimer({ open, onClose, title, initial, completeLabel, onComplete }: WorkoutTimerProps) {
  const [cfg, setCfg] = useState<TimerConfig>(() => initial);
  const clock = useClock();
  const [ticked, setTicked] = useState(false);
  const lastCue = useRef<string>('');

  // Mounted fresh for each exercise (keyed by the caller), so `initial` only seeds state.

  const steps = useMemo(() => buildSteps(cfg), [cfg]);
  const total = steps.reduce((n, s) => n + s.sec, 0);
  const isStopwatch = cfg.mode === 'stopwatch';
  const elapsed = clock.elapsed;
  const done = !isStopwatch && elapsed >= total;
  const started = elapsed > 0 || clock.running;

  // Which step we're in, and time left in it.
  let idx = 0;
  let acc = 0;
  while (idx < steps.length - 1 && elapsed >= acc + steps[idx].sec) {
    acc += steps[idx].sec;
    idx++;
  }
  const step = steps[idx];
  const left = done ? 0 : acc + step.sec - elapsed;

  useWakeLock(open && clock.running);

  // Cues: short beeps on the last 3 seconds of each step, a long beep when a
  // new step starts, a double-long at the end.
  useEffect(() => {
    if (!clock.running || isStopwatch) return;
    if (done) {
      clock.pause();
      if (lastCue.current !== 'end') {
        lastCue.current = 'end';
        beep(880, 700);
        window.setTimeout(() => beep(880, 700), 800);
      }
      return;
    }
    const sec = Math.ceil(left);
    const cue = `${idx}:${sec}`;
    if (cue === lastCue.current) return;
    const prev = lastCue.current;
    lastCue.current = cue;
    if (!prev.startsWith(`${idx}:`) && idx > 0) beep(step.rest ? 520 : 880, 450);
    else if (sec <= 3 && sec >= 1) beep(660, 120);
  });

  function set<K extends keyof TimerConfig>(k: K, v: TimerConfig[K]) {
    clock.reset();
    lastCue.current = '';
    setCfg((c) => ({ ...c, [k]: v }));
  }
  function setMode(mode: TimerMode) {
    clock.reset();
    lastCue.current = '';
    setCfg((c) => ({ ...c, mode, cycle: mode === 'intervals' ? c.cycle : undefined }));
  }

  // Before starting, show the main time (not the 3s get-ready).
  const big = isStopwatch ? fmtClock(Math.floor(elapsed)) : fmtClock(started ? left : steps[1]?.sec ?? left);
  const progress = isStopwatch ? 0 : Math.min(1, elapsed / total);
  const phase = isStopwatch ? (clock.running ? 'Holding' : started ? 'Paused' : 'Ready') : done ? 'Done' : started ? step.label : 'Ready';
  const resting = !isStopwatch && !done && started && !!step.rest;

  return (
    <Modal open={open} onClose={onClose} title={title}>
      <div className="wt">
        <div className="wt-tabs" role="tablist">
          {(['timer', 'intervals', 'stopwatch'] as TimerMode[]).map((m) => (
            <button key={m} type="button" role="tab" aria-selected={cfg.mode === m} className={`wt-tab${cfg.mode === m ? ' on' : ''}`} onClick={() => setMode(m)}>
              {m === 'timer' ? 'Timer' : m === 'intervals' ? 'Intervals' : 'Stopwatch'}
            </button>
          ))}
        </div>

        <div className={`wt-face${resting ? ' rest' : ''}${done ? ' done' : ''}${clock.running && !resting ? ' work' : ''}`}>
          <div className="wt-phase">{phase}</div>
          <div className="wt-clock">{big}</div>
          {!isStopwatch && (
            <div className="wt-bar">
              <div className="wt-bar-fill" style={{ width: `${progress * 100}%` }} />
            </div>
          )}
          {!isStopwatch && started && !done && idx + 1 < steps.length && (
            <div className="wt-next">
              Next: {steps[idx + 1].label} · {fmtClock(steps[idx + 1].sec)}
            </div>
          )}
          {!isStopwatch && !started && <div className="wt-next">Total {fmtClock(total)} incl. {steps[0].sec}s get ready</div>}
        </div>

        {!started && cfg.mode === 'timer' && (
          <div className="wt-settings">
            <Stepper label="Time" value={cfg.sec} display={fmtClock(cfg.sec)} step={cfg.sec >= 120 ? 30 : 5} min={5} max={3600} onChange={(v) => set('sec', v)} />
            <label className="wt-check">
              <input type="checkbox" checked={cfg.sides} onChange={(e) => set('sides', e.target.checked)} /> Each side (with a switch)
            </label>
          </div>
        )}
        {!started && cfg.mode === 'intervals' && !cfg.cycle && (
          <div className="wt-settings">
            <Stepper label="Work" value={cfg.work} display={`${cfg.work}s`} step={5} min={5} max={600} onChange={(v) => set('work', v)} />
            <Stepper label="Rest" value={cfg.rest} display={`${cfg.rest}s`} step={5} min={0} max={600} onChange={(v) => set('rest', v)} />
            <Stepper label="Rounds" value={cfg.rounds} display={`${cfg.rounds}`} step={1} min={1} max={50} onChange={(v) => set('rounds', v)} />
            <button type="button" className="link-btn" onClick={() => setCfg((c) => ({ ...c, work: 20, rest: 10, rounds: 8 }))}>
              Tabata 20/10 × 8
            </button>
          </div>
        )}
        {!started && cfg.mode === 'intervals' && cfg.cycle && (
          <div className="wt-settings">
            <div className="wt-cycle">{cfg.cycle.map((s) => `${s.sec}s ${s.label.toLowerCase()}`).join(' → ')}</div>
            <Stepper label="Rounds" value={cfg.rounds} display={`${cfg.rounds}`} step={1} min={1} max={50} onChange={(v) => set('rounds', v)} />
            <button type="button" className="link-btn" onClick={() => setCfg((c) => ({ ...c, cycle: undefined, work: 20, rest: 10, rounds: 8 }))}>
              Use simple work/rest instead
            </button>
          </div>
        )}

        <div className="wt-controls">
          {!done && (
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => {
                unlockAudio();
                if (clock.running) clock.pause();
                else clock.start();
              }}
            >
              {clock.running ? 'Pause' : started ? 'Resume' : 'Start'}
            </button>
          )}
          {started && (
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => {
                clock.reset();
                lastCue.current = '';
                setTicked(false);
              }}
            >
              <Icon name="rotate" style={{ width: 15, height: 15 }} /> {done ? 'Again' : 'Reset'}
            </button>
          )}
          {completeLabel && onComplete && (done || (isStopwatch && started && !clock.running)) && (
            <button
              type="button"
              className="btn btn-primary"
              disabled={ticked}
              onClick={() => {
                onComplete();
                setTicked(true);
              }}
            >
              <Icon name="check" style={{ width: 15, height: 15 }} /> {ticked ? 'Ticked' : completeLabel}
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
}
