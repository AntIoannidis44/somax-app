import { Icon } from '../Icon';
import { ACHIEVEMENT_DEFS } from '../../data/achievements';
import type { IconName } from '../../data/icons';
import { useAppStore } from '../../store/useAppStore';

export function AchievementsTab() {
  const achievements = useAppStore((s) => s.achievements);
  const state = useAppStore((s) => s);

  return (
    <div className="achv-grid">
      {ACHIEVEMENT_DEFS.map((a) => {
        const unlocked = !!achievements[a.id];
        return (
          <div className={`achv${unlocked ? ' unlocked' : ''}`} key={a.id}>
            <div className="achv-icon">
              <Icon name={a.icon as IconName} style={{ width: 18, height: 18 }} />
            </div>
            <div className="achv-name">{a.name}</div>
            <div className="achv-desc">{a.desc}</div>
            {a.progress && (() => {
              const value = Math.min(a.progress.value(state), a.progress.target);
              const pct = Math.round((value / a.progress.target) * 100);
              return (
                <>
                  <div className="progress-track" style={{ marginTop: 8, height: 6 }}>
                    <div className={`progress-fill${unlocked ? ' success' : ''}`} style={{ width: `${pct}%` }} />
                  </div>
                  <div className="achv-desc" style={{ marginTop: 4 }}>
                    {value} / {a.progress.target}
                  </div>
                </>
              );
            })()}
          </div>
        );
      })}
    </div>
  );
}
