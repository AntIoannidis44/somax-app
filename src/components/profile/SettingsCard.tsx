import { useAppStore } from '../../store/useAppStore';
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
      await registerForPush(userId);
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
