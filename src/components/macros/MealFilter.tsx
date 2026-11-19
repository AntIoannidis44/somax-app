import type { FavoriteMeal, MealId } from './macros';
import type { UserRecipe } from '../../lib/recipes';

// Breakfast / Lunch / Dinner / Snacks filter shared by every "saved food" list
// (Favourites & saved recipes, My recipes) so they can't drift apart.
export type MealFilterValue = 'all' | MealId;

export const MEAL_FILTERS: { id: MealFilterValue; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'breakfast', label: 'Breakfast' },
  { id: 'lunch', label: 'Lunch' },
  { id: 'dinner', label: 'Dinner' },
  { id: 'snacks', label: 'Snacks' },
];

export function favoriteMatches(f: FavoriteMeal, filter: MealFilterValue): boolean {
  return filter === 'all' || f.meal === filter;
}

// Recipes are tagged with the meals they belong to (user_recipes.meals): set by hand on the
// recipe, and added automatically whenever a recipe is logged to a meal. Untagged recipes
// only show under All.
export function recipeMatches(r: UserRecipe, filter: MealFilterValue): boolean {
  return filter === 'all' || (r.meals ?? []).includes(filter);
}

export function MealFilterChips({
  value,
  onChange,
  counts,
}: {
  value: MealFilterValue;
  onChange: (v: MealFilterValue) => void;
  counts?: Partial<Record<MealFilterValue, number>>;
}) {
  return (
    <div className="macro-meal-picker meal-filter" role="tablist" aria-label="Filter by meal">
      {MEAL_FILTERS.map((m) => (
        <button
          key={m.id}
          type="button"
          role="tab"
          aria-selected={value === m.id}
          className={value === m.id ? 'on' : ''}
          onClick={() => onChange(m.id)}
        >
          {m.label}
          {counts?.[m.id] !== undefined && <span className="meal-filter-count">{counts[m.id]}</span>}
        </button>
      ))}
    </div>
  );
}
