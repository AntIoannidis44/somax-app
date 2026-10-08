import { useState } from 'react';
import { Icon } from '../Icon';
import { useAppStore } from '../../store/useAppStore';
import { healthAvailableOnPlatform, requestHealthAuthorization, getTodayHealthSummary, getMonthlySteps, getLatestHeartRate } from '../../lib/health';

type Status = 'idle' | 'loading' | 'connected' | 'denied' | 'error';

export function AppleHealthCard() {
  const health = useAppStore((s) => s.today.health);
  const syncHealthMetrics = useAppStore((s) => s.syncHealthMetrics);
  const setMonthlySteps = useAppStore((s) => s.setMonthlySteps);
  const [status, setStatus] = useState<Status>(health ? 'connected' : 'idle');
  const [hasHeartRateEver, setHasHeartRateEver] = useState(true);
  const [errorDetail, setErrorDetail] = useState('');

  if (!healthAvailableOnPlatform()) return null;

  async function connect() {
    setStatus('loading');
    try {
      const granted = await requestHealthAuthorization();
      if (!granted) {
        setStatus('denied');
        return;
      }
      const [summary, monthlySteps, hr] = await Promise.all([getTodayHealthSummary(), getMonthlySteps(), getLatestHeartRate()]);
      if (!summary) {
        setErrorDetail('No summary returned');
        setStatus('error');
        return;
      }
      setHasHeartRateEver(!!hr?.bpm);
      syncHealthMetrics({ steps: summary.steps, kcal: summary.kcal, activeMinutes: summary.activeMinutes, hr: hr?.bpm ?? null });
      if (monthlySteps !== null) setMonthlySteps(monthlySteps);
      setStatus('connected');
    } catch (e) {
      setErrorDetail(e instanceof Error ? e.message : String(e));
      setStatus('error');
    }
  }

  return (
    <div className="card" style={{ marginBottom: 18 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div className="wc-icon">
          <Icon name="heart" />
        </div>
        <div style={{ flex: 1 }}>
          <div className="wc-title">Apple Health</div>
          <div className="wc-sub">
            {status === 'connected'
              ? 'Connected — steps, active time & heart rate sync from Health'
              : status === 'denied'
                ? 'Permission denied — enable in Settings → Privacy → Health'
                : status === 'error'
                  ? `Error: ${errorDetail}`
                  : 'Sync steps, active time and heart rate from Health'}
          </div>
        </div>
      </div>
      {status !== 'connected' && (
        <button className="btn btn-primary" style={{ marginTop: 14 }} disabled={status === 'loading'} onClick={connect}>
          {status === 'loading' ? 'Connecting…' : status === 'error' || status === 'denied' ? 'Try again' : 'Connect Apple Health'}
        </button>
      )}
      {status === 'connected' && health && (
        <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
          <div style={{ flex: 1, textAlign: 'center' }}>
            <div style={{ fontSize: 20, fontWeight: 800 }}>{health.steps.toLocaleString()}</div>
            <div style={{ fontSize: 11, color: 'var(--text-faint)' }}>Steps today</div>
          </div>
          <div style={{ flex: 1, textAlign: 'center' }}>
            <div style={{ fontSize: 20, fontWeight: 800 }}>{Math.round(health.activeMinutes)}</div>
            <div style={{ fontSize: 11, color: 'var(--text-faint)' }}>Active min</div>
          </div>
          <div style={{ flex: 1, textAlign: 'center' }}>
            {health.hr ? (
              <>
                <div style={{ fontSize: 20, fontWeight: 800 }}>{Math.round(health.hr)}</div>
                <div style={{ fontSize: 11, color: 'var(--text-faint)' }}>Latest BPM</div>
              </>
            ) : (
              <>
                <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-faint)' }}>—</div>
                <div style={{ fontSize: 11, color: 'var(--text-faint)' }}>{hasHeartRateEver ? 'Latest BPM' : 'Pair a smart watch'}</div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
