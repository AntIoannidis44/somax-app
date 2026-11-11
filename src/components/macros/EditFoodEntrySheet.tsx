import { useEffect, useState } from 'react';
import { Modal } from '../layout/Modal';
import { estimateFoodText } from '../../lib/foodText';
import type { FoodLogEntry } from './macros';

interface EditFoodEntrySheetProps {
  entry: FoodLogEntry | null;
  onClose: () => void;
  onSave: (fields: { name: string; serving: string; proteinG: number; carbsG: number; fatG: number; quantity: number }) => void;
  onDelete: () => void;
  // Lets an already-logged item (one you added yourself, or one a
  // favourite/recipe that didn't exist yet when it was logged) be saved
  // as a favourite retroactively, not just while first typing it in.
  onSaveAsFavorite: (fields: { name: string; serving: string; proteinG: number; carbsG: number; fatG: number }) => void;
  // Shares this log entry as a meal - to the Nutrition feed, to a friend, or
  // as a copyable link, via the same ShareRecipeSheet a saved recipe uses.
  onShare: (fields: { name: string; serving: string; kcal: number; proteinG: number; carbsG: number; fatG: number }) => void;
}

export function EditFoodEntrySheet({ entry, onClose, onSave, onDelete, onSaveAsFavorite, onShare }: EditFoodEntrySheetProps) {
  const [name, setName] = useState('');
  const [serving, setServing] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');
  const [recalculating, setRecalculating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (entry) {
      setName(entry.name);
      setServing(entry.serving ?? '');
      setQuantity(entry.quantity);
      setProtein(String(entry.protein_g));
      setCarbs(String(entry.carbs_g));
      setFat(String(entry.fat_g));
      setError(null);
    }
  }, [entry]);

  const perUnitKcal = Math.round((parseFloat(protein) || 0) * 4 + (parseFloat(carbs) || 0) * 4 + (parseFloat(fat) || 0) * 9);
  const totalKcal = Math.round(perUnitKcal * quantity);

  async function handleRecalculate() {
    if (!name.trim()) return;
    setError(null);
    setRecalculating(true);
    try {
      const est = await estimateFoodText(serving.trim() ? `${name.trim()}, ${serving.trim()}` : name.trim());
      if (!est.recognized) {
        setError("Couldn't recalculate - not recognized as a food or drink. You can still edit the macros manually.");
        return;
      }
      setName(est.name);
      setServing(`${Math.round(est.estimatedGrams)}g`);
      setProtein(String(Math.round(est.proteinG)));
      setCarbs(String(Math.round(est.carbsG)));
      setFat(String(Math.round(est.fatG)));
      if (est.confidence === 'low') setError(`Low-confidence estimate: ${est.notes}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Recalculate failed');
    } finally {
      setRecalculating(false);
    }
  }

  function handleSave() {
    if (!name.trim()) return;
    onSave({
      name: name.trim(),
      serving: serving.trim(),
      proteinG: parseFloat(protein) || 0,
      carbsG: parseFloat(carbs) || 0,
      fatG: parseFloat(fat) || 0,
      quantity: quantity > 0 ? quantity : 1,
    });
  }

  function handleSaveAsFavorite() {
    if (!name.trim()) return;
    onSaveAsFavorite({
      name: name.trim(),
      serving: serving.trim() || '1 serving',
      proteinG: parseFloat(protein) || 0,
      carbsG: parseFloat(carbs) || 0,
      fatG: parseFloat(fat) || 0,
    });
  }

  function handleShare() {
    if (!name.trim()) return;
    onShare({
      name: name.trim(),
      serving: serving.trim() || '1 serving',
      kcal: totalKcal,
      proteinG: parseFloat(protein) || 0,
      carbsG: parseFloat(carbs) || 0,
      fatG: parseFloat(fat) || 0,
    });
  }

  return (
    <Modal open={entry !== null} onClose={onClose} title="Edit food">
      <div className="field">
        <label htmlFor="editFoodName">Food</label>
        <input id="editFoodName" type="text" value={name} onChange={(e) => setName(e.target.value)} />
      </div>
      <button className="btn btn-ghost btn-sm" disabled={recalculating || !name.trim()} onClick={handleRecalculate} style={{ marginBottom: 14 }}>
        {recalculating ? 'Recalculating…' : 'Recalculate macros from name'}
      </button>
      {error && <div className="macro-kcal-hint" style={{ color: 'var(--danger)', marginTop: -6 }}>{error}</div>}

      <div className="macro-grid2">
        <div className="field">
          <label htmlFor="editFoodServing">Serving (per unit)</label>
          <input id="editFoodServing" type="text" value={serving} onChange={(e) => setServing(e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="editQty">Quantity</label>
          <div className="macro-qty-stepper">
            <button type="button" onClick={() => setQuantity((q) => Math.max(1, q - 1))}>&minus;</button>
            <input
              id="editQty"
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
          <label htmlFor="editP">Protein (g)</label>
          <input id="editP" type="number" min="0" inputMode="decimal" value={protein} onChange={(e) => setProtein(e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="editC">Carbs (g)</label>
          <input id="editC" type="number" min="0" inputMode="decimal" value={carbs} onChange={(e) => setCarbs(e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="editF">Fat (g)</label>
          <input id="editF" type="number" min="0" inputMode="decimal" value={fat} onChange={(e) => setFat(e.target.value)} />
        </div>
      </div>
      <div className="macro-kcal-hint">
        {quantity !== 1 ? <>{perUnitKcal.toLocaleString()} kcal per unit &times; {quantity} &rarr; </> : null}
        <b>{totalKcal.toLocaleString()} kcal</b> total
      </div>

      <button className="btn btn-primary" disabled={!name.trim()} onClick={handleSave}>Save changes</button>
      <button className="btn btn-ghost" style={{ marginTop: 8 }} disabled={!name.trim()} onClick={handleSaveAsFavorite}>
        &#9733; Save as favourite
      </button>
      <button className="btn btn-ghost" style={{ marginTop: 8 }} disabled={!name.trim()} onClick={handleShare}>
        Share meal
      </button>
      <button className="btn btn-danger-ghost" style={{ marginTop: 8 }} onClick={onDelete}>Remove from log</button>
      <button className="btn btn-ghost" style={{ marginTop: 8 }} onClick={onClose}>Cancel</button>
    </Modal>
  );
}
