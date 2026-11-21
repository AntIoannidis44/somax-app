import { describe, expect, it, vi } from 'vitest';
import { heartRateTile } from '../src/components/home/MetricsRow';

// Owner 2026-11-20: Home heart rate was "locked at 137 BPM" - it showed the single latest HealthKit reading
// however old. It must be TODAY'S AVERAGE heart rate, and blank ("no heart rate detected") when there is none.

describe('Home heart-rate tile', () => {
  it("shows resting heart rate, rounded, labelled Resting HR", () => {
    expect(heartRateTile({ hr: 71.6 })).toEqual({ val: 72, unit: 'bpm', label: 'Resting HR', pct: 0.62 });
  });

  it('no reading today = blank and says no heart rate detected (never a stand-in number)', () => {
    for (const hr of [null, 0]) {
      expect(heartRateTile({ hr })).toEqual({ val: '—', unit: undefined, label: 'No heart rate', pct: 0 });
    }
  });
});

describe("getTodayAverageHeartRate (bridge to HealthKit's own daily average)", () => {
  async function withNative(bpm: number | null) {
    vi.resetModules();
    vi.doMock('@capacitor/core', () => ({
      Capacitor: { isNativePlatform: () => true, getPlatform: () => 'ios', isPluginAvailable: () => true },
      registerPlugin: () => ({ getTodayAverageHeartRate: async () => ({ bpm }) }),
    }));
    const { getTodayAverageHeartRate } = await import('../src/lib/health');
    return getTodayAverageHeartRate();
  }

  it('rounds the average Apple Health returns', async () => {
    expect(await withNative(68.4)).toBe(68);
  });

  it('null when Apple Health has no heart rate today', async () => {
    expect(await withNative(null)).toBeNull();
  });
});
