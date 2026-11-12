import { CHAR_TIERS } from '../../data/catalog';
import { useAppStore } from '../../store/useAppStore';
import { tierFor } from '../../lib/character';
import { levelCeil, levelFloor, MAX_LEVEL } from '../../lib/xp';
import { TierBadge } from './TierBadge';

function formatXP(n: number): string {
  return Math.max(0, Math.round(n)).toLocaleString();
}

// Only the road ahead - levels already banked add nothing to look at, so
// the timeline starts at the level the player is actually on and runs to
// the level 55 cap. A cascading reveal animation plays once on mount
// (prefers-reduced-motion already zeroes every animation duration
// app-wide, so this respects that for free).
export function LevelPath() {
  const progress = useAppStore((s) => s.progress);
  const lvl = progress.level;
  const xp = progress.totalXP;
  const floor = levelFloor(lvl);
  const ceil = levelCeil(lvl);
  const span = Math.max(1, ceil - floor);
  const pct = Math.max(0, Math.min(1, (xp - floor) / span));
  const toNext = Math.max(0, ceil - xp);
  const t = tierFor(lvl);
  const maxed = lvl >= MAX_LEVEL;
  const segments = Math.max(1, MAX_LEVEL - lvl);

  const nodes = [];
  for (let L = lvl; L <= MAX_LEVEL; L++) {
    const nt = tierFor(L);
    const isTierStart = CHAR_TIERS.some((tt) => tt.min === L);
    const current = L === lvl;
    nodes.push(
      <div className={`tl-node${current ? ' current' : ''}`} key={L} style={{ animationDelay: `${Math.min(L - lvl, 24) * 28}ms` }}>
        {isTierStart && <div className="tl-tier">{nt.name}</div>}
        <div className="tl-badge">
          <TierBadge level={L} c1={nt.c1} c2={nt.c2} size={current ? 54 : 44} pct={current ? pct : undefined} />
        </div>
        <div className="tl-lvl">{L}</div>
      </div>,
    );
  }

  return (
    <>
      <div className="tl-next" style={{ ['--t1' as string]: t.c1, ['--t2' as string]: t.c2 }}>
        <div className="tl-next-top">
          <span className="tl-next-label">{maxed ? 'Max level' : 'Next level'}</span>
          {!maxed && <span className="tl-next-lvl">Lv {lvl + 1}</span>}
        </div>
        <div className="tl-next-xp">{maxed ? 'Mythic tier reached' : `${formatXP(toNext)} XP to go`}</div>
        <div className="tl-next-bar">
          <div className="tl-next-fill" style={{ width: `${(maxed ? 1 : pct) * 100}%` }} />
        </div>
      </div>
      <div className="timeline">
        <div className="timeline-track" />
        <div className="timeline-fill" style={{ width: `${(pct / segments) * 100}%` }} />
        {nodes}
      </div>
    </>
  );
}
