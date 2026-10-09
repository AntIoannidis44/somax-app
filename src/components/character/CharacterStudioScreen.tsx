import { useRef, useState } from 'react';
import { Icon } from '../Icon';
import { CharacterStage } from './CharacterStage';
import { CharacterThumbnail } from './CharacterThumbnail';
import { useAppStore } from '../../store/useAppStore';
import { BODY_BUILDS, CATALOG, GYM_COLORS, HAIR_COLORS, OUTFIT_COLORS, SKIN_TONES } from '../../data/catalog';
import { isUnlocked, lockHint, nextUnlock, tierFor, unlockLabel } from '../../lib/character';
import { levelCeil, levelFloor } from '../../lib/xp';
import type { CatalogItem, CatalogKey, HairItem, StudioCat } from '../../types';

// Top-level tabs; a group with `subs` shows a second row underneath once
// it's the active one (e.g. Hair -> Style/Color), so color is reached as a
// sub-tab of its item rather than sitting alongside it as its own top tab.
const STUDIO_CATS: { id: StudioCat; label: string; subs?: { id: StudioCat; label: string }[] }[] = [
  { id: 'base', label: 'Base' },
  { id: 'build', label: 'Build' },
  { id: 'skin', label: 'Complexion' },
  {
    id: 'hair',
    label: 'Hair',
    subs: [
      { id: 'hair', label: 'Style' },
      { id: 'hairColor', label: 'Color' },
    ],
  },
  {
    id: 'top',
    label: 'Gym',
    subs: [
      { id: 'top', label: 'Top' },
      { id: 'topColor', label: 'Top color' },
      { id: 'bottom', label: 'Bottom' },
      { id: 'bottomColor', label: 'Bottom color' },
      { id: 'shoes', label: 'Shoes' },
      { id: 'shoesColor', label: 'Shoe color' },
    ],
  },
  {
    id: 'outfit',
    label: 'Outfit',
    subs: [
      { id: 'outfit', label: 'Style' },
      { id: 'outfitColor', label: 'Color' },
    ],
  },
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
  // A saved tab that no longer exists (e.g. from an older build) falls back to Base,
  // so the Studio still opens. Checks sub-tabs too, since hairColor/outfitColor
  // only appear nested under their parent group now, not as their own top id.
  const savedCat = useAppStore((s) => s.studioCat);
  const isValidCat = STUDIO_CATS.some((c) => c.id === savedCat || c.subs?.some((sub) => sub.id === savedCat));
  const studioCat = isValidCat ? savedCat : 'base';
  const activeGroup = STUDIO_CATS.find((c) => c.id === studioCat || c.subs?.some((sub) => sub.id === studioCat))!;
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
  const ctx = { level: progress.level, longestStreak: progress.longestStreak, prestige: progress.prestige };

  function handleWardrobeClick(key: CatalogKey, item: CatalogItem) {
    if (!isUnlocked(item, ctx)) {
      showToast(lockHint(item));
      return;
    }
    updateCharacterField(key, item.id);
    // Gym wear is worn with the Default outfit, so choosing a piece takes a fantasy outfit off.
    if ((key === 'top' || key === 'bottom' || key === 'shoes') && item.id !== 'none' && character.outfit !== 'none') {
      updateCharacterField('outfit', 'none');
    }
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
        {SKIN_TONES.map((t, i) => {
          const locked = !isUnlocked(t, ctx);
          return (
            <Tile
              key={t.name}
              sel={character.skin === i}
              locked={locked}
              art={<CharacterThumbnail cfg={{ ...character, outfit: 'none', skin: i }} mode="full" />}
              name={t.name}
              lockText={unlockLabel(t)}
              onClick={() => {
                if (locked) {
                  showToast(lockHint(t));
                  return;
                }
                updateCharacterField('skin', i);
              }}
            />
          );
        })}
      </>
    );
  } else if (studioCat === 'hairColor') {
    // Color has nothing to show without a hair style equipped - preview
    // against a sensible default for the current base rather than 'None'.
    const previewHair = character.hair !== 'none' ? character.hair : character.base === 'male' ? 'buzzed' : 'buzzedFemale';
    rail = (
      <>
        {HAIR_COLORS.map((c, i) => {
          const locked = !isUnlocked(c, ctx);
          return (
            <Tile
              key={c.name}
              sel={character.hairColor === i}
              locked={locked}
              art={<CharacterThumbnail cfg={{ ...character, hair: previewHair, hairColor: i }} mode="head" />}
              name={c.name}
              lockText={unlockLabel(c)}
              onClick={() => {
                if (locked) {
                  showToast(lockHint(c));
                  return;
                }
                updateCharacterField('hairColor', i);
              }}
            />
          );
        })}
      </>
    );
  } else if (studioCat === 'outfitColor') {
    // Nothing to tint with no outfit equipped - preview against Trainer
    // kit rather than 'none', same reasoning as the hair color fallback.
    const previewOutfit = character.outfit !== 'none' ? character.outfit : 'trainer';
    rail = (
      <>
        {OUTFIT_COLORS.map((c, i) => {
          const locked = !isUnlocked(c, ctx);
          return (
            <Tile
              key={c.name}
              sel={(character.outfitColor ?? 0) === i}
              locked={locked}
              art={<CharacterThumbnail cfg={{ ...character, outfit: previewOutfit, outfitColor: i }} mode="full" />}
              name={c.name}
              lockText={unlockLabel(c)}
              onClick={() => {
                if (locked) {
                  showToast(lockHint(c));
                  return;
                }
                updateCharacterField('outfitColor', i);
              }}
            />
          );
        })}
      </>
    );
  } else if (studioCat === 'topColor' || studioCat === 'bottomColor' || studioCat === 'shoesColor') {
    // Preview each colour on the equipped piece, or a free starter piece if none is on.
    const slot = studioCat === 'topColor' ? 'top' : studioCat === 'bottomColor' ? 'bottom' : 'shoes';
    const fallback = slot === 'shoes' ? 'trainers' : slot === 'top' ? (character.base === 'male' ? 'teeTight' : 'teeLoose') : character.base === 'male' ? 'shortsMale' : 'leggingsLong';
    const piece = character[slot] && character[slot] !== 'none' ? character[slot] : fallback;
    rail = (
      <>
        {GYM_COLORS.map((c, i) => {
          const locked = !isUnlocked(c, ctx);
          return (
            <Tile
              key={c.id}
              sel={(character[studioCat] ?? 0) === i}
              locked={locked}
              art={<CharacterThumbnail cfg={{ ...character, hair: 'none', outfit: 'none', [slot]: piece, [studioCat]: i }} mode="full" />}
              name={c.name}
              lockText={unlockLabel(c)}
              onClick={() => {
                if (locked) {
                  showToast(lockHint(c));
                  return;
                }
                updateCharacterField(studioCat, i);
              }}
            />
          );
        })}
      </>
    );
  } else {
    const perBase = studioCat === 'hair' || studioCat === 'top' || studioCat === 'bottom';
    const list = perBase
      ? (CATALOG[studioCat] as HairItem[]).filter((it) => !it.base || it.base === character.base)
      : CATALOG[studioCat];
    const isGym = studioCat === 'top' || studioCat === 'bottom' || studioCat === 'shoes';
    const mode = studioCat === 'hair' ? 'head' : 'full';
    rail = (
      <>
        {list.map((it) => {
          // Isolate the preview to the dimension being browsed - don't also
          // recomposite whatever hair/outfit happens to be equipped, which
          // would multiply texture loads across every tile in the list.
          // Gym wear previews on the Default outfit (it's only worn with it).
          const isolated = studioCat === 'hair' ? { ...character, outfit: 'none' } : isGym ? { ...character, hair: 'none', outfit: 'none' } : { ...character, hair: 'none' };
          const cfg = { ...isolated, [studioCat]: it.id };
          const locked = !isUnlocked(it, ctx);
          return (
            <Tile
              key={it.id}
              sel={(character[studioCat] ?? 'none') === it.id}
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
      <div className="studio-tabs" style={{ transition: dragging ? 'none' : undefined }}>
        <div className="cat-rail">
          {STUDIO_CATS.map((k) => {
            const active = k.id === activeGroup.id;
            return (
              <button key={k.id} className={`cat-chip${active ? ' active' : ''}`} onClick={() => setStudioCat(k.id)}>
                {k.label}
              </button>
            );
          })}
        </div>
        {activeGroup.subs && (
          <div className="sub-cat-rail">
            {activeGroup.subs.map((sub) => (
              <button
                key={sub.id}
                className={`sub-cat-chip${studioCat === sub.id ? ' active' : ''}`}
                onClick={() => setStudioCat(sub.id)}
              >
                {sub.label}
              </button>
            ))}
          </div>
        )}
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
