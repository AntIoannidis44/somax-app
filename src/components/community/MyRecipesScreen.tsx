import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Icon } from '../Icon';
import { useUserId } from '../../lib/useSession';
import { deleteUserRecipe, fetchUserRecipes, setRecipeFavorite, updateUserRecipeImage, type UserRecipe } from '../../lib/recipes';
import { deleteFavoriteMeal, fetchFavoriteMeals, kcalForMacros, updateFavoriteMealImage, type FavoriteMeal } from '../macros/macros';
import { ShareRecipeSheet } from './ShareRecipeSheet';
import { ImportRecipeScreen } from './ImportRecipeScreen';
import { NewRecipeScreen } from './NewRecipeScreen';
import { RecipeDetailScreen } from './RecipeDetailScreen';
import type { RecipeToShare } from '../../lib/recipePosts';

interface MyRecipesScreenProps {
  open: boolean;
  onClose: () => void;
}

function toShareTarget(r: UserRecipe): RecipeToShare {
  return {
    name: r.name,
    imageUrl: r.image_url,
    servings: r.servings,
    kcal: r.kcal ?? 0,
    proteinG: r.protein_g ?? 0,
    carbsG: r.carbs_g ?? 0,
    fatG: r.fat_g ?? 0,
    ingredients: r.ingredients,
    steps: r.steps,
    sourceLabel: r.source_label ?? undefined,
  };
}

// A favourite meal from the macro tracker (quick re-add, no photo/steps)
// shared the same way as a full recipe - the macro totals it already
// carries per item are summed into one recipe-shaped snapshot.
function favoriteToShareTarget(f: FavoriteMeal): RecipeToShare {
  const proteinG = f.items.reduce((s, i) => s + i.proteinG, 0);
  const carbsG = f.items.reduce((s, i) => s + i.carbsG, 0);
  const fatG = f.items.reduce((s, i) => s + i.fatG, 0);
  return {
    name: f.name,
    imageUrl: f.image_url,
    servings: 1,
    kcal: kcalForMacros(proteinG, carbsG, fatG),
    proteinG,
    carbsG,
    fatG,
    ingredients: f.items.map((i) => ({ name: i.name, amount: i.serving })),
    steps: [],
    sourceLabel: 'Favourite meal',
  };
}

function favoriteToDetail(f: FavoriteMeal): UserRecipe {
  const share = favoriteToShareTarget(f);
  return {
    id: f.id,
    user_id: f.user_id,
    name: f.name,
    image_url: f.image_url,
    servings: 1,
    kcal: share.kcal,
    protein_g: share.proteinG,
    carbs_g: share.carbsG,
    fat_g: share.fatG,
    ingredients: share.ingredients,
    steps: [],
    source_label: 'Favourite meal',
    source_url: null,
    created_at: f.created_at,
    is_favorite: true,
  };
}

// Full-screen browse of everything nutrition-related you own: recipes
// you've created/imported/saved, and your existing macro-tracker favourite
// meals - one place, same as the artifact's "My Recipes" tab, reachable
// from both Community -> Nutrition and the Macros screen.
export function MyRecipesScreen({ open, onClose }: MyRecipesScreenProps) {
  const userId = useUserId();
  const [recipes, setRecipes] = useState<UserRecipe[]>([]);
  const [favorites, setFavorites] = useState<FavoriteMeal[]>([]);
  const [loading, setLoading] = useState(true);
  const [shareTarget, setShareTarget] = useState<RecipeToShare | null>(null);
  const [detailTarget, setDetailTarget] = useState<UserRecipe | null>(null);
  const [detailIsFavorite, setDetailIsFavorite] = useState(false);
  const [importing, setImporting] = useState(false);
  const [creating, setCreating] = useState(false);

  function load() {
    if (!userId) return;
    setLoading(true);
    Promise.all([fetchUserRecipes(userId), fetchFavoriteMeals(userId)]).then(([r, f]) => {
      setRecipes(r);
      setFavorites(f);
      setLoading(false);
    });
  }

  useEffect(() => {
    if (open) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, userId]);

  async function handleDelete(id: string) {
    if (!window.confirm('Delete this recipe?')) return;
    setRecipes((prev) => prev.filter((r) => r.id !== id));
    await deleteUserRecipe(id);
  }

  async function handleDeleteFavorite(id: string) {
    if (!window.confirm('Delete this favourite?')) return;
    setFavorites((prev) => prev.filter((f) => f.id !== id));
    await deleteFavoriteMeal(id);
  }

  async function handleToggleFavorite(r: UserRecipe) {
    const next = !r.is_favorite;
    setRecipes((prev) => prev.map((x) => (x.id === r.id ? { ...x, is_favorite: next } : x)));
    setDetailTarget((prev) => (prev && prev.id === r.id ? { ...prev, is_favorite: next } : prev));
    await setRecipeFavorite(r.id, next);
  }

  if (!open) return null;

  return createPortal(
    <div className="macro-search-overlay">
      <div className="macro-search-head">
        <button className="macro-search-back" onClick={onClose} aria-label="Close my recipes">
          <svg viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6" /></svg>
        </button>
        <div style={{ fontWeight: 700, fontSize: 15 }}>My recipes &amp; favourites</div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 10 }}>
          <button className="link-btn" onClick={() => setCreating(true)}>
            <Icon name="camera" style={{ width: 14, height: 14 }} /> New
          </button>
          <button className="link-btn" onClick={() => setImporting(true)}>
            <Icon name="plus" style={{ width: 14, height: 14 }} /> Import
          </button>
        </div>
      </div>
      <div className="macro-search-results">
        {loading && <div className="macro-search-hint">Loading…</div>}
        {!loading && recipes.length === 0 && favorites.length === 0 && (
          <div className="macro-search-hint">
            No recipes saved yet - take a photo with New, paste a URL with Import, or save a favourite meal from the macro tracker.
          </div>
        )}

        {recipes.length > 0 && <div className="section-label">Recipes</div>}
        {recipes.map((r) => (
          <div className="recipe-list-row" key={r.id}>
            {r.image_url ? (
              <img className="recipe-list-thumb" src={r.image_url} alt="" />
            ) : (
              <div className="recipe-list-thumb empty">
                <Icon name="nutrition" style={{ width: 26, height: 26, color: 'var(--text-faint)' }} />
              </div>
            )}
            <button
              type="button"
              className="recipe-list-main"
              onClick={() => {
                setDetailTarget(r);
                setDetailIsFavorite(false);
              }}
            >
              <div className="recipe-list-name">{r.name}</div>
              <div className="recipe-list-sub">
                {r.servings} serving{r.servings === 1 ? '' : 's'} &middot; {r.kcal ?? '-'} kcal
              </div>
              <div className="recipe-list-macros">
                <span>P <b>{r.protein_g ?? 0}g</b></span>
                <span>C <b>{r.carbs_g ?? 0}g</b></span>
                <span>F <b>{r.fat_g ?? 0}g</b></span>
              </div>
            </button>
            <div className="recipe-list-actions">
              <span
                role="button"
                aria-label={r.is_favorite ? 'Remove from favourites' : 'Add to favourites'}
                style={{ fontSize: 18, lineHeight: 1, color: r.is_favorite ? 'var(--warn, #d4a017)' : 'var(--text-faint)' }}
                onClick={() => handleToggleFavorite(r)}
              >
                {r.is_favorite ? '★' : '☆'}
              </span>
              <span role="button" aria-label="Share recipe" onClick={() => setShareTarget(toShareTarget(r))}>
                <svg viewBox="0 0 24 24" style={{ stroke: 'var(--accent)', fill: 'none', strokeWidth: 2 }}>
                  <path d="M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7" />
                  <path d="M16 6l-4-4-4 4" />
                  <path d="M12 2v14" />
                </svg>
              </span>
              <span role="button" aria-label="Delete recipe" onClick={() => handleDelete(r.id)}>
                <svg viewBox="0 0 24 24" style={{ stroke: 'var(--text-faint)', fill: 'none', strokeWidth: 2 }}>
                  <path d="M6 6l12 12M18 6 6 18" />
                </svg>
              </span>
            </div>
          </div>
        ))}

        {favorites.length > 0 && <div className="section-label" style={{ marginTop: recipes.length > 0 ? 18 : 4 }}>Favourite meals</div>}
        {favorites.map((f) => {
          const share = favoriteToShareTarget(f);
          return (
            <div className="recipe-list-row" key={f.id}>
              {f.image_url ? (
                <img className="recipe-list-thumb" src={f.image_url} alt="" />
              ) : (
                <div className="recipe-list-thumb empty">
                  <Icon name="nutrition" style={{ width: 26, height: 26, color: 'var(--text-faint)' }} />
                </div>
              )}
              <button
                type="button"
                className="recipe-list-main"
                onClick={() => {
                  setDetailTarget(favoriteToDetail(f));
                  setDetailIsFavorite(true);
                }}
              >
                <div className="recipe-list-name">{f.name}</div>
                <div className="recipe-list-sub">
                  {f.items.length} ingredient{f.items.length === 1 ? '' : 's'} &middot; {share.kcal} kcal
                </div>
                <div className="recipe-list-macros">
                  <span>P <b>{Math.round(share.proteinG)}g</b></span>
                  <span>C <b>{Math.round(share.carbsG)}g</b></span>
                  <span>F <b>{Math.round(share.fatG)}g</b></span>
                </div>
              </button>
              <div className="recipe-list-actions">
                <span role="button" aria-label="Share favourite" onClick={() => setShareTarget(share)}>
                  <svg viewBox="0 0 24 24" style={{ stroke: 'var(--accent)', fill: 'none', strokeWidth: 2 }}>
                    <path d="M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7" />
                    <path d="M16 6l-4-4-4 4" />
                    <path d="M12 2v14" />
                  </svg>
                </span>
                <span role="button" aria-label="Delete favourite" onClick={() => handleDeleteFavorite(f.id)}>
                  <svg viewBox="0 0 24 24" style={{ stroke: 'var(--text-faint)', fill: 'none', strokeWidth: 2 }}>
                    <path d="M6 6l12 12M18 6 6 18" />
                  </svg>
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {shareTarget && <ShareRecipeSheet recipe={shareTarget} onClose={() => setShareTarget(null)} />}
      <RecipeDetailScreen
        recipe={detailTarget}
        onToggleFavorite={detailIsFavorite ? undefined : handleToggleFavorite}
        onClose={() => setDetailTarget(null)}
        onShare={(r) => {
          setDetailTarget(null);
          setShareTarget(detailIsFavorite ? favoriteToShareTarget(favorites.find((f) => f.id === r.id)!) : toShareTarget(r));
        }}
        onPhotoAdded={async (id, imageUrl) => {
          setDetailTarget((prev) => (prev && prev.id === id ? { ...prev, image_url: imageUrl } : prev));
          if (detailIsFavorite) {
            setFavorites((prev) => prev.map((f) => (f.id === id ? { ...f, image_url: imageUrl } : f)));
            await updateFavoriteMealImage(id, imageUrl);
          } else {
            setRecipes((prev) => prev.map((r) => (r.id === id ? { ...r, image_url: imageUrl } : r)));
            await updateUserRecipeImage(id, imageUrl);
          }
        }}
      />
      <ImportRecipeScreen
        open={importing}
        onClose={() => setImporting(false)}
        onSaved={() => {
          setImporting(false);
          load();
        }}
      />
      <NewRecipeScreen
        open={creating}
        onClose={() => setCreating(false)}
        onSaved={() => {
          setCreating(false);
          load();
        }}
      />
    </div>,
    document.body,
  );
}
