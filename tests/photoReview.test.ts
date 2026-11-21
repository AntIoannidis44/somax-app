import { describe, expect, it } from 'vitest';
import { checkConsistency, checkReason, scaleToGrams, type PortionBase } from '../src/components/macros/photoReview';

const chicken: PortionBase = { grams: 180, proteinG: 56, carbsG: 0, fatG: 6.5, kcal: 297, alcoholG: 0, fiberG: 0, sugarG: 0 };

describe('photo review: portion rescaling (no AI call)', () => {
  it('halving the grams halves everything, calories included', () => {
    expect(scaleToGrams(chicken, 90)).toMatchObject({ proteinG: 28, fatG: 3.3, kcal: 149 });
  });
  it('a beer can corrected from 330 ml to 375 ml keeps its alcohol energy', () => {
    const can: PortionBase = { grams: 330, proteinG: 1, carbsG: 10, fatG: 0, kcal: 129, alcoholG: 12.7, fiberG: 0, sugarG: 0 };
    expect(scaleToGrams(can, 375)).toMatchObject({ kcal: 147, alcoholG: 14.4 });
  });
});

describe('photo review: consistency check', () => {
  it('agrees when calories match the breakdown (incl. alcohol)', () => {
    expect(checkConsistency({ proteinG: 1, carbsG: 11, fatG: 0, kcal: 147, alcoholG: 14.5, fiberG: 0, sugarG: 0 }).ok).toBe(true);
  });
  it('accepts total-carb reporting (banana 105 kcal, 27 g carbs incl 3.1 g fibre)', () => {
    expect(checkConsistency({ proteinG: 1.3, carbsG: 27, fatG: 0.4, kcal: 105, alcoholG: 0, fiberG: 3.1, sugarG: 14 }).ok).toBe(true);
  });
  it('flags a scan that contradicts itself (300 kcal for 10 g protein / 5 g carbs / 2 g fat)', () => {
    const v = { proteinG: 10, carbsG: 5, fatG: 2, kcal: 300, alcoholG: 0, fiberG: 0, sugarG: 0 };
    expect(checkConsistency(v)).toMatchObject({ ok: false, fromNutrients: 78 });
    expect(checkReason(v, 'high', [])).toMatch(/don't match/);
  });
  it('a low-confidence item asks you to pick the right food', () => {
    expect(checkReason(scaleToGrams(chicken, 180), 'low', ['grilled chicken breast', 'turkey breast'])).toMatch(/tap the right one/);
    expect(checkReason(scaleToGrams(chicken, 180), 'high', [])).toBeNull();
  });
});
