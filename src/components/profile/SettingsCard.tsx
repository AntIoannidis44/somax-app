import { useAppStore } from '../../store/useAppStore';
import { useUserId } from '../../lib/useSession';
import { requestLocalNotifPermission } from '../../lib/notifications';
import { registerForPush, unregisterPushToken } from '../../lib/push';
import { Icon } from '../Icon';
import type { Settings } from '../../types';

const THEMES: { id: Settings['theme']; label: string; icon: 'sun' | 'moon' | 'rotate' }[] = [
  { id: 'light', label: 'Light', icon: 'sun' },
  { id: 'dark', label: 'Dark', icon: 'moon' },
  { id: 'system', label: 'System', icon: 'rotate' },
];

const SWITCHES: { key: keyof Settings; title: string; sub: string; kind: 'local' | 'push' }[] = [
  { key: 'notifWorkout', title: 'Workout reminders', sub: 'Daily nudge for today’s session', kind: 'local' },
  { key: 'notifStreak', title: 'Streak alerts', sub: 'Warn before a streak lapses', kind: 'local' },
  { key: 'notifChallenge', title: 'Challenge updates', sub: 'Progress on joined challenges', kind: 'local' },
  { key: 'notifLeague', title: 'League updates', sub: 'When a friend gains XP', kind: 'push' },
  { key: 'notifMessages', title: 'Messages', sub: 'Push when a friend messages you', kind: 'push' },
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
      <div className="section-label">Appearance</div>
      <div className="composer-visibility" style={{ marginBottom: 16 }}>
        {THEMES.map((t) => (
          <button key={t.id} className={`composer-visibility-opt${settings.theme === t.id ? ' active' : ''}`} onClick={() => setTheme(t.id)}>
            <Icon name={t.icon} style={{ width: 14, height: 14 }} />
            {t.label}
          </button>
        ))}
      </div>
      <div className="section-label">Notifications</div>
      <div className="card">
      {SWITCHES.map((s) => (
        <div className="setting-row" key={s.key}>
          <div>
            <div className="setting-title">{s.title}</div>
            <div className="setting-sub">{s.sub}</div>
          </div>
          <button className={`switch${settings[s.key] ? ' on' : ''}`} onClick={() => handleToggle(s.key, s.kind)} />
        </div>
      ))}
      </div>
    </>
  );
}
