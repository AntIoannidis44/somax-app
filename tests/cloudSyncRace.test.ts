// Two saves overlapping on a slow connection must never undo something the user
// just did. Regression: save A uploads; save B starts before A finishes, sees A's
// row as "newer than I last synced", treats it as another device and reloads it -
// A's snapshot was taken BEFORE "Log how you felt" was submitted, so the tick and
// XP vanished.
import { beforeEach, describe, expect, it, vi } from 'vitest';

let cloudRow: { state: any; updated_at: string } | null = null;
let clock = Date.parse('2026-11-21T08:00:00Z');
vi.mock('../src/lib/supabase', () => {
  const table = (name: string) => ({
    select: () => ({ eq: () => ({ maybeSingle: async () => { await new Promise((r) => setTimeout(r, 50)); return { data: name === 'app_state' && cloudRow ? JSON.parse(JSON.stringify(cloudRow)) : null, error: null }; } }) }),
    upsert: async (row: any) => {
      if (name === 'app_state') {
        await new Promise((r) => setTimeout(r, 3000)); // slow phone network
        clock += 1000;
        cloudRow = { state: JSON.parse(JSON.stringify(row.state)), updated_at: new Date(clock).toISOString().replace('Z', '+00:00') };
      }
      return { error: null };
    },
  });
  return { supabase: { from: table } };
});

const { useAppStore } = await import('../src/store/useAppStore');
const { hydrateFromCloud, startCloudSync, stopCloudSync } = await import('../src/lib/cloudSync');
const S = () => useAppStore.getState();
const initial = S();

beforeEach(() => {
  vi.useFakeTimers();
  stopCloudSync();
  useAppStore.setState(initial, true);
  useAppStore.setState({ profile: { name: 'T' } as any, onboarded: true });
});

describe('overlapping saves', () => {
  it('a save overlapping another never undoes "Log how you felt"', async () => {
    cloudRow = { state: JSON.parse(JSON.stringify(S())), updated_at: '2026-11-21T07:59:00+00:00' };
    await vi.runAllTimersAsync();
    const h = hydrateFromCloud('u'); await vi.advanceTimersByTimeAsync(100); await h;
    startCloudSync('u');

    useAppStore.setState({ settings: { ...S().settings, notifLeague: !S().settings.notifLeague } }); // e.g. a health sync change
    await vi.advanceTimersByTimeAsync(1550); // save A starts, uploading slowly
    S().submitFeelingLog('Legs heavy, energy good, slept well last night.');
    await vi.advanceTimersByTimeAsync(1550); // save B starts while A is still uploading
    await vi.advanceTimersByTimeAsync(15000);

    expect(S().today.goals.find((g) => g.id === 'logfeel')?.done).toBe(true);
    expect(S().progress.totalXP).toBe(10);
    expect(cloudRow!.state.today.goals.find((g: any) => g.id === 'logfeel').done).toBe(true);
    expect(cloudRow!.state.progress.totalXP).toBe(10);
  });
});
