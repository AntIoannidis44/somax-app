import { useAppStore } from '../../store/useAppStore';
import type { Settings } from '../../types';

const SWITCHES: { key: keyof Settings; title: string; sub: string }[] = [
  { key: 'notifWorkout', title: 'Workout reminders', sub: 'Daily nudge for today’s session' },
  { key: 'notifStreak', title: 'Streak alerts', sub: 'Warn before a streak lapses' },
  { key: 'notifChallenge', title: 'Challenge updates', sub: 'Progress on joined challenges' },
  { key: 'notifLeague', title: 'League updates', sub: 'Weekly rank changes' },
];

export function SettingsCard() {
  const settings = useAppStore((s) => s.settings);
  const toggleSetting = useAppStore((s) => s.toggleSetting);

  return (
    <div className="card">
      {SWITCHES.map((s) => (
        <div className="setting-row" key={s.key}>
          <div>
            <div className="setting-title">{s.title}</div>
            <div className="setting-sub">{s.sub}</div>
          </div>
          <button className={`switch${settings[s.key] ? ' on' : ''}`} onClick={() => toggleSetting(s.key)} />
        </div>
      ))}
    </div>
  );
}
