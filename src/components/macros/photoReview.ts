import { kcalFromNutrients } from './macros';

// Photo-scan review helpers (2026-11-21). Pure maths - no AI calls - so changing a portion is instant and free.

// What the scan said for its estimated portion: every value is for `grams`.
export interface PortionBase {
  grams: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  kcal: number;
  alcoholG: number;
  fiberG: number;
  sugarG: number;
}

export type Scaled = Omit<PortionBase, 'grams'>;

// Rescale the scan's values to a new portion. The biggest error in photo scans is portion size, not what the
// food is - so when the user corrects the grams, everything (calories included) follows exactly.
export function scaleToGrams(base: PortionBase, grams: number): Scaled {
  const f = base.grams > 0 && grams > 0 ? grams / base.grams : 0;
  const r1 = (v: number) => Math.round(v * f * 10) / 10;
  return {
    proteinG: r1(base.proteinG),
    carbsG: r1(base.carbsG),
    fatG: r1(base.fatG),
    kcal: Math.round(base.kcal * f),
    alcoholG: r1(base.alcoholG),
    fiberG: r1(base.fiberG),
    sugarG: r1(base.sugarG),
  };
}

export const CONSISTENCY_TOLERANCE = 0.1;

// Does the scan's calorie figure agree with its own breakdown (protein 4, carbs 4, fat 9, fibre 2, alcohol 7)?
// Carbs are sometimes reported as TOTAL carbs (fibre included, US-label style) - that reading is accepted too,
// so a banana (105 kcal, 27 g total carbs incl. 3 g fibre) isn't flagged.
export function checkConsistency(v: Scaled): { ok: boolean; kcal: number; fromNutrients: number } {
  const n = kcalFromNutrients({ proteinG: v.proteinG, carbsG: v.carbsG, fatG: v.fatG, fiberG: v.fiberG, alcoholG: v.alcoholG });
  const totalCarbReading = Math.max(0, n - 6 * (v.fiberG || 0)); // carbs counted fibre at 4 + fibre added at 2
  const close = (a: number, b: number) => Math.abs(a - b) <= Math.max(10, CONSISTENCY_TOLERANCE * Math.max(a, b));
  return { ok: close(v.kcal, n) || close(v.kcal, totalCarbReading), kcal: v.kcal, fromNutrients: n };
}

// Why an item needs a second look (null = fine).
export function checkReason(
  v: Scaled,
  confidence: 'low' | 'medium' | 'high' | undefined,
  alternatives: string[],
): string | null {
  if (confidence === 'low') return alternatives.length ? 'Not sure what this is - tap the right one below' : 'Not sure what this is - check the name';
  const c = checkConsistency(v);
  if (!c.ok) return `Calories (${c.kcal}) don't match its breakdown (${c.fromNutrients}) - check the amount or tap Recalculate`;
  return null;
}
