import { useRef, useState } from 'react';
import { Icon } from '../Icon';
import { CharacterStage } from './CharacterStage';
import { CharacterThumbnail } from './CharacterThumbnail';
import { useAppStore } from '../../store/useAppStore';
import { BODY_BUILDS, CATALOG, HAIR_COLORS, SKIN_TONES } from '../../data/catalog';
import { isUnlocked, nextUnlock, tierFor, unlockLabel } from '../../lib/character';
import { levelCeil, levelFloor } from '../../lib/xp';
import type { CatalogItem, CatalogKey, HairItem, StudioCat } from '../../types';

const STUDIO_CATS: { id: StudioCat; label: string }[] = [
  { id: 'base', label: 'Base' },
  { id: 'build', label: 'Build' },
  { id: 'skin', label: 'Complexion' },
  { id: 'hair', label: 'Hair' },
  { id: 'hairColor', label: 'Hair Color' },
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
  const [stageMode, setStageMode] = useState<'collapsed' | 'normal' | 'full'>('normal');
  const dragStartY = useRef<number | null>(null);
  const dragDist = useRef(0);

  // Swiping the handle bar steps through collapsed/normal/full same as the
  // arrow buttons - swipe up to shrink the stage and reveal more of the
  // customisation panel, swipe down to bring the stage back.
  function handleDragStart(e: React.PointerEvent) {
    dragStartY.current = e.clientY;
    dragDist.current = 0;
    e.currentTarget.setPointerCapture(e.pointerId);
  }
  function handleDragMove(e: React.PointerEvent) {
    if (dragStartY.current === null) return;
    dragDist.current = e.clientY - dragStartY.current;
  }
  function handleDragEnd() {
    if (dragStartY.current === null) return;
    const dy = dragDist.current;
    const SWIPE_THRESHOLD = 28;
    if (dy < -SWIPE_THRESHOLD) {
      setStageMode((m) => (m === 'full' ? 'normal' : 'collapsed'));
    } else if (dy > SWIPE_THRESHOLD) {
      setStageMode((m) => (m === 'collapsed' ? 'normal' : 'full'));
    }
    dragStartY.current = null;
    dragDist.current = 0;
  }

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
            locked={!isUnlocked(b, ctx)}
            art={<CharacterThumbnail cfg={{ ...character, build: b.id }} mode="full" />}
            name={b.name}
            lockText={unlockLabel(b)}
            onClick={() => handleWardrobeClick('build', b)}
          />
        ))}
      </>
    );
  } else if (studioCat === 'skin') {
    rail = (
      <>
        {SKIN_TONES.map((_, i) => (
          <Tile
            key={i}
            sel={character.skin === i}
            locked={false}
            art={<CharacterThumbnail cfg={{ ...character, outfit: 'none', skin: i }} mode="full" />}
            name={['Light', 'Medium', 'Dark'][i]}
            lockText=""
            onClick={() => updateCharacterField('skin', i)}
          />
        ))}
      </>
    );
  } else if (studioCat === 'hairColor') {
    // Color has nothing to show without a hair style equipped - preview
    // against a sensible default for the current base rather than 'None'.
    const previewHair = character.hair !== 'none' ? character.hair : character.base === 'male' ? 'buzzed' : 'buzzedFemale';
    rail = (
      <>
        {HAIR_COLORS.map((c, i) => (
          <Tile
            key={c.name}
            sel={character.hairColor === i}
            locked={false}
            art={<CharacterThumbnail cfg={{ ...character, hair: previewHair, hairColor: i }} mode="portrait" />}
            name={c.name}
            lockText=""
            onClick={() => updateCharacterField('hairColor', i)}
          />
        ))}
      </>
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
          // Isolate the preview to the dimension being browsed - don't also
          // recomposite whatever hair/outfit happens to be equipped, which
          // would multiply texture loads across every tile in the list.
          const isolated = studioCat === 'hair' ? { ...character, outfit: 'none' } : { ...character, hair: 'none' };
          const cfg = { ...isolated, [studioCat]: it.id };
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
    <div className={`studio${stageMode !== 'normal' ? ` stage-${stageMode}` : ''}`}>
      <div
        className="stage-controls-bar"
        onPointerDown={handleDragStart}
        onPointerMove={handleDragMove}
        onPointerUp={handleDragEnd}
        onPointerCancel={handleDragEnd}
      >
        <button
          className="stage-toggle-btn collapse"
          aria-label={stageMode === 'collapsed' ? 'Restore character view' : 'Collapse character view to browse'}
          onClick={() => setStageMode((m) => (m === 'collapsed' ? 'normal' : 'collapsed'))}
        >
          <Icon name="chevron" />
        </button>
        <span className="stage-controls-label">
          {stageMode === 'collapsed' ? 'Customising' : stageMode === 'full' ? 'Viewing' : 'Character'}
        </span>
        <button
          className="stage-toggle-btn expand"
          aria-label={stageMode === 'full' ? 'Restore character view' : 'Expand character view to almost full screen'}
          onClick={() => setStageMode((m) => (m === 'full' ? 'normal' : 'full'))}
        >
          <Icon name="chevron" />
        </button>
        <div className="stage-handle-grip" aria-hidden="true" />
      </div>
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
      <div className="item-rail">{rail}</div>
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
