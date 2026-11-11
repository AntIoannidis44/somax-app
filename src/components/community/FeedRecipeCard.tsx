import { useState } from 'react';
import { Icon } from '../Icon';
import { useAppStore } from '../../store/useAppStore';
import { useUserId } from '../../lib/useSession';
import { saveUserRecipe } from '../../lib/recipes';
import type { PostWorkout } from '../../lib/social';

interface FeedRecipeCardProps {
  recipe: NonNullable<PostWorkout>;
  sharesCount: number;
  onShare: () => void;
}

// A recipe shared to the Nutrition feed - same visual slot FeedPostCard
// gives FeedWorkoutCard's "asProgram" variant, but for a recipe: macro
// stats, an inline ingredients expand (no navigation needed to peek), and
// Save to my favourites, matching the artifact prototype the user reviewed.
export function FeedRecipeCard({ recipe, sharesCount, onShare }: FeedRecipeCardProps) {
  const userId = useUserId();
  const showToast = useAppStore((s) => s.showToast);
  const [ingredientsOpen, setIngredientsOpen] = useState(false);
  const [stepsOpen, setStepsOpen] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  const ingredients = recipe.ingredients ?? [];
  const steps = recipe.steps ?? [];

  async function handleSave() {
    if (!userId || saving) return;
    setSaving(true);
    const result = await saveUserRecipe(userId, {
      name: recipe.name,
      imageUrl: null,
      servings: recipe.servings ?? 1,
      kcal: recipe.kcal ?? null,
      proteinG: recipe.proteinG ?? null,
      carbsG: recipe.carbsG ?? null,
      fatG: recipe.fatG ?? null,
      ingredients,
      steps,
      sourceLabel: recipe.sourceLabel ?? null,
    });
    setSaving(false);
    if (result) {
      setSaved(true);
      showToast('Saved to My Favourites');
    } else {
      showToast('Could not save this recipe');
    }
  }

  return (
    <div className="feed-workout-card program recipe">
      <div className="fp-head">
        <Icon name="nutrition" style={{ width: 28, height: 28, color: 'var(--accent)' }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="feed-workout-name">{recipe.name}</div>
          <div className="feed-workout-meta">
            {recipe.servings ?? 1} serving{(recipe.servings ?? 1) === 1 ? '' : 's'}
            {recipe.sourceLabel ? ` · ${recipe.sourceLabel}` : ''}
          </div>
        </div>
      </div>

      <div className="recipe-macro-row">
        <div className="recipe-macro"><b>{recipe.kcal ?? '-'}</b><span>kcal</span></div>
        <div className="recipe-macro"><b>{recipe.proteinG ?? '-'}g</b><span>protein</span></div>
        <div className="recipe-macro"><b>{recipe.carbsG ?? '-'}g</b><span>carbs</span></div>
        <div className="recipe-macro"><b>{recipe.fatG ?? '-'}g</b><span>fat</span></div>
      </div>

      {ingredients.length > 0 && (
        <>
          <button className="recipe-ing-toggle" onClick={() => setIngredientsOpen((o) => !o)}>
            <Icon name="chevron" style={{ width: 13, height: 13, transform: ingredientsOpen ? 'rotate(90deg)' : undefined }} />
            {ingredientsOpen ? 'Hide ingredients' : `Show ingredients (${ingredients.length})`}
          </button>
          {ingredientsOpen && (
            <div className="fp-ex recipe-ing-list">
              {ingredients.map((ing, i) => (
                <div key={i}>
                  <span>{ing.name}</span>
                  <span>{ing.amount}</span>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {steps.length > 0 && (
        <>
          <button className="recipe-ing-toggle" onClick={() => setStepsOpen((o) => !o)}>
            <Icon name="chevron" style={{ width: 13, height: 13, transform: stepsOpen ? 'rotate(90deg)' : undefined }} />
            {stepsOpen ? 'Hide full recipe' : 'View full recipe'}
          </button>
          {stepsOpen && (
            <ol className="recipe-steps-list">
              {steps.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ol>
          )}
        </>
      )}

      <div className="recipe-card-actions">
        <button className="btn btn-ghost btn-sm" onClick={onShare}>
          <Icon name="link" style={{ width: 14, height: 14 }} /> Share{sharesCount > 0 ? ` (${sharesCount})` : ''}
        </button>
        <button className={`btn ${saved ? 'btn-ghost' : 'btn-soft'} btn-sm`} disabled={saved || saving || !userId} onClick={handleSave}>
          <Icon name={saved ? 'check' : 'plus'} style={{ width: 14, height: 14 }} /> {saved ? 'Saved' : 'Save to my favourites'}
        </button>
      </div>
    </div>
  );
}
