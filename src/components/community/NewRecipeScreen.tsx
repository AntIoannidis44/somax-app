import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Icon } from '../Icon';
import { useUserId } from '../../lib/useSession';
import { useAppStore } from '../../store/useAppStore';
import { analyzeFoodPhoto } from '../../lib/foodPhoto';
import { saveUserRecipe, uploadRecipeImage, type RecipeIngredient } from '../../lib/recipes';

interface NewRecipeScreenProps {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
}

// "I made a chicken stir fry, I take a photo, I get the ingredients and
// macros calculated" - the original ask, distinct from ImportRecipeScreen
// (pulling someone ELSE's recipe from a URL/card). Reuses the same vision
// pipeline the macro tracker's own photo logging already uses
// (analyze-food-photo, 'recipe' mode), just saved as a shareable recipe
// instead of a single day's food-log entries.
export function NewRecipeScreen({ open, onClose, onSaved }: NewRecipeScreenProps) {
  const userId = useUserId();
  const showToast = useAppStore((s) => s.showToast);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [servings, setServings] = useState(1);
  const [ingredients, setIngredients] = useState<RecipeIngredient[]>([]);
  const [kcal, setKcal] = useState(0);
  const [proteinG, setProteinG] = useState(0);
  const [carbsG, setCarbsG] = useState(0);
  const [fatG, setFatG] = useState(0);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!photoFile) {
      setPhotoPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(photoFile);
    setPhotoPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [photoFile]);

  function reset() {
    setPhotoFile(null);
    setAnalyzing(false);
    setError(null);
    setName('');
    setServings(1);
    setIngredients([]);
    setKcal(0);
    setProteinG(0);
    setCarbsG(0);
    setFatG(0);
    setNotes('');
  }

  function handleClose() {
    reset();
    onClose();
  }

  async function handlePhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setPhotoFile(file);
    setAnalyzing(true);
    setError(null);
    try {
      const analysis = await analyzeFoodPhoto(file, 'recipe');
      setIngredients(analysis.items.map((it) => ({ name: it.name, amount: `${Math.round(it.estimatedGrams)}g` })));
      setKcal(Math.round(analysis.totalKcal));
      setProteinG(Math.round(analysis.totalProteinG));
      setCarbsG(Math.round(analysis.totalCarbsG));
      setFatG(Math.round(analysis.totalFatG));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not analyze that photo');
    } finally {
      setAnalyzing(false);
    }
  }

  function updateIngredient(i: number, field: 'name' | 'amount', value: string) {
    setIngredients((prev) => prev.map((ing, idx) => (idx === i ? { ...ing, [field]: value } : ing)));
  }

  function removeIngredient(i: number) {
    setIngredients((prev) => prev.filter((_, idx) => idx !== i));
  }

  async function handleSave() {
    if (!userId || !name.trim()) return;
    setSaving(true);
    let imageUrl: string | null = null;
    if (photoFile) imageUrl = await uploadRecipeImage(userId, photoFile);
    const saved = await saveUserRecipe(userId, {
      name: name.trim(),
      imageUrl,
      servings,
      kcal,
      proteinG,
      carbsG,
      fatG,
      ingredients,
      steps: notes.trim() ? notes.split('\n').map((s) => s.trim()).filter(Boolean) : [],
      sourceLabel: 'My own recipe',
    });
    setSaving(false);
    if (saved) {
      showToast('Saved to My Recipes');
      reset();
      onSaved();
    } else {
      showToast('Could not save this recipe');
    }
  }

  if (!open) return null;

  return createPortal(
    <div className="macro-search-overlay">
      <div className="macro-search-head">
        <button className="macro-search-back" onClick={handleClose} aria-label="Close new recipe">
          <svg viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6" /></svg>
        </button>
        <div style={{ fontWeight: 700, fontSize: 15 }}>New recipe</div>
      </div>
      <div className="macro-search-results">
        {!photoFile && (
          <label className="sheet-opt" style={{ background: 'var(--surface-2)', borderRadius: 16, cursor: 'pointer', marginBottom: 10 }}>
            <span className="share-ic" style={{ background: 'linear-gradient(140deg, var(--hero-1), var(--hero-2))' }}>
              <Icon name="camera" />
            </span>
            <div>
              <div className="t">Take a photo of your meal</div>
              <div className="s">Ingredients and macros are estimated from the photo</div>
            </div>
            <input type="file" accept="image/*" capture="environment" onChange={handlePhoto} style={{ display: 'none' }} />
          </label>
        )}

        {photoPreviewUrl && (
          <img src={photoPreviewUrl} alt="" style={{ width: '100%', height: 180, objectFit: 'cover', borderRadius: 18, marginBottom: 12 }} />
        )}

        {analyzing && <div className="macro-search-hint">Working out ingredients and macros…</div>}

        {error && (
          <div className="macro-search-hint" style={{ color: 'var(--danger)' }}>
            {error}
            <div style={{ marginTop: 10 }}>
              <button className="btn btn-ghost btn-sm" onClick={reset}>Try again</button>
            </div>
          </div>
        )}

        {photoFile && !analyzing && (
          <>
            <input
              className="share-caption"
              style={{ height: 'auto', padding: '10px 12px', marginBottom: 10 }}
              type="text"
              placeholder="What is it? e.g. Chicken Stir Fry"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <span style={{ fontSize: 12.5, color: 'var(--text-faint)', fontWeight: 600 }}>Servings</span>
              <input
                type="number"
                min={1}
                value={servings}
                onChange={(e) => setServings(Math.max(1, Number(e.target.value) || 1))}
                style={{ width: 56, padding: '6px 8px', borderRadius: 8, border: '1px solid var(--line)', background: 'var(--surface-2)', color: 'var(--text)' }}
              />
            </div>

            <div className="recipe-macro-row">
              <div className="recipe-macro"><b>{kcal}</b><span>kcal</span></div>
              <div className="recipe-macro"><b>{proteinG}g</b><span>protein</span></div>
              <div className="recipe-macro"><b>{carbsG}g</b><span>carbs</span></div>
              <div className="recipe-macro"><b>{fatG}g</b><span>fat</span></div>
            </div>

            <div className="section-label">Ingredients</div>
            <div className="card">
              {ingredients.map((ing, i) => (
                <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center', padding: '7px 0', borderTop: i > 0 ? '1px solid var(--line-soft, var(--line))' : 'none' }}>
                  <input
                    value={ing.name}
                    onChange={(e) => updateIngredient(i, 'name', e.target.value)}
                    style={{ flex: 1, minWidth: 0, border: 'none', background: 'none', color: 'var(--text)', font: 'inherit', fontSize: 13.5 }}
                  />
                  <input
                    value={ing.amount}
                    onChange={(e) => updateIngredient(i, 'amount', e.target.value)}
                    style={{ width: 64, border: 'none', background: 'none', color: 'var(--text-faint)', font: 'inherit', fontSize: 12, textAlign: 'right' }}
                  />
                  <span role="button" aria-label="Remove ingredient" onClick={() => removeIngredient(i)}>
                    <svg viewBox="0 0 24 24" style={{ width: 15, height: 15, stroke: 'var(--text-faint)', fill: 'none', strokeWidth: 2 }}>
                      <path d="M6 6l12 12M18 6 6 18" />
                    </svg>
                  </span>
                </div>
              ))}
              <button
                className="link-btn"
                style={{ marginTop: 8 }}
                onClick={() => setIngredients((prev) => [...prev, { name: '', amount: '' }])}
              >
                + Add ingredient
              </button>
            </div>

            <div className="section-label">Notes (optional)</div>
            <textarea
              className="share-caption"
              rows={3}
              placeholder="How you made it, one line per step…"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              style={{ marginBottom: 14 }}
            />

            <button className="btn btn-primary" disabled={saving || !name.trim()} onClick={handleSave}>
              {saving ? 'Saving…' : 'Save to my recipes'}
            </button>
          </>
        )}
      </div>
    </div>,
    document.body,
  );
}
