import { Icon } from '../Icon';
import { CharacterStage } from '../character/CharacterStage';
import { useAppStore } from '../../store/useAppStore';
import { nextUnlock, tierFor } from '../../lib/character';
import { levelCeil, levelFloor } from '../../lib/xp';

export function Arena() {
  const progress = useAppStore((s) => s.progress);
  const coins = useAppStore((s) => s.coins);
  const openCharacterStudio = useAppStore((s) => s.openCharacterStudio);

  const lvl = progress.level;
  const t = tierFor(lvl);
  const floor = levelFloor(lvl);
  const ceil = levelCeil(lvl);
  const pct = Math.max(0, Math.min(1, (progress.totalXP - floor) / (ceil - floor)));
  const nu = nextUnlock({ level: lvl, longestStreak: progress.longestStreak, prestige: progress.prestige });

  return (
    <div
      className="stage3d arena"
      style={{ ['--t1' as string]: t.c1, ['--t2' as string]: t.c2 }}
    >
      <CharacterStage view="arena" anim="run" />
      <div className="arena-top">
        <div className="hud-chip mono">
          <Icon name="coin" /> {coins.toLocaleString()}
        </div>
        <button className="hud-chip hud-btn" onClick={openCharacterStudio}>
          <Icon name="profile" /> Customise
        </button>
      </div>
      <div className="arena-foot">
        <div className="af-row">
          <span>
            Level {lvl} · {t.name} ·{' '}
            <span className="af-streak">
              <Icon name="flame" /> {progress.currentStreak}d
            </span>
          </span>
          <span className="mono">
            {(progress.totalXP - floor).toLocaleString()} / {(ceil - floor).toLocaleString()} XP
          </span>
        </div>
        <div className="progress-track">
          <div className="progress-fill" style={{ width: `${Math.round(pct * 100)}%` }} />
        </div>
        <div className="af-sub">
          {Math.max(0, ceil - progress.totalXP).toLocaleString()} XP to Level {lvl + 1}
          {nu ? ` · ${nu.item.name} unlocks at ${nu.level}` : ''}
        </div>
      </div>
    </div>
  );
}
