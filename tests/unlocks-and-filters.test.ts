import { describe, expect, it } from 'vitest';
import { defaultCharacter, unlockAppliesTo } from '../src/lib/character';
import { favoriteMatches, recipeMatches } from '../src/components/macros/MealFilter';
import type { CharacterConfig } from '../src/types';
import type { FavoriteMeal } from '../src/components/macros/macros';
import type { UserRecipe } from '../src/lib/recipes';

const base = (over: Partial<CharacterConfig>): CharacterConfig => ({ ...defaultCharacter('male'), ...over });

describe('unlock rail: greys out unlocks that do not apply to how the character is dressed', () => {
  it('outfit colour needs an outfit on', () => {
    expect(unlockAppliesTo('outfitColor', base({ outfit: 'none' })).applies).toBe(false);
    expect(unlockAppliesTo('outfitColor', base({ outfit: 'knight' })).applies).toBe(true);
  });
  it('top (gym wear) colour needs gym wear with a top, and no outfit', () => {
    expect(unlockAppliesTo('gymColor', base({ outfit: 'knight', top: 'tee' })).applies).toBe(false);
    expect(unlockAppliesTo('gymColor', base({ outfit: 'none', top: 'none' })).applies).toBe(false);
    expect(unlockAppliesTo('gymColor', base({ outfit: 'none', top: undefined })).applies).toBe(false);
    expect(unlockAppliesTo('gymColor', base({ outfit: 'none', top: 'tee' })).applies).toBe(true);
  });
  it('every other unlock always applies', () => {
    for (const k of ['hair', 'hairColor', 'outfit', 'skin', 'build', 'top', 'bottom', 'shoes', 'acc'] as const) {
      expect(unlockAppliesTo(k, base({ outfit: 'none', top: 'none' })).applies).toBe(true);
    }
  });
  it('greyed unlocks say why', () => {
    expect(unlockAppliesTo('outfitColor', base({ outfit: 'none' })).reason).toMatch(/outfit/i);
    expect(unlockAppliesTo('gymColor', base({ outfit: 'none', top: 'none' })).reason).toMatch(/top/i);
  });
});

describe('meal filters for favourites and recipes', () => {
  const fav = (meal: FavoriteMeal['meal']) => ({ meal }) as FavoriteMeal;
  const rec = (meals?: string[]) => ({ meals }) as UserRecipe;
  it('All shows everything', () => {
    expect(favoriteMatches(fav('lunch'), 'all')).toBe(true);
    expect(recipeMatches(rec(undefined), 'all')).toBe(true);
  });
  it('a meal shows only what is saved / tagged for it', () => {
    expect(favoriteMatches(fav('lunch'), 'lunch')).toBe(true);
    expect(favoriteMatches(fav('lunch'), 'dinner')).toBe(false);
    expect(recipeMatches(rec(['breakfast', 'snacks']), 'snacks')).toBe(true);
    expect(recipeMatches(rec(['breakfast']), 'dinner')).toBe(false);
    expect(recipeMatches(rec([]), 'breakfast')).toBe(false);
  });
});
