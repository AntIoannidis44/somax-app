import { Icon } from '../Icon';
import { CharacterStage } from './CharacterStage';
import { CharacterThumbnail } from './CharacterThumbnail';
import { useAppStore } from '../../store/useAppStore';
import { BODY_BUILDS, CATALOG, SKIN_TONES } from '../../data/catalog';
import { isUnlocked, nextUnlock, tierFor, unlockLabel } from '../../lib/character';
import { levelCeil, levelFloor } from '../../lib/xp';
import type { CatalogItem, CatalogKey, HairItem, StudioCat } from '../../types';

const STUDIO_CATS: { id: StudioCat; label: string }[] = [
  { id: 'base', label: 'Base' },
  { id: 'build', label: 'Build' },
  { id: 'skin', label: 'Skin' },
  { id: 'hair', label: 'Hair' },
  { id: 'outfit', label: 'Outfit' },
];

function Tile({
  sel,
  locked,
  art,
  name,
  lockText,
  onClick,
}: {
  sel: boolean;
  locked: boolean;
  art: React.ReactNode;
  name: string;
  lockText: string;
  onClick: () => void;
}) {
  return (
    <div className={`item-tile${sel ? ' sel' : ''}${locked ? ' locked' : ''}`} onClick={onClick}>
      <div className="item-art">
        {art}
        {locked && (
          <div className="item-lock">
            <Icon name="lock" />
            <span>{lockText}</span>
          </div>
        )}
      </div>
      <div className="item-name">{name}</div>
    </div>
  );
}

export function CharacterStudioScreen() {
  const character = useAppStore((s) => s.character)!;
  const progress = useAppStore((s) => s.progress);
  const studioCat = useAppStore((s) => s.studioCat);
  const setStudioCat = useAppStore((s) => s.setStudioCat);
  const updateCharacterField = useAppStore((s) => s.updateCharacterField);
  const showToast = useAppStore((s) => s.showToast);

  const lvl = progress.level;
  const t = tierFor(lvl);
  const ctx = { level: progress.level, longestStreak: progress.longestStreak };

  function handleWardrobeClick(key: CatalogKey, item: CatalogItem) {
    if (!isUnlocked(item, ctx)) {
      showToast(
        item.unlock?.level
          ? `Reach Level ${item.unlock.level} to unlock ${item.name}`
          : `Hit a ${item.unlock?.streak}-day streak to unlock ${item.name}`,
      );
      return;
    }
    updateCharacterField(key, item.id);
  }

  let rail: React.ReactNode;
  if (studioCat === 'base') {
    rail = (
      <>
        {(['female', 'male'] as const).map((b) => (
          <Tile
            key={b}
            sel={character.base === b}
            locked={false}
            art={<CharacterThumbnail cfg={{ ...character, base: b }} mode="full" />}
            name={b === 'female' ? 'Female' : 'Male'}
            lockText=""
            onClick={() => updateCharacterField('base', b)}
          />
        ))}
      </>
    );
  } else if (studioCat === 'build') {
    rail = (
      <>
        {BODY_BUILDS.map((b) => (
          <Tile
            key={b.id}
            sel={character.build === b.id}
            locked={false}
            art={<CharacterThumbnail cfg={{ ...character, build: b.id }} mode="full" />}
            name={b.name}
            lockText=""
            onClick={() => updateCharacterField('build', b.id)}
          />
        ))}
      </>
    );
  } else if (studioCat === 'skin') {
    rail = (
      <div className="swatch-row big">
        {SKIN_TONES.map((col, i) => (
          <button
            key={col}
            className={`swatch${character.skin === i ? ' sel' : ''}`}
            style={{ background: col }}
            aria-label={`Skin tone ${i + 1}`}
            onClick={() => updateCharacterField('skin', i)}
          />
        ))}
      </div>
    );
  } else {
    const list =
      studioCat === 'hair'
        ? (CATALOG.hair as HairItem[]).filter((it) => !it.base || it.base === character.base)
        : CATALOG[studioCat];
    const mode = studioCat === 'hair' ? 'portrait' : 'full';
    rail = (
      <>
        {list.map((it) => {
          const cfg = { ...character, [studioCat]: it.id };
          const locked = !isUnlocked(it, ctx);
          return (
            <Tile
              key={it.id}
              sel={character[studioCat] === it.id}
              locked={locked}
              art={<CharacterThumbnail cfg={cfg} mode={mode} />}
              name={it.name}
              lockText={unlockLabel(it)}
              onClick={() => handleWardrobeClick(studioCat, it)}
            />
          );
        })}
      </>
    );
  }

  const nu = nextUnlock(ctx);
  const floor = levelFloor(lvl);
  const ceil = levelCeil(lvl);
  const pct = Math.min(1, (progress.totalXP - floor) / (ceil - floor));

  return (
    <div className="studio">
      <div className="stage3d" style={{ ['--t1' as string]: t.c1, ['--t2' as string]: t.c2 }}>
        <div className="stage-hud">
          <div className="hud-chip">
            <span className="hud-lvl">{lvl}</span>
            {t.name}
          </div>
          <div className="hud-chip mono">{progress.totalXP.toLocaleString()} XP</div>
        </div>
        <CharacterStage view="studio" anim="idle" />
        <div className="stage-hint">
          <Icon name="rotate" /> Drag to spin · tap to flex
        </div>
      </div>
      <div className="cat-rail">
        {STUDIO_CATS.map((k) => (
          <button
            key={k.id}
            className={`cat-chip${studioCat === k.id ? ' active' : ''}`}
            onClick={() => setStudioCat(k.id)}
          >
            {k.label}
          </button>
        ))}
      </div>
      <div className={`item-rail${studioCat === 'skin' ? ' is-swatches' : ''}`}>{rail}</div>
      {nu ? (
        <div className="unlock-strip">
          <div className="us-head">
            <span>
              Next unlock · <b>{nu.item.name}</b>
            </span>
            <span className="mono">Lv {nu.level}</span>
          </div>
          <div className="progress-track" style={{ height: 6, marginTop: 8 }}>
            <div className="progress-fill" style={{ width: `${Math.round(pct * 100)}%` }} />
          </div>
          <div className="us-sub">{nu.level - lvl === 1 ? 'Reach the next level to unlock it' : `${nu.level - lvl} levels away — keep training`}</div>
        </div>
      ) : (
        <div className="unlock-strip">
          <div className="us-head">
            <span>
              <b>Full wardrobe unlocked</b>
            </span>
          </div>
          <div className="us-sub">You’ve earned every item in this beta.</div>
        </div>
      )}
    </div>
  );
}
