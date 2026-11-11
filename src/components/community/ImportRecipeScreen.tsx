import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Icon } from '../Icon';
import { useUserId } from '../../lib/useSession';
import { useAppStore } from '../../store/useAppStore';
import { importRecipeFromPhoto, importRecipeFromUrl, type ImportedRecipe } from '../../lib/recipeImport';
import { saveUserRecipe, uploadRecipeImage } from '../../lib/recipes';

interface ImportRecipeScreenProps {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
}

// Import a recipe either by pasting a URL (the edge function fetches the
// page server-side and prefers its schema.org/Recipe structured data) or by
// photographing a recipe card/cookbook page (Claude vision). Either way
// lands here as an editable preview before it's actually saved.
export function ImportRecipeScreen({ open, onClose, onSaved }: ImportRecipeScreenProps) {
  const userId = useUserId();
  const showToast = useAppStore((s) => s.showToast);
  const [url, setUrl] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ImportedRecipe | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // One object URL per photo, revoked the moment it's replaced or this
  // screen closes - createObjectURL in the render body would mint a new,
  // never-revoked blob URL on every re-render (saving/error state changes
  // included), not just when a new photo is actually picked.
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
    setUrl('');
    setBusy(false);
    setError(null);
    setResult(null);
    setPhotoFile(null);
  }

  function handleClose() {
    reset();
    onClose();
  }

  async function runUrlImport() {
    const trimmed = url.trim();
    if (!trimmed) return;
    setBusy(true);
    setError(null);
    try {
      const recipe = await importRecipeFromUrl(trimmed);
      setResult(recipe);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not import that recipe');
    } finally {
      setBusy(false);
    }
  }

  async function handlePhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setPhotoFile(file);
    setBusy(true);
    setError(null);
    try {
      const recipe = await importRecipeFromPhoto(file);
      setResult(recipe);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not read a recipe from that photo');
    } finally {
      setBusy(false);
    }
  }

  async function handleSave() {
    if (!userId || !result) return;
    setSaving(true);
    // A photo import's photo is the real image (uploaded to our own
    // storage); a URL import's image is the page's own photo, already a
    // real external URL extracted server-side - nothing to upload.
    let imageUrl: string | null = result.imageUrl;
    if (photoFile) imageUrl = await uploadRecipeImage(userId, photoFile);
    const saved = await saveUserRecipe(userId, {
      name: result.name,
      imageUrl,
      servings: result.servings,
      kcal: result.kcal,
      proteinG: result.proteinG,
      carbsG: result.carbsG,
      fatG: result.fatG,
      ingredients: result.ingredients,
      steps: result.steps,
      sourceLabel: result.sourceLabel,
      sourceUrl: url.trim() || null,
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
        <button className="macro-search-back" onClick={handleClose} aria-label="Close import">
          <svg viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6" /></svg>
        </button>
        <div style={{ fontWeight: 700, fontSize: 15 }}>Import a recipe</div>
      </div>
      <div className="macro-search-results">
        {!result && !busy && (
          <>
            <div className="sheet-opt" style={{ background: 'var(--surface-2)', borderRadius: 16, marginBottom: 10, flexDirection: 'column', alignItems: 'stretch', gap: 8, padding: 14 }}>
              <div className="t">Paste a URL</div>
              <div className="s" style={{ marginBottom: 6 }}>From RecipeTin Eats, HelloFresh, any blog with a recipe</div>
              <input
                className="share-caption"
                style={{ height: 'auto', padding: '10px 12px' }}
                type="text"
                placeholder="Paste URL of recipe"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
              <button className="btn btn-primary" disabled={!url.trim()} onClick={runUrlImport}>
                Import
              </button>
            </div>
            <label className="sheet-opt" style={{ background: 'var(--surface-2)', borderRadius: 16, cursor: 'pointer' }}>
              <span className="share-ic" style={{ background: 'var(--stat-endurance, var(--accent))' }}>
                <Icon name="camera" />
              </span>
              <div>
                <div className="t">Take a photo</div>
                <div className="s">A recipe card, handwritten notes, a cookbook page, or a screenshot</div>
              </div>
              <input type="file" accept="image/*" capture="environment" onChange={handlePhoto} style={{ display: 'none' }} />
            </label>
          </>
        )}

        {busy && <div className="macro-search-hint">Reading ingredients and calculating macros…</div>}

        {error && (
          <div className="macro-search-hint" style={{ color: 'var(--danger)' }}>
            {error}
            <div style={{ marginTop: 10 }}>
              <button className="btn btn-ghost btn-sm" onClick={reset}>Try again</button>
            </div>
          </div>
        )}

        {result && (
          <>
            <span className="source-pill">
              <svg viewBox="0 0 24 24"><path d="M20 6 9 17l-5-5" /></svg>
              {result.imageUrl ? `Imported from ${result.sourceLabel}` : result.sourceLabel}
            </span>
            <div className="recipe-hero">
              <img src={photoPreviewUrl ?? result.imageUrl ?? ''} alt="" />
            </div>
            <div className="recipe-title-block">
              <h1>{result.name}</h1>
              <div className="s">
                {result.servings} serving{result.servings === 1 ? '' : 's'} &middot; {result.kcal} kcal per serving
              </div>
            </div>
            <div className="recipe-stat-row">
              <div className="recipe-stat"><b>{result.kcal}</b><span>kcal</span></div>
              <div className="recipe-stat"><b>{result.proteinG}g</b><span>protein</span></div>
              <div className="recipe-stat"><b>{result.carbsG}g</b><span>carbs</span></div>
              <div className="recipe-stat"><b>{result.fatG}g</b><span>fat</span></div>
            </div>
            <div className="section-label">Ingredients</div>
            <div className="card">
              {result.ingredients.map((ing, i) => (
                <div className="ingredient-row" key={i}>
                  <span className="dot" />
                  <span className="n">{ing.name}</span>
                  <span className="amt">{ing.amount}</span>
                </div>
              ))}
            </div>
            <div className="section-label">Method</div>
            <div className="card">
              {result.steps.map((s, i) => (
                <div className="step-row" key={i}>
                  <span className="step-no">{i + 1}</span>
                  <p>{s}</p>
                </div>
              ))}
            </div>
            <button className="btn btn-primary" disabled={saving} onClick={handleSave}>
              {saving ? 'Saving…' : 'Save to my recipes'}
            </button>
            <button className="btn btn-ghost" style={{ marginTop: 8 }} onClick={reset}>
              Start over
            </button>
          </>
        )}
      </div>
    </div>,
    document.body,
  );
}
