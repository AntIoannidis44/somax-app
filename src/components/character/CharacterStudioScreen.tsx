import { useRef, useState } from 'react';
import { Icon } from '../Icon';
import { CharacterStage } from './CharacterStage';
import { CharacterThumbnail } from './CharacterThumbnail';
import { useAppStore } from '../../store/useAppStore';
import { BODY_BUILDS, CATALOG, GYM_COLORS, GYM_BOTTOMS, GYM_SHOES, GYM_TOPS, HAIR_COLORS, OUTFITS, OUTFIT_COLORS, SKIN_TONES } from '../../data/catalog';
import { countUnlocked, isUnlocked, lockHint, nextUnlock, tierFor, unlockLabel } from '../../lib/character';
import { levelCeil, levelFloor } from '../../lib/xp';
import type { IconName } from '../../data/icons';
import type { CatalogItem, CharacterBase, CharacterConfig, HairItem, StudioCat } from '../../types';

type Tab = 'base' | 'build' | 'skin' | 'hair' | 'attire';
type AttireSub = 'outfit' | 'top' | 'bottom' | 'shoes';
type GymSlot = 'top' | 'bottom' | 'shoes';

const TABS: { id: Tab; label: string; icon: IconName }[] = [
  { id: 'base', label: 'Base', icon: 'profile' },
  { id: 'build', label: 'Build', icon: 'dumbbell' },
  { id: 'skin', label: 'Complexion', icon: 'droplet' },
  { id: 'hair', label: 'Hair', icon: 'hairstyle' },
  { id: 'attire', label: 'Attire', icon: 'attire' },
];
const ATTIRE_SUBS: { id: AttireSub; label: string }[] = [
  { id: 'outfit', label: 'Outfits' },
  { id: 'top', label: 'Tops' },
  { id: 'bottom', label: 'Bottoms' },
  { id: 'shoes', label: 'Shoes' },
];
const BASE_LABEL: Record<CharacterBase, string> = { male: 'Masculine', female: 'Feminine' };
const GYM_LISTS: Record<GymSlot, CatalogItem[]> = { top: GYM_TOPS, bottom: GYM_BOTTOMS, shoes: GYM_SHOES };
const COLOR_KEY = { top: 'topColor', bottom: 'bottomColor', shoes: 'shoesColor' } as const;

// The stage is pinned above the list and shrinks from SH_MAX to SH_MIN as
// the list scrolls. It floats over the list (which reserves SH_MAX at the
// top), so the list's size never depends on the stage - no scroll feedback.
const SH_MAX = 330;
const SH_MIN = 150;

// studioCat (persisted) -> which tab / sub-tab to reopen on.
function tabFor(cat: StudioCat): Tab {
  if (cat === 'base' || cat === 'build' || cat === 'skin') return cat;
  if (cat === 'hair' || cat === 'hairColor') return 'hair';
  return 'attire';
}
function attireFor(cat: StudioCat): AttireSub {
  if (cat.startsWith('top')) return 'top';
  if (cat.startsWith('bottom')) return 'bottom';
  if (cat.startsWith('shoes')) return 'shoes';
  return 'outfit';
}

function Tile({ sel, item, art, name, onPick, wide }: { sel: boolean; item?: CatalogItem; art: React.ReactNode; name: string; onPick: () => void; wide?: boolean }) {
  const locked = !!item && item.unlock !== undefined && !isUnlocked(item, CTX_REF.current);
  return (
    <button className={`st2-tile${sel ? ' on' : ''}${locked ? ' lock' : ''}${wide ? ' wide' : ''}`} onClick={onPick}>
      <div className="st2-art">
        {art}
        {locked && (
          <div className="st2-lockcap">
            <Icon name="lock" />
            <span>{unlockLabel(item!)}</span>
          </div>
        )}
      </div>
      {sel && (
        <span className="st2-on">
          <Icon name="check" />
        </span>
      )}
      <div className="st2-nm">{name}</div>
    </button>
  );
}

// Tiles read the unlock context without threading it through every call.
const CTX_REF: { current: { level: number; longestStreak: number; prestige?: number } } = { current: { level: 1, longestStreak: 0 } };

function Swatches({
  items,
  current,
  onPick,
  originalHex,
}: {
  items: (CatalogItem & { hex: string })[];
  current: number;
  onPick: (i: number, item: CatalogItem) => void;
  originalHex?: string;
}) {
  return (
    <div className="st2-swgrid">
      {items.map((c, i) => {
        const locked = !isUnlocked(c, CTX_REF.current);
        const hex = c.hex || originalHex;
        return (
          <button
            key={c.id}
            className={`st2-sw${current === i ? ' on' : ''}${locked ? ' lock' : ''}${!hex ? ' orig' : ''}`}
            style={hex ? { background: hex } : undefined}
            title={c.name}
            aria-label={c.name}
            onClick={() => onPick(i, c)}
          >
            {locked ? (
              <span className="st2-swlk">
                <Icon name="lock" />
              </span>
            ) : (
              current === i && (
                <span className="st2-swck">
                  <Icon name="check" />
                </span>
              )
            )}
          </button>
        );
      })}
    </div>
  );
}

export function CharacterStudioScreen() {
  const character = useAppStore((s) => s.character)!;
  const progress = useAppStore((s) => s.progress);
  const savedCat = useAppStore((s) => s.studioCat);
  const setStudioCat = useAppStore((s) => s.setStudioCat);
  const updateCharacterField = useAppStore((s) => s.updateCharacterField);
  const showToast = useAppStore((s) => s.showToast);

  const [tab, setTab] = useState<Tab>(() => tabFor(savedCat));
  const [attireSub, setAttireSub] = useState<AttireSub>(() => attireFor(savedCat));
  const [view, setView] = useState<'body' | 'face'>('body');
  const [stageH, setStageH] = useState(SH_MAX);
  const listRef = useRef<HTMLDivElement>(null);
  // A new tab starts at the top with the full stage.
  function toTop() {
    if (listRef.current) listRef.current.scrollTop = 0;
    setStageH(SH_MAX);
  }

  const ctx = { level: progress.level, longestStreak: progress.longestStreak, prestige: progress.prestige };
  CTX_REF.current = ctx;
  const t = tierFor(progress.level);
  const cu = countUnlocked(ctx);
  const nu = nextUnlock(ctx);
  const floor = levelFloor(progress.level);
  const ceil = levelCeil(progress.level);
  const lvlPct = Math.max(0, Math.min(1, (progress.totalXP - floor) / (ceil - floor)));
  const scale = 0.5 + (0.5 * (stageH - SH_MIN)) / (SH_MAX - SH_MIN);
  const compact = stageH < 230;

  function goTab(next: Tab) {
    toTop();
    setTab(next);
    setStudioCat(next === 'attire' ? attireSub : next);
  }
  function goAttire(next: AttireSub) {
    toTop();
    setAttireSub(next);
    setStudioCat(next);
  }

  // Locked items explain themselves instead of doing nothing.
  function guard(item: CatalogItem | undefined, apply: () => void) {
    if (item && !isUnlocked(item, ctx)) {
      showToast(lockHint(item));
      return;
    }
    apply();
  }

  // Gym wear is worn with the Default outfit, so choosing a piece takes a fantasy outfit off.
  function pickGym(slot: GymSlot, item: CatalogItem) {
    guard(item, () => {
      updateCharacterField(slot, item.id);
      if (item.id !== 'none' && character.outfit !== 'none') {
        updateCharacterField('outfit', 'none');
        showToast('Outfit off - wearing gym wear');
      }
    });
  }

  function shuffle() {
    const pick = <T extends CatalogItem>(list: T[]) => {
      const ok = list.map((x, i) => [x, i] as const).filter(([x]) => isUnlocked(x, ctx));
      return ok[Math.floor(Math.random() * ok.length)];
    };
    const forBase = (list: HairItem[]) => list.filter((h) => !h.base || h.base === character.base);
    updateCharacterField('skin', pick(SKIN_TONES)[1]);
    updateCharacterField('hair', pick(forBase(CATALOG.hair as HairItem[]))[0].id);
    updateCharacterField('hairColor', pick(HAIR_COLORS)[1]);
    if (Math.random() < 0.4) {
      updateCharacterField('outfit', pick(OUTFITS)[0].id);
      updateCharacterField('outfitColor', pick(OUTFIT_COLORS)[1]);
    } else {
      updateCharacterField('outfit', 'none');
      (['top', 'bottom', 'shoes'] as GymSlot[]).forEach((slot) => {
        const list = slot === 'shoes' ? GYM_SHOES : forBase(GYM_LISTS[slot] as HairItem[]);
        updateCharacterField(slot, pick(list.filter((x) => x.id !== 'none'))[0].id);
        updateCharacterField(COLOR_KEY[slot], pick(GYM_COLORS)[1]);
      });
    }
    showToast('Shuffled');
  }

  const wearingOutfit = character.outfit !== 'none';
  const outfitItem = OUTFITS.find((o) => o.id === character.outfit);

  // Summary of what's on: the fantasy outfit, or each gym piece.
  const look = (
    <div className="st2-look">
      <Icon name="layers" />
      <div style={{ minWidth: 0 }}>
        <div className="k">{wearingOutfit ? 'Wearing a full outfit' : 'Wearing gym wear'}</div>
        <div className="pieces">
          {wearingOutfit ? (
            <span className="piece">
              <i style={{ background: OUTFIT_COLORS[character.outfitColor]?.hex }} />
              {outfitItem?.name} · {OUTFIT_COLORS[character.outfitColor]?.name}
            </span>
          ) : (
            (['top', 'bottom', 'shoes'] as GymSlot[]).map((slot) => {
              const id = character[slot] ?? 'none';
              const it = GYM_LISTS[slot].find((x) => x.id === id);
              const col = GYM_COLORS[character[COLOR_KEY[slot]] ?? 0];
              return (
                <span className="piece" key={slot}>
                  {id !== 'none' && <i className={col?.hex ? '' : 'orig'} style={col?.hex ? { background: col.hex } : undefined} />}
                  {id === 'none' ? (slot === 'shoes' ? 'Barefoot' : `No ${slot}`) : it?.name}
                </span>
              );
            })
          )}
        </div>
      </div>
    </div>
  );

  function content() {
    if (tab === 'base') {
      return (
        <>
          <div className="st2-sec">
            <b>Base</b>
            <span>Sets the body and hair styles</span>
          </div>
          <div className="st2-tiles two">
            {(['male', 'female'] as CharacterBase[]).map((b) => (
              <Tile
                key={b}
                sel={character.base === b}
                name={BASE_LABEL[b]}
                art={<CharacterThumbnail cfg={{ ...character, base: b }} mode="full" />}
                onPick={() => updateCharacterField('base', b)}
              />
            ))}
          </div>
        </>
      );
    }
    if (tab === 'build') {
      return (
        <>
          <div className="st2-sec">
            <b>Build</b>
            <span>Outfits refit to every build</span>
          </div>
          <div className="st2-tiles">
            {BODY_BUILDS.map((b) => (
              <Tile
                key={b.id}
                item={b}
                sel={character.build === b.id}
                name={b.name}
                art={<CharacterThumbnail cfg={{ ...character, build: b.id, hair: 'none' }} mode="full" />}
                onPick={() => guard(b, () => updateCharacterField('build', b.id))}
              />
            ))}
          </div>
        </>
      );
    }
    if (tab === 'skin') {
      return (
        <>
          <div className="st2-sec">
            <b>Complexion</b>
            <span>{SKIN_TONES[character.skin]?.name}</span>
          </div>
          <div className="st2-tiles">
            {SKIN_TONES.map((s, i) => (
              <Tile
                key={s.id}
                item={s}
                sel={character.skin === i}
                name={s.name}
                art={<CharacterThumbnail cfg={{ ...character, outfit: 'none', skin: i }} mode="portrait" />}
                onPick={() => guard(s, () => updateCharacterField('skin', i))}
              />
            ))}
          </div>
        </>
      );
    }
    if (tab === 'hair') {
      const styles = (CATALOG.hair as HairItem[]).filter((h) => !h.base || h.base === character.base);
      return (
        <>
          <div className="st2-colours">
            <div className="st2-colours-h">
              <b>Hair colour</b>
              <span>{HAIR_COLORS[character.hairColor]?.name}</span>
            </div>
            <Swatches items={HAIR_COLORS} current={character.hairColor} onPick={(i, c) => guard(c, () => updateCharacterField('hairColor', i))} />
          </div>
          <div className="st2-tiles">
            {styles.map((h) => (
              <Tile
                key={h.id}
                item={h}
                sel={character.hair === h.id}
                name={h.name}
                art={<CharacterThumbnail cfg={{ ...character, outfit: 'none', hair: h.id }} mode="head" />}
                onPick={() => guard(h, () => updateCharacterField('hair', h.id))}
              />
            ))}
          </div>
        </>
      );
    }

    // Attire
    if (attireSub === 'outfit') {
      return (
        <>
          {look}
          <div className="st2-hint">
            <Icon name="info" />
            <span>A full outfit replaces your gym wear. Pick any top, bottom or shoes to switch back.</span>
          </div>
          {wearingOutfit && (
            <div className="st2-colours">
              <div className="st2-colours-h">
                <b>Outfit colour</b>
                <span>{OUTFIT_COLORS[character.outfitColor]?.name}</span>
              </div>
              <Swatches items={OUTFIT_COLORS} current={character.outfitColor} onPick={(i, c) => guard(c, () => updateCharacterField('outfitColor', i))} />
            </div>
          )}
          <div className="st2-tiles">
            {OUTFITS.map((o) => (
              <Tile
                key={o.id}
                item={o}
                sel={character.outfit === o.id}
                name={o.id === 'none' ? 'Gym wear' : o.name}
                art={<CharacterThumbnail cfg={{ ...character, hair: 'none', outfit: o.id, outfitColor: 0 }} mode="full" />}
                onPick={() => guard(o, () => updateCharacterField('outfit', o.id))}
              />
            ))}
          </div>
        </>
      );
    }

    const slot = attireSub;
    const colorKey = COLOR_KEY[slot];
    const list = slot === 'shoes' ? GYM_SHOES : (GYM_LISTS[slot] as HairItem[]).filter((it) => !it.base || it.base === character.base);
    const equipped = character[slot] ?? 'none';
    const label = slot === 'top' ? 'Top' : slot === 'bottom' ? 'Bottoms' : 'Shoes';
    // Gym wear previews on the Default outfit (it's only worn with it), with
    // hair off so every tile isn't also reloading hair textures.
    const base: CharacterConfig = { ...character, hair: 'none', outfit: 'none' };
    const close = slot === 'top' ? 'torso' : slot === 'bottom' ? 'legs' : 'feet';
    return (
      <>
        {wearingOutfit && (
          <div className="st2-hint warn">
            <Icon name="info" />
            <span>
              You're wearing <b>{outfitItem?.name}</b>. Picking {slot === 'shoes' ? 'shoes' : `a ${slot === 'top' ? 'top' : 'bottom'}`} switches you to gym wear.
            </span>
          </div>
        )}
        {equipped !== 'none' && !wearingOutfit && (
          <div className="st2-colours">
            <div className="st2-colours-h">
              <b>{label} colour</b>
              <span>{GYM_COLORS[character[colorKey] ?? 0]?.name}</span>
            </div>
            <Swatches items={GYM_COLORS} current={character[colorKey] ?? 0} onPick={(i, c) => guard(c, () => updateCharacterField(colorKey, i))} />
          </div>
        )}
        <div className="st2-tiles">
          {list.map((it) => (
            <Tile
              key={it.id}
              item={it}
              sel={!wearingOutfit && equipped === it.id}
              name={it.name}
              art={<CharacterThumbnail cfg={{ ...base, [slot]: it.id }} mode={close} />}
              onPick={() => pickGym(slot, it)}
            />
          ))}
        </div>
      </>
    );
  }

  const gymCount = (slot: GymSlot) =>
    (slot === 'shoes' ? GYM_SHOES : (GYM_LISTS[slot] as HairItem[]).filter((it) => !it.base || it.base === character.base)).filter((x) => x.id !== 'none').length;

  return (
    <div className="studio2">
      <div
        className={`st2-stage${compact ? ' compact' : ''}`}
        style={{ height: stageH, ['--t1' as string]: t.c1, ['--t2' as string]: t.c2 }}
      >
        <div className="st2-canvas" style={{ ['--s' as string]: scale }}>
          <CharacterStage view="studio" anim="idle" focus={view} />
        </div>
        <div className="st2-stage-top">
          <span className="hud-chip">
            <span className="hud-lvl">{progress.level}</span>
            {t.name}
          </span>
          <span className="hud-chip mono st2-hide-compact">
            {cu.done}/{cu.total}
          </span>
        </div>
        <div className="st2-stage-ctl">
          <span className="st2-drag st2-hide-compact">
            <Icon name="rotate" /> Drag to spin
          </span>
          <div className="st2-viewseg st2-hide-compact">
            <button className={view === 'body' ? 'on' : ''} onClick={() => setView('body')}>
              Body
            </button>
            <button className={view === 'face' ? 'on' : ''} onClick={() => setView('face')}>
              Face
            </button>
          </div>
          <button className="st2-ctl" onClick={shuffle} aria-label="Shuffle unlocked items">
            <Icon name="shuffle" />
          </button>
        </div>
      </div>

      <div className="st2-list" ref={listRef} onScroll={(e) => setStageH(Math.max(SH_MIN, SH_MAX - e.currentTarget.scrollTop))}>
        <div style={{ height: SH_MAX }} aria-hidden="true" />
        <div className="st2-cats" style={{ top: stageH }}>
          <div className="st2-catrow">
            {TABS.map((tb) => (
              <button key={tb.id} className={`st2-cat${tab === tb.id ? ' on' : ''}`} onClick={() => goTab(tb.id)}>
                <Icon name={tb.icon} />
                {tb.label}
              </button>
            ))}
          </div>
          {tab === 'attire' && (
            <div className="st2-subrow four">
              {ATTIRE_SUBS.map((s) => {
                const n = s.id === 'outfit' ? OUTFITS.length - 1 : gymCount(s.id);
                const worn = s.id === 'outfit' ? wearingOutfit : !wearingOutfit && (character[s.id] ?? 'none') !== 'none';
                return (
                  <button key={s.id} className={`st2-sub${attireSub === s.id ? ' on' : ''}`} onClick={() => goAttire(s.id)}>
                    {s.label}
                    <span className="ct">{n}</span>
                    {worn && <span className="dot" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>
        <div className="st2-content">
          {content()}
          {nu && (
            <div className="st2-unlock">
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="t">
                  Next unlock: {nu.item.name}
                </div>
                <div className="s">
                  Reach level {nu.level} · {Math.max(0, levelFloor(nu.level) - progress.totalXP).toLocaleString()} XP to go
                </div>
                <div className="bar">
                  <i style={{ width: `${Math.round((nu.level === progress.level + 1 ? lvlPct : Math.min(1, progress.totalXP / levelFloor(nu.level))) * 100)}%` }} />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
