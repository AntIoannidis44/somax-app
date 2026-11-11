import { Icon } from '../Icon';
import { useAppStore } from '../../store/useAppStore';
import type { IconName } from '../../data/icons';
import type { Route } from '../../types';

interface TabDef {
  id: Route | 'nutrition';
  label: string;
  icon: IconName;
  // 'nutrition' isn't a bottom-nav route - it's the full-screen macro
  // tracker overlay (see viewingMacros in useAppStore.ts), opened the same
  // way as Goals & schedule from Profile. Keeping it in the tab bar too is
  // just a second, faster entry point into the same screen.
  overlay?: true;
}

const TABS: TabDef[] = [
  { id: 'home', label: 'Home', icon: 'home' },
  { id: 'train', label: 'Train', icon: 'train' },
  { id: 'nutrition', label: 'Nutrition', icon: 'nutrition', overlay: true },
  { id: 'play', label: 'Play', icon: 'play' },
  { id: 'community', label: 'Community', icon: 'community' },
  { id: 'profile', label: 'Profile', icon: 'profile' },
];

export function TabBar() {
  const onboarded = useAppStore((s) => s.onboarded);
  const route = useAppStore((s) => s.route);
  const viewingMacros = useAppStore((s) => s.viewingMacros);
  const viewingDM = useAppStore((s) => s.viewingDM);
  const viewingGroup = useAppStore((s) => s.viewingGroup);
  const viewingChatInfo = useAppStore((s) => s.viewingChatInfo);
  const viewingSharedContent = useAppStore((s) => s.viewingSharedContent);
  const go = useAppStore((s) => s.go);
  const openMacros = useAppStore((s) => s.openMacros);
  const unreadTotal = useAppStore((s) => Object.values(s.unreadDM).reduce((sum, n) => sum + n, 0));

  // A chat (or anything stacked on top of one) takes the full screen, same
  // as WhatsApp - there's no bottom nav once you're actually in a
  // conversation, and hiding it is also what gives the keyboard the extra
  // room it needs instead of fighting the tab bar for space.
  if (!onboarded || viewingDM || viewingGroup || viewingChatInfo || viewingSharedContent) return null;

  return (
    <nav className="tabbar">
      {TABS.map((t) => {
        const active = t.overlay ? viewingMacros : !viewingMacros && route === t.id;
        return (
          <button
            key={t.id}
            className={`tab${active ? ' active' : ''}`}
            onClick={() => (t.overlay ? openMacros() : go(t.id as Route))}
          >
            <span style={{ position: 'relative', display: 'inline-flex' }}>
              <Icon name={t.icon} />
              {t.id === 'community' && unreadTotal > 0 && <span className="tab-badge">{unreadTotal > 9 ? '9+' : unreadTotal}</span>}
            </span>
            <span>{t.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
