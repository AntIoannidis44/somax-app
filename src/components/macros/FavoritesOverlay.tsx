import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { MealFilterChips, favoriteMatches, recipeMatches, type MealFilterValue } from './MealFilter';
import type { FavoriteMeal, MealId } from './macros';
import type { UserRecipe } from '../../lib/recipes';
import { FavoriteMealCard, FavoriteRecipeCard } from './FavoriteCard';

const MEAL_ORDER: { id: MealId; label: string }[] = [
  { id: 'breakfast', label: 'Breakfast' },
  { id: 'lunch', label: 'Lunch' },
  { id: 'dinner', label: 'Dinner' },
  { id: 'snacks', label: 'Snacks' },
];

interface FavoritesOverlayProps {
  open: boolean;
  favorites: FavoriteMeal[];
  recipes: UserRecipe[];
  onClose: () => void;
  onSelect: (fav: FavoriteMeal) => void;
  onDelete: (id: string) => void;
  onSelectRecipe: (recipe: UserRecipe) => void;
}

// Full-screen browse of every saved favourite AND saved recipe - either can
// be logged straight to today's meal. Favourites are grouped by the meal
// they were saved under (the quick row in AddFoodSheet only shows
// favourites for whichever meal tab is currently selected, so this is the
// "see everything" escape hatch, same full-screen pattern as
// FoodSearchOverlay); recipes aren't meal-scoped, so they get their own
// section below.
export function FavoritesOverlay({ open, favorites, recipes, onClose, onSelect, onDelete, onSelectRecipe }: FavoritesOverlayProps) {
  const [filter, setFilter] = useState<MealFilterValue>('all');
  useEffect(() => {
    if (open) setFilter('all');
  }, [open]);
  if (!open) return null;

  const favs = favorites.filter((f) => favoriteMatches(f, filter));
  const recs = recipes.filter((r) => recipeMatches(r, filter));
  const counts = Object.fromEntries(
    (['all', 'breakfast', 'lunch', 'dinner', 'snacks'] as MealFilterValue[]).map((m) => [
      m,
      favorites.filter((f) => favoriteMatches(f, m)).length + recipes.filter((r) => recipeMatches(r, m)).length,
    ]),
  );

  return createPortal(
    <div className="macro-search-overlay">
      <div className="macro-search-head">
        <button className="macro-search-back" onClick={onClose} aria-label="Close favourites">
          <svg viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6" /></svg>
        </button>
        <div style={{ fontWeight: 700, fontSize: 15 }}>Favourites &amp; saved recipes</div>
      </div>
      {(favorites.length > 0 || recipes.length > 0) && <MealFilterChips value={filter} onChange={setFilter} counts={counts} />}
      <div className="macro-search-results">
        {favorites.length > 0 || recipes.length > 0 ? (favs.length === 0 && recs.length === 0 ? (
          <div className="macro-search-hint">
            Nothing saved for {filter} yet. Favourites are saved under a meal; recipes are tagged with a meal when you log them,
            or from the recipe page in My recipes.
          </div>
        ) : null) : null}
        {favorites.length === 0 && recipes.length === 0 ? (
          <div className="macro-search-hint">
            Nothing saved yet - add something manually and tap "Save as favourite", or save a recipe from My Recipes.
          </div>
        ) : (
          <>
            {MEAL_ORDER.map(({ id, label }) => {
              const group = favs.filter((f) => f.meal === id);
              if (group.length === 0) return null;
              return (
                <div key={id}>
                  <div className="section-label" style={{ margin: '16px 4px 4px' }}>{label}</div>
                  <div className="fav-card-list">
                    {group.map((fav) => (
                      <FavoriteMealCard key={fav.id} fav={fav} onAdd={() => onSelect(fav)} onDelete={() => onDelete(fav.id)} />
                    ))}
                  </div>
                </div>
              );
            })}
            {recs.length > 0 && (
              <div>
                <div className="section-label" style={{ margin: '16px 4px 4px' }}>My recipes</div>
                <div className="fav-card-list">
                  {recs.map((r) => (
                    <FavoriteRecipeCard key={r.id} recipe={r} onAdd={() => onSelectRecipe(r)} />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>,
    document.body,
  );
}
