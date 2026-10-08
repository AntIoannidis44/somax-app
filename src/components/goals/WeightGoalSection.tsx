import { useEffect, useRef, useState } from 'react';
import { Icon } from '../Icon';
import { useAppStore } from '../../store/useAppStore';
import { useUserId } from '../../lib/useSession';
import {
  abandonGoal,
  createWeightGoal,
  fetchActiveGoal,
  fetchWeightLogs,
  logWeight,
  scanScalePhoto,
  type WeightGoal,
  type WeightLog,
} from '../../lib/weightGoals';

type ScanState =
  | { status: 'idle' }
  | { status: 'scanning' }
  | { status: 'review'; blob: Blob; previewUrl: string; weightInput: string }
  | { status: 'saving' };

function defaultTargetDate(): string {
  const d = new Date();
  d.setMonth(d.getMonth() + 3);
  return d.toISOString().slice(0, 10);
}

export function WeightGoalSection() {
  const userId = useUserId();
  const showToast = useAppStore((s) => s.showToast);
  const awardWeightGoalXP = useAppStore((s) => s.awardWeightGoalXP);

  const [loading, setLoading] = useState(true);
  const [goal, setGoal] = useState<WeightGoal | null>(null);
  const [logs, setLogs] = useState<WeightLog[]>([]);
  const [scan, setScan] = useState<ScanState>({ status: 'idle' });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [startWeight, setStartWeight] = useState('');
  const [targetWeight, setTargetWeight] = useState('');
  const [targetDate, setTargetDate] = useState(defaultTargetDate());
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (!userId) return;
    (async () => {
      setLoading(true);
      const g = await fetchActiveGoal(userId);
      setGoal(g);
      if (g) setLogs(await fetchWeightLogs(userId, g.id));
      setLoading(false);
    })();
  }, [userId]);

  // The review step's object URL is a browser handle, not app state - it
  // must be revoked whenever we leave the review step however that happens
  // (confirm, retake, or unmount), or it leaks for the page's lifetime.
  useEffect(() => {
    return () => {
      if (scan.status === 'review') URL.revokeObjectURL(scan.previewUrl);
    };
  }, [scan]);

  async function handleCreateGoal() {
    if (!userId) return;
    const start = parseFloat(startWeight);
    const target = parseFloat(targetWeight);
    if (!Number.isFinite(start) || !Number.isFinite(target) || !targetDate) {
      showToast('Enter a starting weight, target weight, and date');
      return;
    }
    setCreating(true);
    const g = await createWeightGoal(userId, start, target, targetDate);
    setCreating(false);
    if (!g) {
      showToast('Could not create goal - try again');
      return;
    }
    setGoal(g);
    setLogs([]);
    showToast('Goal set - log a weigh-in to start tracking');
  }

  async function handleAbandon() {
    if (!goal) return;
    await abandonGoal(goal.id);
    setGoal(null);
    setLogs([]);
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setScan({ status: 'scanning' });
    try {
      const result = await scanScalePhoto(file);
      const previewUrl = URL.createObjectURL(result.blob);
      setScan({
        status: 'review',
        blob: result.blob,
        previewUrl,
        weightInput: result.weightKg != null ? result.weightKg.toFixed(1) : '',
      });
    } catch (err) {
      console.error('[WeightGoalSection] scanScalePhoto threw:', err);
      showToast('Could not read that photo - try again');
      setScan({ status: 'idle' });
    }
  }

  function handleRetake() {
    if (scan.status === 'review') URL.revokeObjectURL(scan.previewUrl);
    setScan({ status: 'idle' });
    fileInputRef.current?.click();
  }

  async function handleConfirm() {
    if (scan.status !== 'review' || !userId || !goal) return;
    const weightKg = parseFloat(scan.weightInput);
    if (!Number.isFinite(weightKg)) {
      showToast('Enter the weight shown on the scale');
      return;
    }
    const { blob, previewUrl } = scan;
    setScan({ status: 'saving' });
    const { log, goalCompleted } = await logWeight(userId, goal, weightKg, blob);
    URL.revokeObjectURL(previewUrl);
    if (!log) {
      showToast('Could not save that weigh-in - try again');
      setScan({ status: 'idle' });
      return;
    }
    setLogs((prev) => [log, ...prev]);
    awardWeightGoalXP('Weigh-in logged', { completed: goalCompleted });
    if (goalCompleted) {
      showToast(`Goal reached! +80 bonus XP`);
      setGoal(null);
      setLogs([]);
    } else {
      showToast('Weigh-in logged - +20 XP');
    }
    setScan({ status: 'idle' });
  }

  if (!userId || loading) return <div className="banner">Loading…</div>;

  if (!goal) {
    return (
      <div className="card">
        <div className="ch-title" style={{ marginBottom: 4 }}>Set a weight goal</div>
        <div className="ch-desc" style={{ marginBottom: 16 }}>
          Weigh in with a photo of the scale to earn XP toward your target - the number is read straight off the photo.
        </div>
        <div className="field">
          <label>Starting weight (kg)</label>
          <input type="number" inputMode="decimal" value={startWeight} onChange={(e) => setStartWeight(e.target.value)} placeholder="76" />
        </div>
        <div className="field">
          <label>Target weight (kg)</label>
          <input type="number" inputMode="decimal" value={targetWeight} onChange={(e) => setTargetWeight(e.target.value)} placeholder="80" />
        </div>
        <div className="field">
          <label>Target date</label>
          <input type="date" value={targetDate} onChange={(e) => setTargetDate(e.target.value)} />
        </div>
        <button className="btn btn-primary" disabled={creating} onClick={handleCreateGoal}>
          {creating ? 'Setting goal…' : 'Set goal'}
        </button>
      </div>
    );
  }

  const latest = logs[0]?.weight_kg ?? goal.start_weight_kg;
  const span = Math.abs(goal.target_weight_kg - goal.start_weight_kg) || 1;
  const moved = goal.direction === 'gain' ? latest - goal.start_weight_kg : goal.start_weight_kg - latest;
  const pct = Math.max(0, Math.min(100, Math.round((moved / span) * 100)));

  return (
    <>
      <div className="challenge-card card">
        <div className="ch-head">
          <div>
            <div className="ch-title">
              {goal.direction === 'gain' ? 'Build up to' : 'Lean down to'} {goal.target_weight_kg} kg
            </div>
            <div className="ch-desc">
              Started {goal.start_weight_kg} kg · by {new Date(goal.target_date).toLocaleDateString()}
            </div>
          </div>
          <div className="ch-badge live">Active</div>
        </div>
        <div className="progress-track" style={{ marginBottom: 8 }}>
          <div className="progress-fill" style={{ width: `${pct}%` }} />
        </div>
        <div className="ch-foot">
          <span className="ch-days">Latest: {latest.toFixed(1)} kg</span>
          <button className="btn btn-sm btn-ghost" onClick={handleAbandon}>
            Abandon goal
          </button>
        </div>
      </div>

      {scan.status === 'review' ? (
        <div className="card">
          <div className="ch-title" style={{ marginBottom: 10 }}>Confirm your weigh-in</div>
          <img src={scan.previewUrl} alt="Scale photo" style={{ width: '100%', borderRadius: 12, marginBottom: 12 }} />
          <div className="field">
            <label>Weight read from photo (kg)</label>
            <input
              type="number"
              inputMode="decimal"
              value={scan.weightInput}
              onChange={(e) => setScan({ ...scan, weightInput: e.target.value })}
              placeholder="Enter manually if this is empty or wrong"
            />
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleConfirm}>
              <Icon name="check" style={{ width: 16, height: 16 }} /> Confirm
            </button>
            <button className="btn btn-ghost" style={{ flex: 1 }} onClick={handleRetake}>
              <Icon name="camera" style={{ width: 16, height: 16 }} /> Retake
            </button>
          </div>
        </div>
      ) : (
        <button
          className="btn btn-primary"
          style={{ width: '100%', marginBottom: 16 }}
          disabled={scan.status === 'scanning' || scan.status === 'saving'}
          onClick={() => fileInputRef.current?.click()}
        >
          <Icon name="camera" style={{ width: 16, height: 16 }} />{' '}
          {scan.status === 'scanning' ? 'Reading scale…' : scan.status === 'saving' ? 'Saving…' : 'Log a weigh-in'}
        </button>
      )}
      <input ref={fileInputRef} type="file" accept="image/*" capture="environment" style={{ display: 'none' }} onChange={handleFileChange} />

      {logs.length > 0 && (
        <div className="card">
          <div className="ch-title" style={{ marginBottom: 10 }}>History</div>
          {logs.map((l) => (
            <div key={l.id} className="ch-foot" style={{ padding: '8px 0' }}>
              <span className="ch-days">{new Date(l.logged_at).toLocaleDateString()}</span>
              <span className="ch-days">{l.weight_kg.toFixed(1)} kg</span>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
