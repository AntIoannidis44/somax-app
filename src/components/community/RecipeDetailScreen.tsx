import { useState } from 'react';
import { createPortal } from 'react-dom';
import { Icon } from '../Icon';
import { useUserId } from '../../lib/useSession';
import { useAppStore } from '../../store/useAppStore';
import { uploadRecipeImage, type UserRecipe } from '../../lib/recipes';

interface RecipeDetailScreenProps {
  recipe: UserRecipe | null;
  onClose: () => void;
  onShare: (recipe: UserRecipe) => void;
  // False hides the "Add a photo" affordance entirely.
  editable?: boolean;
  // Called with the uploaded photo's URL once it's up - persisting it
  // (to user_recipes or favorite_meals, whichever this recipe really is)
  // is the caller's job, since this component doesn't know which table
  // recipe.id actually belongs to.
  onPhotoAdded?: (recipeId: string, imageUrl: string) => void;
  // Undefined hides the favourite star entirely (e.g. a synthesized
  // favourite-meal view that's already always "favourited").
  onToggleFavorite?: (recipe: UserRecipe) => void;
}

// Full recipe view - hero photo, macro stats, ingredients, method - same
// layout as the approved artifact's recipe-detail screen. This is what
// tapping a row in MyRecipesScreen opens, and the one place both the
// ingredients AND the steps are shown together (the list row itself only
// has room for a macro summary).
export function RecipeDetailScreen({ recipe, onClose, onShare, editable = true, onPhotoAdded, onToggleFavorite }: RecipeDetailScreenProps) {
  const userId = useUserId();
  const showToast = useAppStore((s) => s.showToast);
  const [uploading, setUploading] = useState(false);

  async function handleAddPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || !userId || !recipe) return;
    setUploading(true);
    const url = await uploadRecipeImage(userId, file);
    if (url) {
      onPhotoAdded?.(recipe.id, url);
      showToast('Photo added');
    } else {
      showToast('Could not upload that photo');
    }
    setUploading(false);
  }

  if (!recipe) return null;

  return createPortal(
    <div className="macro-search-overlay">
      <div className="macro-search-head">
        <button className="macro-search-back" onClick={onClose} aria-label="Close recipe">
          <svg viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6" /></svg>
        </button>
        <div style={{ fontWeight: 700, fontSize: 15 }}>Recipe</div>
        {onToggleFavorite && (
          <button
            className="link-btn"
            style={{ marginLeft: 'auto', fontSize: 20, lineHeight: 1 }}
            aria-label={recipe.is_favorite ? 'Remove from favourites' : 'Add to favourites'}
            onClick={() => onToggleFavorite(recipe)}
          >
            {recipe.is_favorite ? '★' : '☆'}
          </button>
        )}
      </div>
      <div className="macro-search-results">
        <div className="recipe-hero">
          {recipe.image_url ? (
            <img src={recipe.image_url} alt="" />
          ) : editable ? (
            <label
              style={{
                width: '100%',
                height: 200,
                background: 'var(--surface-2)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                cursor: 'pointer',
              }}
            >
              <Icon name={uploading ? 'nutrition' : 'camera'} style={{ width: 28, height: 28, color: 'var(--accent)' }} />
              <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--accent)' }}>
                {uploading ? 'Uploading…' : 'Add a photo'}
              </span>
              <input type="file" accept="image/*" onChange={handleAddPhoto} disabled={uploading} style={{ display: 'none' }} />
            </label>
          ) : (
            <div style={{ width: '100%', height: 200, background: 'var(--surface-2)', display: 'grid', placeItems: 'center' }}>
              <Icon name="nutrition" style={{ width: 40, height: 40, color: 'var(--text-faint)' }} />
            </div>
          )}
        </div>
        <div className="recipe-title-block">
          <h1>{recipe.name}</h1>
          <div className="s">
            {recipe.servings} serving{recipe.servings === 1 ? '' : 's'}
            {recipe.kcal ? ` · ${recipe.kcal} kcal per serving` : ''}
          </div>
        </div>

        {recipe.source_label && (
          <span className="source-pill">
            <svg viewBox="0 0 24 24"><path d="M20 6 9 17l-5-5" /></svg>
            {recipe.source_label}
          </span>
        )}

        <div className="recipe-stat-row">
          <div className="recipe-stat"><b>{recipe.kcal ?? '-'}</b><span>kcal</span></div>
          <div className="recipe-stat"><b>{recipe.protein_g ?? '-'}g</b><span>protein</span></div>
          <div className="recipe-stat"><b>{recipe.carbs_g ?? '-'}g</b><span>carbs</span></div>
          <div className="recipe-stat"><b>{recipe.fat_g ?? '-'}g</b><span>fat</span></div>
        </div>

        {recipe.ingredients.length > 0 && (
          <>
            <div className="section-label">Ingredients</div>
            <div className="card">
              {recipe.ingredients.map((ing, i) => (
                <div className="ingredient-row" key={i}>
                  <span className="dot" />
                  <span className="n">{ing.name}</span>
                  <span className="amt">{ing.amount}</span>
                </div>
              ))}
            </div>
          </>
        )}

        {recipe.steps.length > 0 && (
          <>
            <div className="section-label">Method</div>
            <div className="card">
              {recipe.steps.map((s, i) => (
                <div className="step-row" key={i}>
                  <span className="step-no">{i + 1}</span>
                  <p>{s}</p>
                </div>
              ))}
            </div>
          </>
        )}

        <button className="btn btn-primary" onClick={() => onShare(recipe)}>
          <Icon name="link" style={{ width: 15, height: 15 }} /> Share this recipe
        </button>
      </div>
    </div>,
    document.body,
  );
}
