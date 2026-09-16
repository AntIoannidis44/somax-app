import { Icon } from '../Icon';
import { CHAR_TIERS } from '../../data/catalog';
import { useAppStore } from '../../store/useAppStore';
import { tierFor } from '../../lib/character';
import { levelCeil, levelFloor } from '../../lib/xp';

export function LevelPath() {
  const progress = useAppStore((s) => s.progress);
  const lvl = progress.level;
  const xp = progress.totalXP;
  const start = Math.max(1, lvl - 1);
  const rows = [];
  for (let L = start; L < start + 5; L++) {
    const floor = levelFloor(L);
    const ceil = levelCeil(L);
    const t = tierFor(L);
    const stateCls = L < lvl ? 'done' : L === lvl ? 'current' : 'locked';
    const isTierStart = L === CHAR_TIERS[1].min || L === CHAR_TIERS[2].min || L === CHAR_TIERS[3].min;
    const sub =
      L === lvl
        ? `${xp - floor} / ${ceil - floor} XP`
        : L < lvl
          ? 'Cleared'
          : `${floor.toLocaleString()} XP · ${t.name}`;
    rows.push(
      <div className={`rung ${stateCls}`} key={L}>
        <div className="rung-num">{L}</div>
        <div className="rung-main">
          <div className="rung-title">
            Level {L}
            {isTierStart ? ` · ${t.name} tier` : ''}
          </div>
          <div className="rung-sub">{sub}</div>
        </div>
        <div className="rung-state">
          {L < lvl ? (
            <>
              <Icon name="check" /> Done
            </>
          ) : L === lvl ? (
            'Current'
          ) : (
            <>
              <Icon name="lock" /> Locked
            </>
          )}
        </div>
      </div>,
    );
  }
  return <div className="ladder">{rows}</div>;
}
