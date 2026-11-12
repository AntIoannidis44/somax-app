import { CATALOG, CHAR_TIERS } from '../data/catalog';
import type { CatalogItem, CatalogKey, CharacterBase, CharacterConfig, CharTier } from '../types';

export function tierFor(level: number): CharTier {
  let t = CHAR_TIERS[0];
  for (const tier of CHAR_TIERS) {
    if (level >= tier.min) t = tier;
  }
  return t;
}

export function findItem<T extends CatalogItem>(list: T[], id: string): T {
  return list.find((it) => it.id === id) || list[0];
}

export function defaultCharacter(base?: CharacterBase): CharacterConfig {
  return {
    base: base || 'female',
    build: 'regular',
    skin: 1,
    hair: 'none',
    hairColor: 0,
    outfit: 'none',
    outfitColor: 0,
  };
}

interface UnlockContext {
  level: number;
  longestStreak: number;
  prestige?: number;
  keeps?: string[];
}

export function isUnlocked(item: CatalogItem | undefined | null, ctx: UnlockContext): boolean {
  if (!item || !item.unlock) return true;
  if (ctx.keeps?.includes(item.id)) return true;
  const u = item.unlock;
  if (u.level && ctx.level < u.level) return false;
  if (u.streak && ctx.longestStreak < u.streak) return false;
  if (u.prestige && (ctx.prestige ?? 0) < u.prestige) return false;
  return true;
}

// What a character can actually wear at this level: anything locked comes off, or falls back to a free item. Clears
// looks saved from a preview build, and items whose unlock moved up. Pure, so screens can use it without saving.
export function wearUnlocked(cfg: CharacterConfig, ctx: UnlockContext): CharacterConfig {
  const out: any = { ...cfg };
  const ok = (key: CatalogKey, id: unknown) => isUnlocked(CATALOG[key].find((x) => x.id === id), ctx);
  const free = (key: CatalogKey) => (CATALOG[key] as (CatalogItem & { base?: CharacterBase })[]).find((x) => x.id !== 'none' && !x.unlock && (!x.base || x.base === cfg.base))?.id ?? 'none';
  for (const key of ['top', 'bottom', 'hair'] as CatalogKey[]) if (!ok(key, out[key])) out[key] = free(key);
  for (const key of ['legwear', 'shoes', 'outfit'] as CatalogKey[]) if (!ok(key, out[key])) out[key] = 'none';
  if (!ok('build', out.build)) out.build = 'regular';
  if (cfg.acc?.some((id) => !ok('acc', id))) out.acc = cfg.acc.filter((id) => ok('acc', id));
  const fine = (key: CatalogKey, i: number | undefined) => isUnlocked(CATALOG[key][i ?? 0], ctx);
  for (const [field, key] of [['skin', 'skin'], ['hairColor', 'hairColor'], ['outfitColor', 'outfitColor'], ['topColor', 'gymColor'], ['bottomColor', 'gymColor'], ['shoesColor', 'gymColor']] as [string, CatalogKey][]) if (!fine(key, out[field])) out[field] = 0;
  return out;
}

export function unlockLabel(item: CatalogItem): string {
  if (!item.unlock) return '';
  if (item.unlock.prestige) return 'Evolve ' + item.unlock.prestige;
  if (item.unlock.level) return 'Lv ' + item.unlock.level;
  return item.unlock.streak + '-day streak';
}

export function lockHint(item: CatalogItem): string {
  const u = item.unlock;
  if (u?.prestige) return `Evolve ${u.prestige} unlocks ${item.name}`;
  if (u?.level) return `Reach Level ${u.level} to unlock ${item.name}`;
  return `Hit a ${u?.streak}-day streak to unlock ${item.name}`;
}

const WARDROBE_KEYS: CatalogKey[] = ['hair', 'outfit', 'build', 'hairColor', 'outfitColor', 'skin', 'top', 'bottom', 'legwear', 'acc', 'shoes', 'gymColor'];

// Base-restricted categories (hair, tops, bottoms, ...) carry a male AND a
// female item at the same unlock level with the same display name (e.g.
// 'jeans'/'jeansM', both "Jeans") - every other caller already filters its
// own tile grid to the player's base (see CharacterStudioScreen), so this
// does the same or every one of them double-counts/double-shows each pair.
export function allWardrobe(base?: CharacterBase): { key: CatalogKey; item: CatalogItem }[] {
  const out: { key: CatalogKey; item: CatalogItem }[] = [];
  WARDROBE_KEYS.forEach((k) => {
    (CATALOG[k] as (CatalogItem & { base?: CharacterBase })[]).forEach((it) => {
      if (it.unlock && (!it.base || !base || it.base === base)) out.push({ key: k, item: it });
    });
  });
  return out;
}

export interface NextUnlock {
  level: number;
  item: CatalogItem;
  key: CatalogKey;
}

// Colour/skin/build catalogs reuse plain names like "Blue" or "Crimson" across
// several categories - naming the category is the only way "unlocks at 13"
// means anything. Other categories (hair styles, outfits, gym pieces) already
// have self-describing names, so leave those as-is.
const CATEGORY_SUFFIX: Partial<Record<CatalogKey, string>> = {
  hairColor: 'Hair Color',
  outfitColor: 'Outfit Color',
  gymColor: 'Color',
  skin: 'Skin Tone',
  build: 'Build',
};

export function unlockItemName(key: CatalogKey, item: CatalogItem): string {
  const suffix = CATEGORY_SUFFIX[key];
  return suffix ? `${item.name} ${suffix}` : item.name;
}

export function nextUnlock(ctx: UnlockContext, base?: CharacterBase): NextUnlock | null {
  let best: NextUnlock | null = null;
  allWardrobe(base).forEach((w) => {
    if (isUnlocked(w.item, ctx)) return;
    const u = w.item.unlock;
    if (u?.level) {
      if (!best || u.level < best.level) best = { level: u.level, item: w.item, key: w.key };
    }
  });
  return best;
}

export function countUnlocked(ctx: UnlockContext, base?: CharacterBase): { done: number; total: number } {
  const all = allWardrobe(base);
  const done = all.filter((w) => isUnlocked(w.item, ctx)).length;
  return { done, total: all.length };
}
