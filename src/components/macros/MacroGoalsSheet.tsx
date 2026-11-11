import { useEffect, useState } from 'react';
import { Modal } from '../layout/Modal';
import type { NutritionGoals } from './macros';

interface MacroGoalsSheetProps {
  open: boolean;
  onClose: () => void;
  goals: NutritionGoals;
  onSave: (goals: { maintenanceKcal: number; proteinG: number; carbsG: number; fatG: number }) => void;
  onEditWeightGoal: () => void;
}

export function MacroGoalsSheet({ open, onClose, goals, onSave, onEditWeightGoal }: MacroGoalsSheetProps) {
  const [maint, setMaint] = useState(String(goals.maintenance_kcal));
  const [protein, setProtein] = useState(String(goals.protein_g));
  const [carbs, setCarbs] = useState(String(goals.carbs_g));
  const [fat, setFat] = useState(String(goals.fat_g));

  useEffect(() => {
    if (open) {
      setMaint(String(goals.maintenance_kcal));
      setProtein(String(goals.protein_g));
      setCarbs(String(goals.carbs_g));
      setFat(String(goals.fat_g));
    }
  }, [open, goals]);

  function handleSave() {
    onSave({
      maintenanceKcal: parseInt(maint, 10) || goals.maintenance_kcal,
      proteinG: parseInt(protein, 10) || 0,
      carbsG: parseInt(carbs, 10) || 0,
      fatG: parseInt(fat, 10) || 0,
    });
  }

  return (
    <Modal open={open} onClose={onClose} title="Nutrition targets">
      <div className="field">
        <label htmlFor="macroMaint">Maintenance calories (kcal/day at current activity, before any deficit/surplus)</label>
        <input id="macroMaint" type="number" inputMode="numeric" value={maint} onChange={(e) => setMaint(e.target.value)} />
      </div>

      <div className="setting-row" style={{ padding: '10px 0' }}>
        <div>
          <div className="setting-title">Weight goal</div>
          <div className="setting-sub">Your calorie goal is calculated from this, not typed in directly</div>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={onEditWeightGoal}>
          Edit
        </button>
      </div>

      <div className="macro-sheet-divider" />

      <div className="macro-goal-row">
        <span className="lbl"><i className="macro-sw" style={{ background: 'var(--macro-protein)' }} />Protein (g)</span>
        <input type="number" inputMode="numeric" value={protein} onChange={(e) => setProtein(e.target.value)} />
      </div>
      <div className="macro-goal-row">
        <span className="lbl"><i className="macro-sw" style={{ background: 'var(--macro-carbs)' }} />Carbs (g)</span>
        <input type="number" inputMode="numeric" value={carbs} onChange={(e) => setCarbs(e.target.value)} />
      </div>
      <div className="macro-goal-row">
        <span className="lbl"><i className="macro-sw" style={{ background: 'var(--macro-fat)' }} />Fat (g)</span>
        <input type="number" inputMode="numeric" value={fat} onChange={(e) => setFat(e.target.value)} />
      </div>

      <button className="btn btn-primary" style={{ marginTop: 14 }} onClick={handleSave}>Save</button>
      <button className="btn btn-ghost" style={{ marginTop: 8 }} onClick={onClose}>Cancel</button>
    </Modal>
  );
}
