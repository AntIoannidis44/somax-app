import { useEffect, useRef, useState } from 'react';
import { Icon } from '../Icon';
import { Modal } from '../layout/Modal';
import { ChipGroup } from '../onboarding/ChipGroup';
import { GOALS } from '../onboarding/steps/Goal';
import { DAYS } from '../onboarding/steps/Experience';
import { FOCUS_OPTIONS } from '../onboarding/steps/Focus';
import { useAppStore } from '../../store/useAppStore';
import { useGoals } from '../../lib/useGoals';
import { abandonGoal, logWeight, scanScalePhoto } from '../../lib/weightGoals';
import { abandonFitnessGoal } from '../../lib/fitnessGoals';
import { AddGoalSheet } from './AddGoalSheet';
import { daysLeft, fitnessGoalView, formatMMSS, shortDate, weightGoalView, type GoalView } from './goalView';

type Review = { blob: Blob; previewUrl: string; weight: number | null; input: string };

function GoalCard({ view, onMenu, children }: { view: GoalView; onMenu: () => void; children?: React.ReactNode }) {
  const left = daysLeft(view.due);
  return (
    <div className="gcard">
      <div className="gc-top">
        <span className="type-icon-badge" style={{ width: 40, height: 40, background: `var(${view.colorVar})` }}>
          <Icon name={view.icon} style={{ width: 19, height: 19 }} />
        </span>
        <div className="main">
          <div className="t">{view.title}</div>
          <div className="s">
            Due {shortDate(view.due)} · {left} days left
          </div>
        </div>
        <button className="icon-btn" style={{ background: 'none' }} onClick={onMenu} aria-label="Goal options">
          <Icon name="more" style={{ width: 20, height: 20 }} />
        </button>
      </div>
      {view.target != null && (
        <div className="versus">
          <div>
            Your best<b>{view.best != null ? formatMMSS(view.best) : '—'}</b>
          </div>
          <Icon name="chevron" style={{ width: 16, height: 16 }} />
          <div>
            Target<b>{formatMMSS(view.target)}</b>
          </div>
        </div>
      )}
      <div className="gc-prog">
        {view.pct != null && (
          <div className="pbar big">
            <i style={{ width: `${view.pct}%` }} />
          </div>
        )}
        <div className="gc-row">
          <span>{view.meta}</span>
          {view.pct != null && <b>{view.pct}%</b>}
        </div>
      </div>
      <div className="gc-foot">
        <span className="verified">
          <Icon name="shield" /> {view.verify}
        </span>
        <span className="gc-xp">
          <Icon name="zap" /> {view.xp}
        </span>
      </div>
      {children}
    </div>
  );
}

// One place for everything you're working towards: weight and performance
// goals on top, the weekly training schedule (which shapes the generated
// program) underneath. Reached from Profile, Home's goals bar and Edit profile.
export function GoalsScreen() {
  const profile = useAppStore((s) => s.profile)!;
  const showToast = useAppStore((s) => s.showToast);
  const awardWeightGoalXP = useAppStore((s) => s.awardWeightGoalXP);
  const toggleProfileGoal = useAppStore((s) => s.toggleProfileGoal);
  const setProfileAvailability = useAppStore((s) => s.setProfileAvailability);
  const setProfileFocus = useAppStore((s) => s.setProfileFocus);
  const reviseWeekPlan = useAppStore((s) => s.reviseWeekPlan);
  const { userId, weightGoal, weightLogs, latestWeight, fitnessGoals, count, loaded, reload, setWeightLogs } = useGoals();

  const [adding, setAdding] = useState(false);
  const [menu, setMenu] = useState<{ kind: 'weight' | 'fitness'; id: string; title: string } | null>(null);
  const [review, setReview] = useState<Review | null>(null);
  const [scanning, setScanning] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // Snapshot of the training prefs when the screen opened, so "Revise this
  // week's program" only shows once something actually changed.
  const [snapshot, setSnapshot] = useState(() => ({ goal: [...profile.goal], availability: profile.availability, focus: profile.focus }));
  const prefsChanged =
    profile.availability !== snapshot.availability ||
    profile.focus !== snapshot.focus ||
    profile.goal.length !== snapshot.goal.length ||
    profile.goal.some((g) => !snapshot.goal.includes(g));

  // The review photo's object URL is a browser handle - revoke it whenever
  // the review closes, however that happens.
  useEffect(() => {
    return () => {
      if (review) URL.revokeObjectURL(review.previewUrl);
    };
  }, [review]);

  const views: { view: GoalView; kind: 'weight' | 'fitness'; id: string }[] = [
    ...(weightGoal && latestWeight != null ? [{ view: weightGoalView(weightGoal, latestWeight), kind: 'weight' as const, id: weightGoal.id }] : []),
    ...fitnessGoals.map((g) => ({ view: fitnessGoalView(g), kind: 'fitness' as const, id: g.id })),
  ];
  const nextDue = views.length ? Math.min(...views.map((v) => daysLeft(v.view.due))) : null;
  const withPct = views.filter((v) => v.view.pct != null);
  const avg = withPct.length ? Math.round(withPct.reduce((a, v) => a + (v.view.pct ?? 0), 0) / withPct.length) : null;

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setScanning(true);
    try {
      const result = await scanScalePhoto(file);
      setReview({
        blob: result.blob,
        previewUrl: URL.createObjectURL(result.blob),
        weight: result.weightKg,
        input: result.weightKg != null ? result.weightKg.toFixed(1) : '',
      });
    } catch (err) {
      console.error('[GoalsScreen] scanScalePhoto threw:', err);
      showToast('Could not read that photo - try again');
    } finally {
      setScanning(false);
    }
  }

  async function confirmWeighIn() {
    if (!review || !userId || !weightGoal) return;
    const kg = parseFloat(review.input);
    if (!Number.isFinite(kg)) {
      showToast('Enter the weight shown on the scale');
      return;
    }
    setSaving(true);
    const { log, goalCompleted } = await logWeight(userId, weightGoal, kg, review.blob);
    setSaving(false);
    if (!log) {
      showToast('Could not save that weigh-in - try again');
      return;
    }
    setReview(null);
    awardWeightGoalXP('Weigh-in logged', { completed: goalCompleted });
    if (goalCompleted) {
      showToast('Goal reached! +80 bonus XP');
      reload();
    } else {
      setWeightLogs([log, ...weightLogs]);
      showToast('Weigh-in logged - +20 XP');
    }
  }

  async function abandon() {
    if (!menu) return;
    if (menu.kind === 'weight') await abandonGoal(menu.id);
    else await abandonFitnessGoal(menu.id);
    setMenu(null);
    showToast('Goal abandoned');
    reload();
  }

  const reviewKg = review ? parseFloat(review.input) : NaN;

  return (
    <>
      <div className="gsum">
        <div>
          <b>{loaded ? count : '–'}</b>Active goals
        </div>
        <div>
          <b>{nextDue != null ? `${nextDue}d` : '—'}</b>Next deadline
        </div>
        <div>
          <b>{avg != null ? `${avg}%` : '—'}</b>Avg progress
        </div>
      </div>

      <div className="section-label">
        Your goals
        <span className="sl-note">Earn XP as you progress</span>
      </div>
      {!loaded && <div className="banner">Loading…</div>}
      {views.map(({ view, kind, id }) => (
        <GoalCard key={view.key} view={view} onMenu={() => setMenu({ kind, id, title: view.title })}>
          {kind === 'weight' && (
            <>
              <button className="btn btn-soft" disabled={scanning} onClick={() => fileRef.current?.click()}>
                <Icon name="camera" style={{ width: 16, height: 16 }} /> {scanning ? 'Reading scale…' : 'Log a weigh-in'}
              </button>
              {weightLogs.length > 0 && (
                <div className="wlog">
                  {weightLogs.slice(0, 4).map((l) => (
                    <div key={l.id}>
                      <span>{new Date(l.logged_at).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}</span>
                      <b>{l.weight_kg.toFixed(1)} kg</b>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </GoalCard>
      ))}
      <button className="addgoal" onClick={() => setAdding(true)} disabled={!userId}>
        <Icon name="plus" style={{ width: 18, height: 18 }} /> Add a goal
      </button>
      <input ref={fileRef} type="file" accept="image/*" capture="environment" style={{ display: 'none' }} onChange={handleFile} />

      <div className="section-label">
        Training schedule
        <span className="sl-note">Shapes your weekly program</span>
      </div>
      <div className="card">
        <div className="setting-title" style={{ fontWeight: 700, marginBottom: 10 }}>Training focus</div>
        <ChipGroup options={GOALS} value={profile.goal} onSelect={toggleProfileGoal} />
        <div className="setting-title" style={{ fontWeight: 700, margin: '18px 0 10px' }}>Training type</div>
        <ChipGroup
          options={FOCUS_OPTIONS.map((f) => f.name)}
          value={FOCUS_OPTIONS.find((f) => f.id === profile.focus)?.name || ''}
          onSelect={(name) => setProfileFocus(FOCUS_OPTIONS.find((f) => f.name === name)!.id)}
        />
        <div className="setting-title" style={{ fontWeight: 700, margin: '18px 0 10px' }}>Days per week</div>
        <ChipGroup options={DAYS} value={profile.availability} onSelect={setProfileAvailability} />
      </div>
      <div className="banner" style={{ marginTop: 12 }}>
        <Icon name="info" />
        <span>Changing these rebuilds this week's plan. If you train from your own custom program, it stays as it is.</span>
      </div>
      {prefsChanged && (
        <button
          className="btn btn-primary"
          onClick={() => {
            reviseWeekPlan();
            setSnapshot({ goal: [...profile.goal], availability: profile.availability, focus: profile.focus });
          }}
        >
          <Icon name="rotate" style={{ width: 16, height: 16 }} /> Revise this week's program
        </button>
      )}

      {adding && userId && (
        <AddGoalSheet
          userId={userId}
          hasWeightGoal={!!weightGoal}
          currentWeight={latestWeight ?? (parseFloat(profile.weight) || null)}
          trainingDays={profile.availability}
          onClose={() => setAdding(false)}
          onCreated={() => {
            setAdding(false);
            reload();
          }}
        />
      )}

      {menu && (
        <Modal open onClose={() => setMenu(null)} title={menu.title}>
          <div className="preview" style={{ marginTop: 0 }}>
            <Icon name="info" />
            <span>Abandoning keeps the XP you’ve already earned from this goal.</span>
          </div>
          <div style={{ display: 'grid', gap: 8, marginTop: 16 }}>
            <button className="btn btn-ghost" style={{ color: 'var(--danger)' }} onClick={abandon}>
              Abandon goal
            </button>
            <button className="btn btn-ghost" onClick={() => setMenu(null)}>
              Keep going
            </button>
          </div>
        </Modal>
      )}

      {review && weightGoal && (
        <Modal open onClose={() => setReview(null)} title="Confirm your weigh-in">
          <div className="scan-photo">
            <img src={review.previewUrl} alt="Scale photo" />
            {review.weight != null && <span className="tag">Read from photo</span>}
          </div>
          <div className="numcard" style={{ marginTop: 12 }}>
            <div className="k">Weight</div>
            <input
              className="bignum-input"
              type="number"
              inputMode="decimal"
              value={review.input}
              placeholder="0.0"
              onChange={(e) => setReview({ ...review, input: e.target.value })}
            />
            <div className="stepbtns">
              {([['−0.1', -0.1], ['+0.1', 0.1]] as [string, number][]).map(([l, d]) => (
                <button key={l} onClick={() => setReview({ ...review, input: (Math.round(((parseFloat(review.input) || latestWeight || 0) + d) * 10) / 10).toFixed(1) })}>
                  {l}
                </button>
              ))}
            </div>
          </div>
          <div className="preview">
            <Icon name="info" />
            <span>
              {review.weight == null
                ? 'Couldn’t read the display - type the number from your scale.'
                : 'Check it matches your scale.'}{' '}
              {Number.isFinite(reviewKg) && latestWeight != null && reviewKg !== latestWeight
                ? `${Math.abs(reviewKg - latestWeight).toFixed(1)} kg ${reviewKg < latestWeight ? 'down' : 'up'} since last time.`
                : ''}
            </span>
          </div>
          <div style={{ display: 'grid', gap: 8, marginTop: 16 }}>
            <button className="btn btn-primary" disabled={saving} onClick={confirmWeighIn}>
              <Icon name="check" style={{ width: 16, height: 16 }} /> {saving ? 'Saving…' : 'Save weigh-in · +20 XP'}
            </button>
            <button
              className="btn btn-ghost"
              onClick={() => {
                setReview(null);
                fileRef.current?.click();
              }}
            >
              <Icon name="camera" style={{ width: 16, height: 16 }} /> Retake photo
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}
