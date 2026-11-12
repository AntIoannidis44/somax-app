import { useEffect, useState } from 'react';
import { CharacterThumbnail } from '../character/CharacterThumbnail';
import { useAppStore } from '../../store/useAppStore';
import { allWardrobe, isUnlocked, unlockItemName } from '../../lib/character';
import { GYM_COLORS, HAIR_COLORS, OUTFIT_COLORS, SKIN_TONES } from '../../data/catalog';
import type { CatalogItem, CatalogKey, CharacterConfig } from '../../types';
import type { ThumbnailMode } from '../../lib/characterThumbnail';

const HAIR_COLOR_INDEX = new Map(HAIR_COLORS.map((c, i) => [c.id, i]));
const OUTFIT_COLOR_INDEX = new Map(OUTFIT_COLORS.map((c, i) => [c.id, i]));
const SKIN_INDEX = new Map(SKIN_TONES.map((c, i) => [c.id, i]));
const GYM_COLOR_INDEX = new Map(GYM_COLORS.map((c, i) => [c.id, i]));

// Reuses the Level Path's own track/node language (see LevelPath.tsx) so
// Home reads as one continuous timeline - what's coming, then what you'll
// look like wearing it. The real CharacterThumbnail renderer (the same 3D
// preview every Character Studio tab already uses) sits right on the node,
// in full view - no lock icon or dimming over it, since the whole point
// is to actually show the thing you're about to unlock.

// Builds the exact character config each catalog tab already previews a
// locked item with (see CharacterStudioScreen's own <Tile art={...}> calls)
// - the player's real character with just this one field swapped in, plus
// whatever the real studio tabs also clear so the swapped field reads
// cleanly (e.g. hair off while color-previewing an outfit).
function previewFor(key: CatalogKey, item: CatalogItem, character: CharacterConfig): { cfg: CharacterConfig; mode: ThumbnailMode } {
  switch (key) {
    case 'hairColor':
      return { cfg: { ...character, outfit: 'none', hairColor: HAIR_COLOR_INDEX.get(item.id) ?? character.hairColor }, mode: 'head' };
    case 'hair':
      return { cfg: { ...character, outfit: 'none', hair: item.id as CharacterConfig['hair'] }, mode: 'head' };
    case 'outfitColor':
      return { cfg: { ...character, hair: 'none', outfitColor: OUTFIT_COLOR_INDEX.get(item.id) ?? character.outfitColor }, mode: 'full' };
    case 'outfit':
      return { cfg: { ...character, hair: 'none', outfit: item.id, outfitColor: 0 }, mode: 'full' };
    case 'build':
      return { cfg: { ...character, build: item.id as CharacterConfig['build'], hair: 'none' }, mode: 'full' };
    case 'skin':
      return { cfg: { ...character, outfit: 'none', skin: SKIN_INDEX.get(item.id) ?? character.skin }, mode: 'portrait' };
    case 'acc':
      return { cfg: { ...character, hair: 'none', outfit: 'none', acc: [item.id] }, mode: item.id === 'headband' ? 'head' : 'torso' };
    // Gym wear colour applies to top/bottom/shoes together (CharacterConfig
    // has no single `gymColor` field - see types.ts), so all three colour
    // indices need setting or the preview silently shows no change at all.
    case 'gymColor': {
      const idx = GYM_COLOR_INDEX.get(item.id) ?? 0;
      return { cfg: { ...character, outfit: 'none', topColor: idx, bottomColor: idx, shoesColor: idx }, mode: 'full' };
    }
    case 'bottom':
    case 'legwear':
      return { cfg: { ...character, hair: 'none', outfit: 'none', [key]: item.id } as CharacterConfig, mode: 'legs' };
    case 'shoes':
      return { cfg: { ...character, hair: 'none', outfit: 'none', shoes: item.id }, mode: 'feet' };
    default:
      return { cfg: { ...character, hair: 'none', outfit: 'none', [key]: item.id } as CharacterConfig, mode: 'torso' };
  }
}

export function UnlocksRail() {
  const progress = useAppStore((s) => s.progress);
  const character = useAppStore((s) => s.character);
  const ctx = { level: progress.level, longestStreak: progress.longestStreak, prestige: progress.prestige };

  // Each uncached preview is a real composeCharacter + WebGL render + PNG
  // encode (see characterThumbnail.ts), and this rail can ask for up to 6
  // of them the instant Home mounts - right as Arena's own live 3D canvas
  // is also doing its heaviest first-paint work. Letting the browser report
  // idle first (bounded by a timeout, since idle callback support/timing
  // varies) keeps those two off each other's feet instead of racing.
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const ric = (window as unknown as { requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number }).requestIdleCallback;
    if (ric) {
      const id = ric(() => setReady(true), { timeout: 600 });
      return () => (window as unknown as { cancelIdleCallback?: (id: number) => void }).cancelIdleCallback?.(id);
    }
    const t = setTimeout(() => setReady(true), 300);
    return () => clearTimeout(t);
  }, []);

  if (!character) return null;

  // Only what's still coming - level-gated unlocks (streak/prestige ones
  // don't sort sensibly on a "Lv X" axis) that aren't unlocked yet, nearest
  // first. Nothing already unlocked belongs here; that's what the wardrobe
  // itself is for.
  const upcoming = allWardrobe(character.base)
    .filter((w) => w.item.unlock?.level !== undefined && !isUnlocked(w.item, ctx))
    .sort((a, b) => a.item.unlock!.level! - b.item.unlock!.level!)
    .slice(0, 6);

  if (upcoming.length === 0) return null;

  return (
    <div className="timeline unlocks-timeline">
      <div className="timeline-track" />
      {upcoming.map((w) => {
        const { cfg, mode } = previewFor(w.key, w.item, character);
        return (
          <div className="tl-node tl-unlock" key={`${w.key}-${w.item.id}`}>
            <div className="tl-unlock-art">{ready ? <CharacterThumbnail cfg={cfg} mode={mode} /> : <div className="char-thumb-skel" />}</div>
            <div className="tl-dot" />
            <div className="tl-lvl">Lv {w.item.unlock!.level}</div>
            <div className="tl-unlock-name">{unlockItemName(w.key, w.item)}</div>
          </div>
        );
      })}
    </div>
  );
}
