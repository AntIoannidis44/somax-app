import { useEffect, useRef, useState } from 'react';
import { Modal } from '../layout/Modal';
import { useUserId } from '../../lib/useSession';
import { barcodeScanAvailableOnPlatform, scanBarcode } from '../../lib/barcodeScanner';
import { lookupBarcode } from '../../lib/foodLookup';
import { analyzeFoodPhoto } from '../../lib/foodPhoto';
import { estimateFoodText } from '../../lib/foodText';
import { requestSpeechPermission, speechToTextAvailableOnPlatform, startVoiceListening, stopVoiceListening } from '../../lib/speechToText';
import { FoodSearchOverlay } from './FoodSearchOverlay';
import { FavoritesOverlay } from './FavoritesOverlay';
import { LibraryScreenLazy } from '../library/LazyLibrary';
import type { LibraryMeal } from '../../lib/library';
import { fetchUserRecipes, type UserRecipe } from '../../lib/recipes';
import {
  deleteFavoriteMeal,
  fetchFavoriteMeals,
  kcalForMacros,
  saveFavoriteMeal,
  type FavoriteMeal,
  type FoodSuggestion,
  type MealId,
} from './macros';

const MEALS: { id: MealId; label: string }[] = [
  { id: 'breakfast', label: 'Breakfast' },
  { id: 'lunch', label: 'Lunch' },
  { id: 'dinner', label: 'Dinner' },
  { id: 'snacks', label: 'Snacks' },
];

type SavedEntry = {
  meal: MealId;
  name: string;
  serving: string;
  proteinG: number;
  carbsG: number;
  fatG: number;
  quantity: number;
  source: 'manual' | 'barcode' | 'photo' | 'voice';
  barcode?: string;
  // Only ever set when logging from a favourite meal or recipe that
  // already has a photo - never a thing you attach to a plain log entry
  // directly.
  imageUrl?: string | null;
};

interface ReviewItem {
  tempId: string;
  included: boolean;
  name: string;
  grams: number;
  quantity: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  alternatives: string[];
  recalculating: boolean;
}

interface AddFoodSheetProps {
  open: boolean;
  onClose: () => void;
  onSave: (entries: SavedEntry[]) => void;
  initialMeal: MealId;
}

export function AddFoodSheet({ open, onClose, onSave, initialMeal }: AddFoodSheetProps) {
  const userId = useUserId();
  const [meal, setMeal] = useState<MealId>(initialMeal);
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [name, setName] = useState('');
  const [serving, setServing] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');
  const [busy, setBusy] = useState<'barcode' | 'photo' | null>(null);
  const [voiceState, setVoiceState] = useState<'idle' | 'listening' | 'processing'>('idle');
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [searchOpen, setSearchOpen] = useState(false);

  const [favorites, setFavorites] = useState<FavoriteMeal[]>([]);
  const [recipes, setRecipes] = useState<UserRecipe[]>([]);
  const [savingFavorite, setSavingFavorite] = useState(false);
  const [favoritesExpanded, setFavoritesExpanded] = useState(false);

  const [reviewItems, setReviewItems] = useState<ReviewItem[] | null>(null);

  useEffect(() => {
    if (open) setMeal(initialMeal);
  }, [open, initialMeal]);

  useEffect(() => {
    if (open && userId) {
      fetchFavoriteMeals(userId).then(setFavorites);
      fetchUserRecipes(userId).then(setRecipes);
    }
  }, [open, userId]);

  const perUnitKcalPreview = Math.round((parseFloat(protein) || 0) * 4 + (parseFloat(carbs) || 0) * 4 + (parseFloat(fat) || 0) * 9);
  const kcalPreview = Math.round(perUnitKcalPreview * quantity);
  const mealFavorites = favorites.filter((f) => f.meal === meal);
  // Recipes aren't meal-scoped, so every favourited one shows regardless
  // of which meal tab is selected - same one-tap chip row favourite meals
  // already get.
  const favoriteRecipes = recipes.filter((r) => r.is_favorite);

  function reset() {
    setName('');
    setServing('');
    setQuantity(1);
    setProtein('');
    setCarbs('');
    setFat('');
    setError(null);
    setReviewItems(null);
    setSearchOpen(false);
  }

  function handleClose() {
    reset();
    onClose();
  }

  function handleSave() {
    if (!name.trim()) return;
    onSave([{
      meal,
      name: name.trim(),
      serving: serving.trim() || '1 serving',
      proteinG: parseFloat(protein) || 0,
      carbsG: parseFloat(carbs) || 0,
      fatG: parseFloat(fat) || 0,
      quantity: quantity > 0 ? quantity : 1,
      source: 'manual',
    }]);
    reset();
  }


  function applySuggestion(s: FoodSuggestion) {
    setName(s.name);
    setServing(s.serving ?? '');
    setProtein(s.proteinG !== null ? String(Math.round(s.proteinG)) : '');
    setCarbs(s.carbsG !== null ? String(Math.round(s.carbsG)) : '');
    setFat(s.fatG !== null ? String(Math.round(s.fatG)) : '');
  }

  async function handleSaveAsFavorite() {
    if (!userId || !name.trim()) return;
    setSavingFavorite(true);
    try {
      const fav = await saveFavoriteMeal(userId, name.trim(), meal, [
        { name: name.trim(), serving: serving.trim() || '1 serving', proteinG: parseFloat(protein) || 0, carbsG: parseFloat(carbs) || 0, fatG: parseFloat(fat) || 0 },
      ]);
      if (fav) {
        setFavorites((prev) => [fav, ...prev]);
        setError(null);
      }
    } finally {
      setSavingFavorite(false);
    }
  }

  function handleAddFavorite(fav: FavoriteMeal) {
    onSave(
      fav.items.map((item) => ({
        meal,
        name: item.name,
        serving: item.serving,
        proteinG: item.proteinG,
        carbsG: item.carbsG,
        fatG: item.fatG,
        quantity: 1,
        source: 'manual' as const,
        imageUrl: fav.image_url,
      })),
    );
    reset();
  }

  // A recipe logs as ONE entry (its per-serving macros), not broken into
  // ingredients - unlike a favourite meal, which already stores its items
  // as separate per-item macros.
  function handleAddRecipe(recipe: UserRecipe) {
    onSave([{
      meal,
      name: recipe.name,
      serving: `${recipe.servings} serving${recipe.servings === 1 ? '' : 's'}`,
      proteinG: recipe.protein_g ?? 0,
      carbsG: recipe.carbs_g ?? 0,
      fatG: recipe.fat_g ?? 0,
      quantity: 1,
      source: 'manual',
      imageUrl: recipe.image_url,
    }]);
    reset();
  }

  // One serving of a Meal Library recipe, logged to the meal being added to.
  function handleAddLibraryMeal(m: LibraryMeal) {
    onSave([{
      meal,
      name: m.name,
      serving: '1 serving',
      proteinG: m.content.proteinG,
      carbsG: m.content.carbsG,
      fatG: m.content.fatG,
      quantity: 1,
      source: 'manual',
      imageUrl: m.content.imageUrl ?? null,
    }]);
    setLibraryOpen(false);
    reset();
  }

  async function handleDeleteFavorite(id: string) {
    setFavorites((prev) => prev.filter((f) => f.id !== id));
    await deleteFavoriteMeal(id);
  }

  async function handleScanBarcode() {
    setError(null);
    setBusy('barcode');
    try {
      const result = await scanBarcode();
      if (!result) return;
      const product = await lookupBarcode(result.code);
      if (!product) {
        setError("Barcode not found in our database or Open Food Facts - enter it manually below, it'll help the next scan of this product too.");
        return;
      }
      setName(product.name);
      setServing(product.servingSize ?? '100g');
      if (product.kcal100g === null) {
        setError(`Found "${product.name}" but it has no nutrition data on Open Food Facts yet - fill in the macros below.`);
        return;
      }
      // Product data is per-100g - without a real serving size we show the
      // 100g figures as-is rather than guessing a portion.
      setProtein(String(product.protein100g ?? 0));
      setCarbs(String(product.carbs100g ?? 0));
      setFat(String(product.fat100g ?? 0));
    } finally {
      setBusy(null);
    }
  }

  async function handlePhotoChosen(file: File) {
    setError(null);
    setBusy('photo');
    try {
      const analysis = await analyzeFoodPhoto(file, 'food');
      if (!analysis.items.length) {
        setError('Could not identify any food in that photo');
        return;
      }
      if (analysis.items.length === 1) {
        const i = analysis.items[0];
        setName(i.name);
        setServing(`${Math.round(i.estimatedGrams)}g`);
        setProtein(String(Math.round(i.proteinG)));
        setCarbs(String(Math.round(i.carbsG)));
        setFat(String(Math.round(i.fatG)));
        if (analysis.confidence === 'low') setError(`Low-confidence estimate: ${analysis.notes}`);
        return;
      }
      // Multiple distinct items - show each as its own line to tick off,
      // edit or swap for a suggested alternative, rather than silently
      // collapsing them into one combined entry.
      setReviewItems(
        analysis.items.map((i, idx) => ({
          tempId: `${Date.now()}-${idx}`,
          included: true,
          name: i.name,
          grams: Math.round(i.estimatedGrams),
          quantity: 1,
          proteinG: Math.round(i.proteinG),
          carbsG: Math.round(i.carbsG),
          fatG: Math.round(i.fatG),
          alternatives: i.alternatives,
          recalculating: false,
        })),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Photo analysis failed');
    } finally {
      setBusy(null);
    }
  }

  async function handleVoiceTap() {
    setError(null);
    if (voiceState === 'listening') {
      setVoiceState('processing');
      try {
        const transcript = await stopVoiceListening();
        if (!transcript.trim()) {
          setError("Didn't catch that - try again");
          return;
        }
        const est = await estimateFoodText(transcript);
        if (est.recognized) {
          // "pint of Carlton Draught" -> identified and calculated -> log
          // it directly, same as the user described wanting.
          onSave([{
            meal,
            name: est.name,
            serving: `${Math.round(est.estimatedGrams)}g`,
            proteinG: Math.round(est.proteinG),
            carbsG: Math.round(est.carbsG),
            fatG: Math.round(est.fatG),
            quantity: 1,
            source: 'voice',
          }]);
          reset();
        } else {
          setName(transcript);
          setError("Couldn't identify that from your description - edit the fields below and add it manually.");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Voice logging failed');
      } finally {
        setVoiceState('idle');
      }
      return;
    }

    const granted = await requestSpeechPermission();
    if (!granted) {
      setError('Enable microphone and speech recognition for SOMAXX in iOS Settings');
      return;
    }
    try {
      await startVoiceListening();
      setVoiceState('listening');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not start listening');
    }
  }

  function updateReviewItem(tempId: string, patch: Partial<ReviewItem>) {
    setReviewItems((prev) => prev && prev.map((it) => (it.tempId === tempId ? { ...it, ...patch } : it)));
  }

  async function recalculateReviewItem(tempId: string) {
    const item = reviewItems?.find((it) => it.tempId === tempId);
    if (!item) return;
    updateReviewItem(tempId, { recalculating: true });
    try {
      const est = await estimateFoodText(`${item.name}, ${item.grams}g`);
      updateReviewItem(tempId, {
        name: est.recognized ? est.name : item.name,
        grams: est.recognized ? Math.round(est.estimatedGrams) : item.grams,
        proteinG: Math.round(est.proteinG),
        carbsG: Math.round(est.carbsG),
        fatG: Math.round(est.fatG),
        recalculating: false,
      });
    } catch {
      updateReviewItem(tempId, { recalculating: false });
    }
  }

  function handleConfirmReview() {
    if (!reviewItems) return;
    const included = reviewItems.filter((it) => it.included && it.name.trim());
    if (included.length === 0) return;
    onSave(
      included.map((it) => ({
        meal,
        name: it.name.trim(),
        serving: `${it.grams}g`,
        proteinG: it.proteinG,
        carbsG: it.carbsG,
        fatG: it.fatG,
        quantity: it.quantity,
        source: 'photo' as const,
      })),
    );
    reset();
  }

  if (reviewItems) {
    const includedCount = reviewItems.filter((it) => it.included).length;
    return (
      <Modal open={open} onClose={handleClose} title="Review items">
        <div className="macro-meal-picker">
          {MEALS.map((m) => (
            <button key={m.id} type="button" className={meal === m.id ? 'on' : ''} onClick={() => setMeal(m.id)}>
              {m.label}
            </button>
          ))}
        </div>
        <div className="macro-review-list">
          {reviewItems.map((item) => (
            <div className="macro-review-item" key={item.tempId}>
              <button
                className={`macro-review-check${item.included ? ' on' : ''}`}
                aria-label={item.included ? 'Exclude item' : 'Include item'}
                onClick={() => updateReviewItem(item.tempId, { included: !item.included })}
              >
                {item.included && <svg viewBox="0 0 24 24"><path d="M20 6 9 17l-5-5" /></svg>}
              </button>
              <div className="macro-review-main">
                <input
                  className="macro-review-name"
                  value={item.name}
                  onChange={(e) => updateReviewItem(item.tempId, { name: e.target.value })}
                />
                {item.alternatives.length > 0 && (
                  <div className="macro-review-alts">
                    {item.alternatives.map((alt) => (
                      <button key={alt} type="button" onClick={() => { updateReviewItem(item.tempId, { name: alt }); recalculateReviewItem(item.tempId); }}>
                        {alt}
                      </button>
                    ))}
                  </div>
                )}
                <div className="macro-review-row2">
                  <input
                    className="macro-review-grams"
                    type="number"
                    value={item.grams}
                    onChange={(e) => updateReviewItem(item.tempId, { grams: parseInt(e.target.value, 10) || 0 })}
                  />
                  <span>g</span>
                  <span style={{ marginLeft: 4 }}>&times;</span>
                  <input
                    className="macro-review-grams"
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => updateReviewItem(item.tempId, { quantity: parseFloat(e.target.value) || 1 })}
                  />
                  <button className="macro-review-recalc" disabled={item.recalculating} onClick={() => recalculateReviewItem(item.tempId)}>
                    {item.recalculating ? '…' : 'Recalculate'}
                  </button>
                </div>
                <div className="macros" style={{ marginTop: 6 }}>
                  <span><b>{Math.round(kcalForMacros(item.proteinG, item.carbsG, item.fatG) * item.quantity)}</b> kcal</span>
                  <span>P <b>{Math.round(item.proteinG * item.quantity)}g</b></span>
                  <span>C <b>{Math.round(item.carbsG * item.quantity)}g</b></span>
                  <span>F <b>{Math.round(item.fatG * item.quantity)}g</b></span>
                </div>
              </div>
            </div>
          ))}
        </div>
        <button className="btn btn-primary" disabled={includedCount === 0} onClick={handleConfirmReview}>
          Add {includedCount} item{includedCount === 1 ? '' : 's'}
        </button>
        <button className="btn btn-ghost" style={{ marginTop: 8 }} onClick={() => setReviewItems(null)}>Back</button>
      </Modal>
    );
  }

  return (
    <Modal open={open} onClose={handleClose} title="Log food">
      <div className="macro-meal-picker">
        {MEALS.map((m) => (
          <button key={m.id} type="button" className={meal === m.id ? 'on' : ''} onClick={() => setMeal(m.id)}>
            {m.label}
          </button>
        ))}
      </div>

      {(favorites.length > 0 || recipes.length > 0) && (
        <>
          <div className="macro-scan-divider" style={{ marginTop: 0 }}>favourites</div>
          {(mealFavorites.length > 0 || favoriteRecipes.length > 0) && (
            <div className="macro-favorites-row">
              {mealFavorites.map((fav) => (
                <div className="macro-favorite-chip" key={fav.id}>
                  <button type="button" onClick={() => handleAddFavorite(fav)}>{fav.name}</button>
                  <span role="button" aria-label="Delete favorite" onClick={() => handleDeleteFavorite(fav.id)}>
                    <svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6 6 18" /></svg>
                  </span>
                </div>
              ))}
              {favoriteRecipes.map((r) => (
                <div className="macro-favorite-chip" key={r.id}>
                  <button type="button" onClick={() => handleAddRecipe(r)}>&#9733; {r.name}</button>
                </div>
              ))}
            </div>
          )}
          {mealFavorites.length === 0 && favoriteRecipes.length === 0 && (
            <div className="macro-kcal-hint" style={{ marginTop: 0 }}>
              No {MEALS.find((m) => m.id === meal)!.label.toLowerCase()} favourites yet.
            </div>
          )}
          <button type="button" className="btn btn-ghost" style={{ marginBottom: 14 }} onClick={() => setFavoritesExpanded(true)}>
            &#9733; See all favourites &amp; saved recipes
          </button>
        </>
      )}
      <button type="button" className="btn btn-ghost add-food-library-btn" onClick={() => setLibraryOpen(true)}>
        <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 19.5V5a2 2 0 0 1 2-2h14v15H6.5A2.5 2.5 0 0 0 4 20.5 2.5 2.5 0 0 0 6.5 23H20" /></svg>
        Browse the Meal Library
      </button>
      {libraryOpen && (
        <LibraryScreenLazy
          open
          mode="nutrition"
          logTo={{ label: MEALS.find((m) => m.id === meal)!.label, onLog: handleAddLibraryMeal }}
          onClose={() => setLibraryOpen(false)}
        />
      )}
      <FavoritesOverlay
        open={favoritesExpanded}
        favorites={favorites}
        recipes={recipes}
        onClose={() => setFavoritesExpanded(false)}
        onSelect={(fav) => {
          handleAddFavorite(fav);
          setFavoritesExpanded(false);
        }}
        onDelete={handleDeleteFavorite}
        onSelectRecipe={(recipe) => {
          handleAddRecipe(recipe);
          setFavoritesExpanded(false);
        }}
      />

      <div className="macro-scan-row">
        <button type="button" className="macro-scan-btn" disabled={!barcodeScanAvailableOnPlatform() || busy !== null} onClick={handleScanBarcode}>
          <svg viewBox="0 0 24 24"><path d="M4 7V5a1 1 0 0 1 1-1h2M4 17v2a1 1 0 0 0 1 1h2M20 7V5a1 1 0 0 0-1-1h-2M20 17v2a1 1 0 0 1-1 1h-2M7 8v8M10 8v8M13 8v8M16 8v8" /></svg>
          {busy === 'barcode' ? 'Scanning…' : 'Scan barcode'}
        </button>
        <button type="button" className="macro-scan-btn" disabled={busy !== null} onClick={() => fileInputRef.current?.click()}>
          <svg viewBox="0 0 24 24"><path d="M4 8a2 2 0 0 1 2-2h1l1.5-2h7L17 6h1a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8Z" /><circle cx="12" cy="13" r="3.5" /></svg>
          {busy === 'photo' ? 'Analyzing…' : 'Scan photo'}
        </button>
        {speechToTextAvailableOnPlatform() && (
          <button
            type="button"
            className={`macro-scan-btn${voiceState === 'listening' ? ' listening' : ''}`}
            disabled={busy !== null || voiceState === 'processing'}
            onClick={handleVoiceTap}
          >
            <svg viewBox="0 0 24 24"><rect x="9" y="3" width="6" height="11" rx="3" /><path d="M5 11a7 7 0 0 0 14 0M12 18v3" /></svg>
            {voiceState === 'listening' ? 'Tap to stop' : voiceState === 'processing' ? 'Thinking…' : 'Voice'}
          </button>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          style={{ display: 'none' }}
          onChange={(e) => {
            const file = e.target.files?.[0];
            e.target.value = '';
            if (file) handlePhotoChosen(file);
          }}
        />
      </div>
      {error && <div className="macro-kcal-hint" style={{ color: 'var(--danger)' }}>{error}</div>}

      <div className="macro-scan-divider">or enter manually</div>

      <div className="field">
        <label htmlFor="macroFoodName">Food</label>
        <input
          id="macroFoodName"
          type="text"
          placeholder="e.g. Grilled chicken breast"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onFocus={(e) => {
            e.target.blur();
            setSearchOpen(true);
          }}
          autoComplete="off"
        />
      </div>
      <FoodSearchOverlay
        open={searchOpen}
        userId={userId}
        initialQuery={name}
        onClose={() => setSearchOpen(false)}
        onSelect={applySuggestion}
      />
      <div className="macro-grid2">
        <div className="field">
          <label htmlFor="macroFoodServing">Serving (per unit)</label>
          <input id="macroFoodServing" type="text" placeholder="e.g. 200g" value={serving} onChange={(e) => setServing(e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="macroQty">Quantity</label>
          <div className="macro-qty-stepper">
            <button type="button" onClick={() => setQuantity((q) => Math.max(1, q - 1))}>&minus;</button>
            <input
              id="macroQty"
              type="number"
              min="1"
              inputMode="decimal"
              value={quantity}
              onChange={(e) => setQuantity(parseFloat(e.target.value) || 1)}
            />
            <button type="button" onClick={() => setQuantity((q) => q + 1)}>+</button>
          </div>
        </div>
      </div>
      <div className="macro-grid3">
        <div className="field">
          <label htmlFor="macroP">Protein (g)</label>
          <input id="macroP" type="number" min="0" inputMode="decimal" placeholder="0" value={protein} onChange={(e) => setProtein(e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="macroC">Carbs (g)</label>
          <input id="macroC" type="number" min="0" inputMode="decimal" placeholder="0" value={carbs} onChange={(e) => setCarbs(e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="macroF">Fat (g)</label>
          <input id="macroF" type="number" min="0" inputMode="decimal" placeholder="0" value={fat} onChange={(e) => setFat(e.target.value)} />
        </div>
      </div>
      <div className="macro-kcal-hint">
        {quantity !== 1 ? <>{perUnitKcalPreview.toLocaleString()} kcal per unit &times; {quantity} &rarr; </> : '4 kcal/g protein + carbs, 9 kcal/g fat → '}
        <b>{kcalPreview.toLocaleString()} kcal</b> total
      </div>
      <button className="btn btn-primary" disabled={!name.trim()} onClick={handleSave}>Add to log</button>
      <button className="btn btn-ghost" style={{ marginTop: 8 }} disabled={!name.trim() || savingFavorite} onClick={handleSaveAsFavorite}>
        {savingFavorite ? 'Saving…' : '☆ Save as favorite'}
      </button>
      <button className="btn btn-ghost" style={{ marginTop: 8 }} onClick={handleClose}>Cancel</button>
    </Modal>
  );
}
