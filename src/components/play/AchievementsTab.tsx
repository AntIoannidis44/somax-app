import { Icon } from '../Icon';
import { ACHIEVEMENT_DEFS } from '../../data/achievements';
import type { IconName } from '../../data/icons';
import { useAppStore } from '../../store/useAppStore';

export function AchievementsTab() {
  const achievements = useAppStore((s) => s.achievements);

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
          </div>
        );
      })}
    </div>
  );
}
