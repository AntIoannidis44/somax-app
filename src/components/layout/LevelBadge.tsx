import { useAppStore } from '../../store/useAppStore';
import { tierFor } from '../../lib/character';
import { levelCeil, levelFloor } from '../../lib/xp';

// Header level badge: the level number in a tier-coloured hexagon, wrapped
// in a ring that fills with progress toward the next level. Shown in every
// main tab's header and opens Profile.
export function LevelBadge() {
  const progress = useAppStore((s) => s.progress);
  const go = useAppStore((s) => s.go);

  const lvl = progress.level;
  const tier = tierFor(lvl);
  const floor = levelFloor(lvl);
  const ceil = levelCeil(lvl);
  const pct = ceil > floor ? Math.max(0, Math.min(1, (progress.totalXP - floor) / (ceil - floor))) : 1;

  return (
    <button className="lvl-badge2" onClick={() => go('profile')} aria-label={`Level ${lvl}, ${tier.name} tier`}>
      <span className="lvl-ring" style={{ ['--p' as string]: `${Math.round(pct * 100)}%` }}>
        <span className="lvl-hex" style={{ ['--c1' as string]: tier.c1, ['--c2' as string]: tier.c2 }}>
          {lvl}
        </span>
      </span>
      <span className="lvl-meta">
        <b>{tier.name}</b>
        <small>{(progress.totalXP - floor).toLocaleString()} / {(ceil - floor).toLocaleString()}</small>
      </span>
    </button>
  );
}
