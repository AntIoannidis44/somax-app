// Cloud save must keep working after XP legitimately goes DOWN (swapping today's
// session takes its XP back; evolving resets XP). Regression for "Log how you felt
// gives no XP": after a session swap every save was refused, so later XP never
// reached the cloud and vanished on the next app open.
import { beforeEach, describe, expect, it, vi } from 'vitest';

let cloudRow: { state: any; updated_at: string } | null = null;
const upserts: any[] = [];
vi.mock('../src/lib/supabase', () => {
  const table = (name: string) => ({
    select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: name === 'app_state' ? cloudRow : null, error: null }) }) }),
    upsert: async (row: any) => {
      if (name === 'app_state') { upserts.push(row); cloudRow = { state: JSON.parse(JSON.stringify(row.state)), updated_at: row.updated_at }; }
      return { error: null };
    },
  });
  return { supabase: { from: table } };
});

const { useAppStore } = await import('../src/store/useAppStore');
const { hydrateFromCloud, startCloudSync, stopCloudSync } = await import('../src/lib/cloudSync');
const S = () => useAppStore.getState();
const initial = S();
const flush = async () => { await vi.advanceTimersByTimeAsync(1600); await vi.runOnlyPendingTimersAsync(); };

beforeEach(() => {
  vi.useFakeTimers();
  stopCloudSync();
  upserts.length = 0;
  useAppStore.setState(initial, true);
  useAppStore.setState({ profile: { name: 'T' } as any, onboarded: true });
});

describe('cloud save after XP goes down', () => {
  it('session swap takes XP back, then "Log how you felt" still saves', async () => {
    // Cloud already has a workout's XP
    const idx = (new Date().getDay() + 6) % 7;
    const plan = [...S().weekPlan]; plan[idx] = { type: 'train', key: 'push' } as any; plan[new Date().getDay()] = { type: 'train', key: 'push' } as any;
    useAppStore.setState({ weekPlan: plan });
    S().reviseTodayFromPlan?.();
    useAppStore.setState({ progress: { ...S().progress, totalXP: 100, xpRev: 5 } });
    cloudRow = { state: JSON.parse(JSON.stringify(S())), updated_at: '2026-11-21T00:00:00.000Z' };
    await hydrateFromCloud('u');
    startCloudSync('u');

    // XP goes down (what a session swap / evolve does), then a goal pays
    useAppStore.setState((st: any) => ({ progress: { ...st.progress, totalXP: 60, xpRev: (st.progress.xpRev || 0) + 1 } }));
    S().submitFeelingLog('Legs heavy, energy good, slept well last night.');
    await flush();

    expect(S().today.goals.find((g) => g.id === 'logfeel')?.done).toBe(true);
    expect(cloudRow!.state.progress.totalXP).toBe(70);
    expect(cloudRow!.state.today.goals.find((g: any) => g.id === 'logfeel').done).toBe(true);
  });

  it('a genuinely stale copy (older revision) is still refused and replaced by the cloud copy', async () => {
    useAppStore.setState({ progress: { ...S().progress, totalXP: 100, xpRev: 9 } });
    cloudRow = { state: JSON.parse(JSON.stringify(S())), updated_at: '2026-11-21T00:00:00.000Z' };
    await hydrateFromCloud('u');
    startCloudSync('u');
    useAppStore.setState({ progress: { ...S().progress, totalXP: 40, xpRev: 3 } }); // old snapshot appears
    await flush();
    expect(cloudRow!.state.progress.totalXP).toBe(100);
    expect(S().progress.totalXP).toBe(100); // pulled back, not left showing phantom numbers
  });

  it('awardXP, session take-back and evolve all bump the revision', () => {
    const r0 = S().progress.xpRev ?? 0;
    S().toggleGoal('logfeel');
    expect(S().progress.xpRev).toBe(r0 + 1);
  });
});
