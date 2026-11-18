// Layer 1: the real app store, driven like the UI drives it - XP, coins and challenges end to end.
import { beforeEach, describe, expect, it } from 'vitest';
import { useAppStore } from '../src/store/useAppStore';
import { normalizeGoalXp } from '../src/lib/schedule';
import { CHALLENGE_DEFS } from '../src/data/challenges';

const initial = useAppStore.getState();
const S = () => useAppStore.getState();
// XP earned since a history length, excluding achievement bonuses (e.g. "First Rep" on a first workout).
const workoutXpSince = (len: number) =>
  S().history.slice(0, S().history.length - len).filter((h) => h.type === 'xp' && !h.label.startsWith('Achievement:')).reduce((n, h) => n + (h.xp ?? 0), 0);
const today = (() => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; })();
const watch = (o: object = {}) => ({ uuid: 'u1', activityName: 'Strength Training', startDate: `${today}T07:00:00`, durationMinutes: 45, kcal: 220, distanceMeters: null, ...o });
const metrics = (steps: number, verifiedSteps: number) => ({ steps, verifiedSteps, kcal: 300, activeMinutes: 30, hr: null });

beforeEach(() => {
  useAppStore.setState(initial, true);
  useAppStore.setState({ coins: 100, coinLedger: [] }); // existing balance must be kept
});

describe('coins come only from verified data and never pay twice', () => {
  it('device-recorded step goal pays 5 coins once a day', () => {
    S().syncHealthMetrics(metrics(9000, 9000));
    S().syncHealthMetrics(metrics(9500, 9500));
    expect(S().coins).toBe(105);
    expect(S().coinLedger).toHaveLength(1);
  });
  it('steps typed into the Health app earn XP but no coins', () => {
    const xp = S().progress.totalXP;
    S().syncHealthMetrics(metrics(20000, 500));
    expect(S().coins).toBe(100);
    expect(S().progress.totalXP).toBeGreaterThan(xp);
  });
  it('XP from a manual checklist tick pays no coins (coins are no longer XP / 4)', () => {
    useAppStore.setState({ today: { ...S().today, goals: [{ id: 'warmup', label: 'Warm-up', meta: '', xp: 10, type: 'toggle', done: false }] } });
    S().toggleGoal('warmup');
    expect(S().coins).toBe(100);
  });
});

describe('workout: 30 XP for finishing, +10 XP and 10 coins for verifying', () => {
  const start = () => {
    S().openWorkout('push');
    const len = S().history.length;
    S().finishWorkout('push');
    return len;
  };
  it('finishing pays 30 XP and no coins', () => {
    const xp0 = start();
    expect(workoutXpSince(xp0)).toBe(30);
    expect(S().coins).toBe(100);
  });
  it('verifying with a real watch workout pays +10 XP and 10 coins, once', () => {
    const xp0 = start();
    expect(S().attachWatchWorkoutToSession('push', S().simDay, watch()).awarded).toBe(true);
    expect(workoutXpSince(xp0)).toBe(40);
    expect(S().coins).toBe(110);
    S().attachWatchWorkoutToSession('push', S().simDay, watch({ uuid: 'u2' })); // re-pick another workout same day
    expect(workoutXpSince(xp0)).toBe(40);
    expect(S().coins).toBe(110);
  });
  it('a hand-entered workout is refused: no XP, no coins, not attached', () => {
    const xp0 = start();
    const res = S().attachWatchWorkoutToSession('push', S().simDay, watch({ userEntered: true }));
    expect(res.reason).toMatch(/by hand/);
    expect(workoutXpSince(xp0)).toBe(30);
    expect(S().coins).toBe(100);
    expect(S().workoutState[S().simDay].push.watchSync).toBeUndefined();
  });
  it('a 3-second workout is refused', () => {
    start();
    expect(S().attachWatchWorkoutToSession('push', S().simDay, watch({ durationMinutes: 0.05, kcal: 0.2 })).reason).toMatch(/Too short/);
  });
  it('ticking the checklist row then finishing does not pay twice', () => {
    useAppStore.setState({ today: { ...S().today, goals: [{ id: 'workout', label: 'Complete Push', meta: '', xp: 30, type: 'workout', done: false }] } });
    const len = S().history.length;
    S().toggleGoal('workout');
    S().openWorkout('push');
    S().finishWorkout('push');
    expect(workoutXpSince(len)).toBe(30);
  });
  it('an old saved checklist showing +40 is corrected to 30', () => {
    const goals = [{ id: 'workout', xp: 40 }, { id: 'warmup', xp: 10 }];
    normalizeGoalXp(goals);
    expect(goals.map((g) => g.xp)).toEqual([30, 10]);
  });
});

describe('challenges: progress counts for everyone, coins only for the verified part', () => {
  it('completes on unverified progress for XP, pays coins only when the verified part reaches the target', () => {
    S().joinChallenge('five-in-a-row');
    S().syncVerifiedChallenges({ 'five-in-a-row': { total: 5, verified: 1 } });
    const c = () => S().challenges.find((x) => x.id === 'five-in-a-row')!;
    expect(c().completed).toBe(true);
    expect(S().coins).toBe(100);
    S().syncVerifiedChallenges({ 'five-in-a-row': { total: 5, verified: 5 } });
    expect(S().coins).toBe(150);
    S().syncVerifiedChallenges({ 'five-in-a-row': { total: 5, verified: 5 } });
    expect(S().coins).toBe(150);
  });
  it('joining records the start date', () => {
    S().joinChallenge('active-week');
    expect(S().challenges.find((x) => x.id === 'active-week')!.joinedAt).toBe(today);
  });
  it('the log button adds to progress (XP) for distance challenges', () => {
    const d = CHALLENGE_DEFS.find((x) => x.id === 'easy-miles-starter')!;
    S().joinChallenge('easy-miles-starter');
    S().logChallenge('easy-miles-starter');
    const c = S().challenges.find((x) => x.id === 'easy-miles-starter')!;
    expect(c.progress).toBe(d.logStep);
    expect(c.manualProgress).toBe(d.logStep);
    expect(S().coins).toBe(100);
  });
  it('step challenges cannot be logged by hand', () => {
    S().joinChallenge('step-goal-week');
    S().logChallenge('step-goal-week');
    expect(S().challenges.find((x) => x.id === 'step-goal-week')!.progress).toBe(0);
  });
  it('rep challenges keep their log button and pay no coins on completion', () => {
    const d = CHALLENGE_DEFS.find((x) => x.id === 'pushups')!;
    S().joinChallenge('pushups');
    for (let i = 0; i < Math.ceil(d.target / d.logStep!); i++) S().logChallenge('pushups');
    expect(S().challenges.find((x) => x.id === 'pushups')!.completed).toBe(true);
    expect(S().coins).toBe(100);
  });
});

describe('swapping today\'s session never pays twice (owner bug 2026-11-18)', () => {
  // session XP only (achievement bonuses like 'First Rep' are separate, legitimate one-offs)
  const xp = () => S().progress.totalXP - S().history.filter((h) => h.label.startsWith('Achievement:')).reduce((n, h) => n + (h.xp ?? 0), 0);
  const setToday = (plan: object) => {
    const p = [...S().weekPlan]; p[new Date().getDay()] = plan as never; useAppStore.setState({ weekPlan: p });
    useAppStore.setState({ today: { ...S().today, goals: [{ id: 'workout', label: 'Complete Push', meta: '', xp: 30, type: 'workout', done: false }], xpEarnedToday: 0 } });
  };
  it('ticked workout, then switched to Apple Fitness sync and synced: only the synced activity pays', () => {
    setToday({ type: 'train', key: 'push' });
    const x0 = xp();
    S().toggleGoal('workout');
    expect(xp() - x0).toBe(30);
    S().setDayToWatchSync(new Date().getDay());
    expect(xp() - x0).toBe(0);
    S().toggleWatchWorkoutSelection({ uuid: 'w1', activityName: 'Strength Training', startDate: new Date().toISOString(), durationMinutes: 45, kcal: 220, distanceMeters: null });
    expect(xp() - x0).toBe(40);
  });
  it('finished + verified workout, then swapped to another program: old 40 removed, new one can pay', () => {
    setToday({ type: 'train', key: 'push' });
    S().openWorkout('push');
    const len = S().history.length; const x0 = xp();
    S().finishWorkout('push');
    S().attachWatchWorkoutToSession('push', S().simDay, { uuid: 'w2', activityName: 'Strength Training', startDate: new Date().toISOString(), durationMinutes: 45, kcal: 220, distanceMeters: null });
    const earned = xp() - x0;
    S().setDayWorkout(new Date().getDay(), 'pull');
    expect(x0 + earned - xp()).toBe(40);
    S().openWorkout('pull'); S().finishWorkout('pull');
    expect(S().history.slice(0, S().history.length - len).some((h) => h.label.includes('Pull') && h.xp === 30)).toBe(true);
  });
  it('re-picking Apple Fitness sync (reset) does not let the same day pay 40 twice', () => {
    setToday({ type: 'watch' });
    useAppStore.setState({ today: { ...S().today, goals: [{ id: 'watch_workout', label: 'Log a workout', meta: '', xp: 40, type: 'watch', done: false }] } });
    const x0 = xp();
    const w = { uuid: 'w3', activityName: 'Run', startDate: new Date().toISOString(), durationMinutes: 30, kcal: 300, distanceMeters: 5000 };
    S().toggleWatchWorkoutSelection(w);
    S().setDayToWatchSync(new Date().getDay());
    S().toggleWatchWorkoutSelection({ ...w, uuid: 'w4' });
    expect(xp() - x0).toBe(40);
  });
});
