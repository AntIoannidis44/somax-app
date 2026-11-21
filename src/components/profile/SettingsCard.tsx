import { useEffect, useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { getGarminStatus, getStepsBySource, openGarminConnect, type StepSource } from '../../lib/health';
import { useUserId } from '../../lib/useSession';
import { requestLocalNotifPermission } from '../../lib/notifications';
import { registerForPush, unregisterPushToken } from '../../lib/push';
import { Icon } from '../Icon';
import type { Settings } from '../../types';
import type { IconName } from '../../data/icons';

const THEMES: { id: Settings['theme']; label: string; icon: 'sun' | 'moon' | 'rotate' }[] = [
  { id: 'light', label: 'Light', icon: 'sun' },
  { id: 'dark', label: 'Dark', icon: 'moon' },
  { id: 'system', label: 'System', icon: 'rotate' },
];

const SWITCHES: { key: keyof Settings; title: string; sub: string; kind: 'local' | 'push'; icon: IconName }[] = [
  { key: 'notifWorkout', title: 'Workout reminders', sub: 'Daily nudge for today’s session', kind: 'local', icon: 'bell' },
  { key: 'notifStreak', title: 'Streak alerts', sub: 'Warn before a streak lapses', kind: 'local', icon: 'flame' },
  { key: 'notifChallenge', title: 'Challenge updates', sub: 'Progress on joined challenges', kind: 'local', icon: 'trophy' },
  { key: 'notifLeague', title: 'League updates', sub: 'When a friend gains XP', kind: 'push', icon: 'community' },
  { key: 'notifMessages', title: 'Messages', sub: 'Push when a friend messages you', kind: 'push', icon: 'comment' },
];

export function SettingsCard() {
  const settings = useAppStore((s) => s.settings);
  const toggleSetting = useAppStore((s) => s.toggleSetting);
  const setTheme = useAppStore((s) => s.setTheme);
  const showToast = useAppStore((s) => s.showToast);
  const healthSource = useAppStore((s) => s.settings.healthSource ?? 'health');
  const setHealthSource = useAppStore((s) => s.setHealthSource);
  // Garmin: connected once Garmin Connect has written steps/heart rate to Apple Health (checked again
  // whenever the user comes back to Somax, e.g. after flipping the switch in Garmin Connect).
  const [garmin, setGarmin] = useState<boolean | null>(null);
  // Today's steps per source (Garmin Connect, iPhone, Apple Watch...) so anyone can see what Somax reads.
  const [stepSources, setStepSources] = useState<StepSource[] | null>(null);
  useEffect(() => {
    const check = () => {
      getGarminStatus().then((r) => setGarmin(r ? r.garmin : null));
      getStepsBySource().then(setStepSources);
    };
    check();
    const onVis = () => { if (document.visibilityState === 'visible') check(); };
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, []);
  const userId = useUserId();

  async function handleToggle(key: keyof Settings, kind: 'local' | 'push') {
    const turningOn = !settings[key];
    toggleSetting(key);
    if (!turningOn) {
      if (kind === 'push' && userId) unregisterPushToken(userId);
      return;
    }
    if (kind === 'local') {
      const granted = await requestLocalNotifPermission();
      if (!granted) {
        showToast('Enable notifications for SOMAXX in iOS Settings');
        toggleSetting(key);
      }
    } else if (userId) {
      const ok = await registerForPush(userId);
      if (!ok) {
        showToast('Enable notifications for SOMAXX in iOS Settings');
        toggleSetting(key);
      }
    }
  }

  return (
    <>
      <div className="section-label">Settings</div>
      <div className="card" style={{ marginBottom: 0 }}>
        <div className="setting-row">
          <span className="set-ic">
            <Icon name="sun" />
          </span>
          <div>
            <div className="setting-title">Appearance</div>
          </div>
          <div className="mini-seg">
            {THEMES.map((t) => (
              <button key={t.id} className={settings.theme === t.id ? 'on' : ''} onClick={() => setTheme(t.id)}>
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>
      {/* How each watch gets its data into Somax: everything comes through Apple Health, so a Garmin
          only needs Garmin Connect's own Apple Health switch turned on (owner, 2026-11-21). */}
      <div className="section-label">Health &amp; watches</div>
      <div className="card health-devices">
        <div className="setting-row health-source">
          <span className="set-ic">
            <Icon name="heart" />
          </span>
          <div>
            <div className="setting-title">Sync data from</div>
            <div className="setting-sub">
              {healthSource === 'garmin'
                ? 'Steps, calories, heart rate and workouts come only from your Garmin.'
                : 'Apple Health - your iPhone and Apple Watch, merged by Apple Health.'}
            </div>
          </div>
          <div className="mini-seg">
            {(['health', 'garmin'] as const).map((src) => (
              <button key={src} type="button" className={healthSource === src ? 'on' : ''} aria-pressed={healthSource === src}
                onClick={() => setHealthSource(src)}>
                {src === 'health' ? 'Apple Health' : 'Garmin'}
              </button>
            ))}
          </div>
        </div>
        {stepSources && <StepSources sources={stepSources} garminMode={healthSource === 'garmin'} />}
        <div className="setting-row">
          <span className="set-ic">
            <Icon name="watch" />
          </span>
          <div>
            <div className="setting-title">Apple Watch</div>
            <div className="setting-sub">Works automatically through Apple Health.</div>
          </div>
        </div>
        <div className="setting-row">
          <span className="set-ic">
            <Icon name="watch" />
          </span>
          <div>
            <div className="setting-title">Garmin watch{garmin ? <span className="garmin-ok"> · Connected ✓</span> : null}</div>
            {garmin && healthSource !== 'garmin' && (
              <div className="garmin-use">
                <span>Garmin found - use it for your steps, heart rate and workouts?</span>
                <button type="button" className="btn btn-primary btn-sm" onClick={() => setHealthSource('garmin')}>Use Garmin</button>
              </div>
            )}
            <div className="setting-sub">
              {garmin
                ? 'Your steps, heart rate, calories, active minutes and workouts are coming through Apple Health.'
                : 'In the Garmin Connect app go to Settings → Connected Apps → Apple Health and turn everything on. Your steps, heart rate, calories, active minutes and workouts then show up in Somax.'}
            </div>
            {!garmin && (
              <button type="button" className="btn btn-soft btn-sm garmin-open" onClick={() => openGarminConnect()}>
                Open Garmin Connect
              </button>
            )}
          </div>
        </div>
      </div>
      <div className="section-label">Notifications</div>
      <div className="card">
        {SWITCHES.map((s) => (
          <div className="setting-row" key={s.key}>
            <span className="set-ic">
              <Icon name={s.icon} />
            </span>
            <div>
              <div className="setting-title">{s.title}</div>
              <div className="setting-sub">{s.sub}</div>
            </div>
            <button className={`switch${settings[s.key] ? ' on' : ''}`} onClick={() => handleToggle(s.key, s.kind)} aria-label={s.title} />
          </div>
        ))}
      </div>
    </>
  );
}

function ago(iso: string | null): string {
  if (!iso) return '';
  const min = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
  if (min < 2) return 'just now';
  if (min < 60) return `${min} min ago`;
  const h = Math.floor(min / 60);
  return `${h} h ${min % 60} min ago`;
}

// "Steps today in Apple Health": one row per app/device, marking the one(s) Somax counts.
export function StepSources({ sources, garminMode }: { sources: StepSource[]; garminMode: boolean }) {
  const g = sources.filter((x) => x.garmin);
  const lastGarmin = g.map((x) => x.lastAt).filter(Boolean).sort().pop() ?? null;
  const stale = lastGarmin ? Date.now() - new Date(lastGarmin).getTime() > 60 * 60000 : false;
  return (
    <div className="step-sources">
      <div className="step-sources-h">Steps today in Apple Health</div>
      {sources.length === 0 && <div className="step-src-note">No steps recorded yet today.</div>}
      {sources.map((x) => {
        const used = garminMode ? x.garmin : true;
        return (
          <div key={x.bundleId} className={`step-src${used ? ' used' : ''}`}>
            <span className="n">{x.garmin ? 'Garmin' : x.name}</span>
            <span className="v">{x.steps.toLocaleString()}</span>
            <span className="t">{x.lastAt ? `last sent ${ago(x.lastAt)}` : ''}</span>
            {garminMode && x.garmin && <span className="u">Used ✓</span>}
          </div>
        );
      })}
      {garminMode && g.length === 0 && (
        <div className="step-src-note warn">
          No Garmin steps in Apple Health today. Open Garmin Connect so it syncs, and check Garmin Connect → Settings → Connected Apps → Apple Health has Steps turned on.
        </div>
      )}
      {garminMode && g.length > 0 && stale && (
        <div className="step-src-note warn">
          Garmin last sent steps {ago(lastGarmin)}. Open Garmin Connect to sync your latest steps - Garmin only sends them to Apple Health when it syncs.
        </div>
      )}
      {!garminMode && sources.length > 1 && (
        <div className="step-src-note">Apple Health merges these so steps aren't counted twice.</div>
      )}
    </div>
  );
}
