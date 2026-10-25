import { Icon } from '../Icon';
import { useAppStore } from '../../store/useAppStore';
import type { IconName } from '../../data/icons';
import type { Route } from '../../types';

const TABS: { id: Route; label: string; icon: IconName }[] = [
  { id: 'home', label: 'Home', icon: 'home' },
  { id: 'train', label: 'Train', icon: 'train' },
  { id: 'play', label: 'Play', icon: 'play' },
  { id: 'community', label: 'Community', icon: 'community' },
  { id: 'profile', label: 'Profile', icon: 'profile' },
];

export function TabBar() {
  const onboarded = useAppStore((s) => s.onboarded);
  const route = useAppStore((s) => s.route);
  const go = useAppStore((s) => s.go);
  const unreadTotal = useAppStore((s) => Object.values(s.unreadDM).reduce((sum, n) => sum + n, 0));

  if (!onboarded) return null;

  return (
    <nav className="tabbar">
      {TABS.map((t) => (
        <button
          key={t.id}
          className={`tab${route === t.id ? ' active' : ''}`}
          onClick={() => go(t.id)}
        >
          <span style={{ position: 'relative', display: 'inline-flex' }}>
            <Icon name={t.icon} />
            {t.id === 'community' && unreadTotal > 0 && <span className="tab-badge">{unreadTotal > 9 ? '9+' : unreadTotal}</span>}
          </span>
          <span>{t.label}</span>
        </button>
      ))}
    </nav>
  );
}
