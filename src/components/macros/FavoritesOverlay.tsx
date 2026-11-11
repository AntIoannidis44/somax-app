import { createPortal } from 'react-dom';
import type { FavoriteMeal, MealId } from './macros';
import type { UserRecipe } from '../../lib/recipes';

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
  if (!open) return null;

  return createPortal(
    <div className="macro-search-overlay">
      <div className="macro-search-head">
        <button className="macro-search-back" onClick={onClose} aria-label="Close favourites">
          <svg viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6" /></svg>
        </button>
        <div style={{ fontWeight: 700, fontSize: 15 }}>Favourites &amp; saved recipes</div>
      </div>
      <div className="macro-search-results">
        {favorites.length === 0 && recipes.length === 0 ? (
          <div className="macro-search-hint">
            Nothing saved yet - add something manually and tap "Save as favourite", or save a recipe from My Recipes.
          </div>
        ) : (
          <>
            {MEAL_ORDER.map(({ id, label }) => {
              const group = favorites.filter((f) => f.meal === id);
              if (group.length === 0) return null;
              return (
                <div key={id}>
                  <div className="section-label" style={{ margin: '16px 4px 4px' }}>{label}</div>
                  {group.map((fav) => (
                    <div className="macro-fav-row" key={fav.id}>
                      <button type="button" style={{ display: 'flex', alignItems: 'center' }} onClick={() => onSelect(fav)}>
                        {fav.image_url && <img src={fav.image_url} alt="" style={{ width: 34, height: 34, borderRadius: 9, objectFit: 'cover', marginRight: 10 }} />}
                        <span className="macro-search-name">{fav.name}</span>
                      </button>
                      <span role="button" aria-label="Delete favourite" onClick={() => onDelete(fav.id)}>
                        <svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6 6 18" /></svg>
                      </span>
                    </div>
                  ))}
                </div>
              );
            })}
            {recipes.length > 0 && (
              <div>
                <div className="section-label" style={{ margin: '16px 4px 4px' }}>My recipes</div>
                {recipes.map((r) => (
                  <div className="macro-fav-row" key={r.id}>
                    <button type="button" style={{ display: 'flex', alignItems: 'center' }} onClick={() => onSelectRecipe(r)}>
                      {r.image_url && <img src={r.image_url} alt="" style={{ width: 34, height: 34, borderRadius: 9, objectFit: 'cover', marginRight: 10 }} />}
                      <span className="macro-search-name">{r.name}</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>,
    document.body,
  );
}
