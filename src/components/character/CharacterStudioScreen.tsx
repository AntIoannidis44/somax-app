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
  // Stage height is a free-running px value the user can drag to any point
  // between fully collapsed (0) and the max the screen has room for - not
  // just three fixed stops. NORMAL_H is only the starting point.
  const NORMAL_H = 320;
  const NEAR_EDGE = 16;
  const stageRef = useRef<HTMLDivElement>(null);
  const [stageH, setStageH] = useState(NORMAL_H);
  const [dragging, setDragging] = useState(false);
  const maxHRef = useRef(640);
  // A small deadzone before a pointerdown on the bar counts as a drag,
  // so a finger that jitters a couple px while resting on the bar (or a
  // tap that's about to be handled by the separate full-screen button,
  // see below) never produces a phantom resize.
  const DEADZONE = 6;
  const dragStartY = useRef<number | null>(null);
  const dragStartH = useRef(0);
  const dragActive = useRef(false);

  // The stage may only grow until the handle bar (fixed height, see
  // --controls-h) would be pushed under the tab bar - measured live so it
  // adapts to any viewport instead of a hardcoded guess.
  function computeMaxH(): number {
    const tabbar = document.querySelector('.tabbar');
    const stageTop = stageRef.current?.getBoundingClientRect().top;
    if (!tabbar || stageTop === undefined) return maxHRef.current;
    const CONTROLS_H = 52;
    return Math.max(160, tabbar.getBoundingClientRect().top - stageTop - CONTROLS_H - 8);
  }

  function handleDragStart(e: React.PointerEvent) {
    dragStartY.current = e.clientY;
    dragStartH.current = stageH;
    dragActive.current = false;
  }
  function handleDragMove(e: React.PointerEvent) {
    if (dragStartY.current === null) return;
    const dy = e.clientY - dragStartY.current;
    if (!dragActive.current) {
      if (Math.abs(dy) < DEADZONE) return;
      dragActive.current = true;
      maxHRef.current = computeMaxH();
      setDragging(true);
      e.currentTarget.setPointerCapture(e.pointerId);
    }
    setStageH(Math.max(0, Math.min(maxHRef.current, dragStartH.current + dy)));
  }
  function handleDragEnd() {
    dragStartY.current = null;
    dragActive.current = false;
    setDragging(false);
  }
  function jumpToFullScreen() {
    maxHRef.current = computeMaxH();
    setStageH((h) => (h >= maxHRef.current - NEAR_EDGE ? NORMAL_H : maxHRef.current));
  }
  const isCollapsed = stageH <= NEAR_EDGE;
  const isFull = stageH >= maxHRef.current - NEAR_EDGE;

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
    <div
      className={`studio${isCollapsed ? ' stage-collapsed' : ''}${isFull ? ' stage-full' : ''}`}
      style={{ ['--stage-h' as string]: `${stageH}px` }}
    >
      <div
        ref={stageRef}
        className="stage3d"
        style={{ ['--t1' as string]: t.c1, ['--t2' as string]: t.c2, transition: dragging ? 'none' : undefined }}
      >
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
      <div
        className="stage-controls-bar"
        onPointerDown={handleDragStart}
        onPointerMove={handleDragMove}
        onPointerUp={handleDragEnd}
        onPointerCancel={handleDragEnd}
      >
        <div className="stage-handle-grip" aria-hidden="true" />
        <span className="stage-controls-label">{isCollapsed ? 'Drag down to view' : 'Drag up to customize'}</span>
        <button
          className="stage-toggle-btn expand"
          aria-label={isFull ? 'Restore character view' : 'View full screen'}
          title={isFull ? 'Restore character view' : 'View full screen'}
          // Stops the pointerdown from ever reaching the drag handlers above -
          // a plain tap can then never race with the drag logic, however it
          // lands, instead of relying on the drag side alone to tell tap and
          // drag apart.
          onPointerDown={(e) => e.stopPropagation()}
          onClick={jumpToFullScreen}
        >
          <Icon name="expand" />
        </button>
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
