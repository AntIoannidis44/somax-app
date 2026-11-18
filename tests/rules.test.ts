// Layer 1: pure rule tests - Apple Fitness verification, challenge progress, coin rules.
import { describe, expect, it } from 'vitest';
import { checkWatchSync } from '../src/lib/schedule';
import { computeChallengeProgress, verifySpecFor } from '../src/lib/verifiedChallenges';
import { challengeCoins } from '../src/lib/coins';
import { CHALLENGE_DEFS } from '../src/data/challenges';

const gym = { duration: '45 min', category: 'gym' };
const wk = (o: Partial<{ uuid: string; durationMinutes: number; activityName: string; kcal: number; userEntered: boolean }>) => ({
  uuid: 'w', durationMinutes: 45, activityName: 'Strength Training', kcal: 220, ...o,
});

describe('Apple Fitness verification (+10 XP and coins)', () => {
  it('rejects a 3-second workout', () => expect(checkWatchSync(wk({ durationMinutes: 0.05, kcal: 0.2 }), gym, false).ok).toBe(false));
  it('rejects a watch left running on the couch', () => expect(checkWatchSync(wk({ kcal: 25 }), gym, false).ok).toBe(false));
  it('rejects a walk used for a gym session', () => expect(checkWatchSync(wk({ activityName: 'Walk', durationMinutes: 40, kcal: 150 }), gym, false).ok).toBe(false));
  it('rejects a workout typed into the Health app', () => expect(checkWatchSync(wk({ userEntered: true }), gym, false).ok).toBe(false));
  it('rejects a workout already used for another session', () => expect(checkWatchSync(wk({}), gym, true).ok).toBe(false));
  it('accepts a real 45 min strength session', () => expect(checkWatchSync(wk({}), gym, false).ok).toBe(true));
  it('accepts a lighter, shorter real session (lenient)', () => expect(checkWatchSync(wk({ durationMinutes: 20, kcal: 60 }), gym, false).ok).toBe(true));
  it('accepts HIIT for a gym session', () => expect(checkWatchSync(wk({ activityName: 'HIIT', durationMinutes: 30, kcal: 240 }), gym, false).ok).toBe(true));
  it('accepts a swim for a swim session', () => expect(checkWatchSync(wk({ activityName: 'Swim', durationMinutes: 40, kcal: 300 }), { duration: '40 min', category: 'swim' }, false).ok).toBe(true));
});

const W = (date: string, type: string, min: number, kcal: number, km = 0, extra: object = {}) => ({
  uuid: date + type + min, activityName: type, startDate: `${date}T07:00:00`, durationMinutes: min, kcal, distanceMeters: km * 1000, ...extra,
});
const def = (id: string) => {
  const d = CHALLENGE_DEFS.find((x) => x.id === id);
  if (!d) throw new Error(`no challenge ${id}`);
  return d;
};
const progress = (id: string, watch: object[], inApp: { date: string; category: string }[] = [], manual = 0, steps: { date: string; steps: number }[] = []) =>
  computeChallengeProgress(def(id), verifySpecFor(def(id))!, '2026-11-10', '2026-11-16', watch as never, steps, inApp, manual);

describe('challenge progress: total (XP) vs verified (coins)', () => {
  const watch = [W('2026-11-10', 'Strength Training', 45, 220), W('2026-11-12', 'Strength Training', 45, 230), W('2026-11-14', 'Run', 30, 300, 5)];
  const app = [{ date: '2026-11-11', category: 'gym' }, { date: '2026-11-12', category: 'gym' }, { date: '2026-11-13', category: 'gym' }];
  it('in-app workouts count toward progress; a day in both counts once', () =>
    expect(progress('strength-session-streak', watch, app)).toEqual({ total: 4, verified: 2 }));
  it('a streak finished with app workouts completes for XP but not coins', () =>
    expect(progress('five-in-a-row', watch, app)).toEqual({ total: 5, verified: 1 }));
  it('logged km add to progress, not to verified', () => expect(progress('easy-miles-starter', watch, [], 3)).toEqual({ total: 8, verified: 5 }));
  it('ignores couch, too-short and hand-entered workouts', () => {
    const bad = [W('2026-11-10', 'Strength Training', 45, 20), W('2026-11-11', 'Strength Training', 3, 2), W('2026-11-12', 'Run', 30, 300, 6, { userEntered: true })];
    expect(progress('active-week', bad)).toEqual({ total: 0, verified: 0 });
  });
  it('one workout per day counts as one session (no splitting)', () => {
    const split = [W('2026-11-10', 'Strength Training', 15, 60), W('2026-11-10', 'Strength Training', 15, 60), W('2026-11-10', 'Strength Training', 15, 60)];
    expect(progress('strength-session-streak', split).verified).toBe(1);
  });
  it('pool laps = distance / pool length', () => expect(progress('lap-count-launch', [W('2026-11-15', 'Swim', 40, 300, 1.5, { lapLengthMeters: 25 })]).verified).toBe(60));
  it('step days and step streaks', () => {
    const steps = [9000, 8500, 12000, 3000, 8100, 9900, 10500].map((s, i) => ({ date: `2026-11-${10 + i}`, steps: s }));
    expect(progress('step-goal-week', [], [], 0, steps).verified).toBe(6);
    expect(progress('eight-k-every-day', [], [], 0, steps).verified).toBe(3);
  });
  it('workouts outside the challenge window do not count', () =>
    expect(progress('active-week', [W('2026-11-09', 'Strength Training', 45, 220), W('2026-11-20', 'Strength Training', 45, 220)]).verified).toBe(0));
});

describe('coin rules', () => {
  it('only challenges Apple Health can measure pay coins', () => {
    for (const d of CHALLENGE_DEFS) expect(challengeCoins(d) > 0).toBe(!!verifySpecFor(d) || !!d.coinsVerified);
  });
  it('harder challenges pay more', () => {
    expect(challengeCoins(def('three-in-a-row'))).toBe(25);
    expect(challengeCoins(def('five-in-a-row'))).toBe(50);
    expect(challengeCoins(def('iron-streak'))).toBe(100);
  });
  it('rep/set/round challenges pay no coins', () => {
    for (const id of ['pushups', 'squats', 'burpee-gauntlet', 'tabata-taster', 'plank-endurance']) expect(challengeCoins(def(id))).toBe(0);
  });
});
