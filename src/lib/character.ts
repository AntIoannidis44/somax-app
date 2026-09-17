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
    outfit: 'none',
  };
}

interface UnlockContext {
  level: number;
  longestStreak: number;
}

export function isUnlocked(item: CatalogItem | undefined | null, ctx: UnlockContext): boolean {
  if (!item || !item.unlock) return true;
  const u = item.unlock;
  if (u.level && ctx.level < u.level) return false;
  if (u.streak && ctx.longestStreak < u.streak) return false;
  return true;
}

export function unlockLabel(item: CatalogItem): string {
  if (!item.unlock) return '';
  if (item.unlock.level) return 'Lv ' + item.unlock.level;
  return item.unlock.streak + '-day streak';
}

const WARDROBE_KEYS: CatalogKey[] = ['hair', 'outfit', 'build'];

export function allWardrobe(): { key: CatalogKey; item: CatalogItem }[] {
  const out: { key: CatalogKey; item: CatalogItem }[] = [];
  WARDROBE_KEYS.forEach((k) => {
    CATALOG[k].forEach((it) => {
      if (it.unlock) out.push({ key: k, item: it });
    });
  });
  return out;
}

export interface NextUnlock {
  level: number;
  item: CatalogItem;
  key: CatalogKey;
}

export function nextUnlock(ctx: UnlockContext): NextUnlock | null {
  let best: NextUnlock | null = null;
  allWardrobe().forEach((w) => {
    if (isUnlocked(w.item, ctx)) return;
    const u = w.item.unlock;
    if (u?.level) {
      if (!best || u.level < best.level) best = { level: u.level, item: w.item, key: w.key };
    }
  });
  return best;
}

export function countUnlocked(ctx: UnlockContext): { done: number; total: number } {
  const all = allWardrobe();
  const done = all.filter((w) => isUnlocked(w.item, ctx)).length;
  return { done, total: all.length };
}
