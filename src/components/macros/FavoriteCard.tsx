import { Icon } from '../Icon';
import type { FavoriteMeal } from './macros';
import type { UserRecipe } from '../../lib/recipes';

// One favourite meal or saved recipe, in the same card style as the Meal
// Library (.lib-card) - full width, the name wraps instead of running off
// screen, with its calories and protein underneath.

function favTotals(fav: FavoriteMeal) {
  const p = fav.items.reduce((n, i) => n + (i.proteinG || 0), 0);
  const c = fav.items.reduce((n, i) => n + (i.carbsG || 0), 0);
  const f = fav.items.reduce((n, i) => n + (i.fatG || 0), 0);
  return { kcal: Math.round(p * 4 + c * 4 + f * 9), protein: Math.round(p) };
}

function Thumb({ url, recipe }: { url: string | null; recipe?: boolean }) {
  if (url) return <img className="fav-card-img" src={url} alt="" loading="lazy" />;
  return (
    <div className="lib-meal-badge">
      <Icon name={recipe ? 'nutrition' : 'heart'} />
    </div>
  );
}

export function FavoriteMealCard({ fav, mealLabel, onAdd, onDelete }: { fav: FavoriteMeal; mealLabel?: string; onAdd: () => void; onDelete?: () => void }) {
  const t = favTotals(fav);
  const items = fav.items.length;
  return (
    <div className="fav-card-wrap">
      <button type="button" className="lib-card fav-card" onClick={onAdd}>
        <Thumb url={fav.image_url} />
        <div className="lib-card-main">
          <div className="lib-card-name">{fav.name}</div>
          <div className="lib-card-meta">
            {mealLabel && <span>{mealLabel}</span>}
            <span>{t.kcal} kcal</span>
            <span>{t.protein}g protein</span>
            {items > 1 && <span>{items} items</span>}
          </div>
        </div>
        <span className="fav-card-add" aria-hidden="true">
          <Icon name="plus" />
        </span>
      </button>
      {onDelete && (
        <button type="button" className="fav-card-del" aria-label={`Delete favourite ${fav.name}`} onClick={onDelete}>
          <Icon name="x" />
        </button>
      )}
    </div>
  );
}

export function FavoriteRecipeCard({ recipe, onAdd }: { recipe: UserRecipe; onAdd: () => void }) {
  return (
    <div className="fav-card-wrap">
      <button type="button" className="lib-card fav-card" onClick={onAdd}>
        <Thumb url={recipe.image_url} recipe />
        <div className="lib-card-main">
          <div className="lib-card-name">{recipe.name}</div>
          <div className="lib-card-meta">
            <span>Recipe</span>
            {recipe.kcal != null && <span>{Math.round(recipe.kcal)} kcal</span>}
            {recipe.protein_g != null && <span>{Math.round(recipe.protein_g)}g protein</span>}
            {recipe.source_label && <span>{recipe.source_label}</span>}
          </div>
        </div>
        <span className="fav-card-add" aria-hidden="true">
          <Icon name="plus" />
        </span>
      </button>
    </div>
  );
}
