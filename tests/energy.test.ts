import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { kcalFromNutrients, resolveKcal } from '../src/components/macros/macros';

// Owner 2026-11-21: "it needs to count everything for accuracy like alcohol, energy, sugar - literally everything".
// Calories used to be rebuilt as 4P + 4C + 9F, so every logged food lost alcohol/fibre and the real label figure.
// Benchmarked on real labels (tests/fixtures/energy-labels.json, from Open Food Facts).
const F = JSON.parse(fs.readFileSync(path.join(__dirname, 'fixtures/energy-labels.json'), 'utf8'));
const median = (a: number[]) => { const s = [...a].sort((x, y) => x - y); return s[Math.floor(s.length / 2)]; };
const within = (a: number[], t: number) => a.filter((x) => x <= t).length / a.length;

describe('real energy is stored, not rebuilt from protein/carbs/fat', () => {
  it('a printed label figure is stored exactly (barcode path) for every real label', () => {
    for (const r of F.food) expect(resolveKcal({ proteinG: r.p, carbsG: r.c, fatG: r.f, fiberG: r.fib, kcal: r.k, grams: 100, kcalSource: 'label' }))
      .toEqual({ kcal: Math.round(r.k), source: 'label' });
  });
  it('an estimate figure (photo / text) is stored as given', () => {
    expect(resolveKcal({ proteinG: 0, carbsG: 4, fatG: 0, alcoholG: 16, kcal: 125, kcalSource: 'estimate' })).toEqual({ kcal: 125, source: 'estimate' });
  });
  it('impossible figures fall back to the formula (> 900 kcal per 100 g, or 0 kcal with real nutrients)', () => {
    expect(resolveKcal({ proteinG: 5, carbsG: 60, fatG: 1, kcal: 6180, grams: 100, kcalSource: 'label' }).source).toBe('formula');
    expect(resolveKcal({ proteinG: 10, carbsG: 10, fatG: 10, kcal: 0 }).source).toBe('formula');
    expect(resolveKcal({ proteinG: 0, carbsG: 0, fatG: 0, kcal: 0 })).toEqual({ kcal: 0, source: 'estimate' }); // water, black coffee
  });
});

describe('formula fallback (no figure given) matches real labels', () => {
  const err = (r: { k: number; p: number; c: number; f: number; fib: number }) =>
    Math.abs(kcalFromNutrients({ proteinG: r.p, carbsG: r.c, fatG: r.f, fiberG: r.fib }) - r.k) / r.k;
  const errOld = (r: { k: number; p: number; c: number; f: number }) => Math.abs(4 * r.p + 4 * r.c + 9 * r.f - r.k) / r.k;
  it(`2,000 real food labels: median error <= 1.5%, >= 90% within 10%, and better than the old 4/4/9`, () => {
    const e = F.food.map(err), o = F.food.map(errOld);
    expect(median(e)).toBeLessThanOrEqual(0.015);
    expect(within(e, 0.1)).toBeGreaterThanOrEqual(0.9);
    expect(median(e)).toBeLessThan(median(o));
  });
  it('real beer/wine/cider labels (complete data): median error <= 5% with alcohol at 7 kcal/g (old maths: way off)', () => {
    const calc = (r: { abv: number; p: number; c: number; f: number; fib: number }) =>
      kcalFromNutrients({ proteinG: r.p, carbsG: r.c, fatG: r.f, fiberG: r.fib, alcoholG: r.abv * 0.789 });
    const e = F.alcohol.map((r: { k: number }) => Math.abs(calc(r as never) - r.k) / r.k);
    const o = F.alcohol.map((r: { k: number; p: number; c: number; f: number }) => Math.abs(4 * r.p + 4 * r.c + 9 * r.f - r.k) / r.k);
    expect(F.alcohol.length).toBeGreaterThanOrEqual(50);
    expect(median(e)).toBeLessThanOrEqual(0.05);
    expect(median(o)).toBeGreaterThan(0.5);
  });
});

describe("the owner's real log, recalculated", () => {
  // what Somax stored -> what the drink actually contains (ml x ABV x 0.789 = grams of alcohol, 7 kcal/g)
  const drink = (ml: number, abv: number, carbs: number) => kcalFromNutrients({ proteinG: 0, carbsG: carbs, fatG: 0, alcoholG: ml * (abv / 100) * 0.789 });
  it('red wine 150 ml at 13.5%: ~128 kcal, not the 16 stored', () => expect(drink(150, 13.5, 4)).toBeGreaterThanOrEqual(120));
  it('Sol 355 ml at 4.5%: ~140 kcal, not the 60 stored', () => expect(drink(355, 4.5, 13)).toBeGreaterThanOrEqual(130));
  it('Strongbow Lower Carb 375 ml at 4.5%: ~133 kcal, not the 40 stored', () => expect(drink(375, 4.5, 10)).toBeGreaterThanOrEqual(125));
});

describe('barcode labels scale to the serving or the whole pack (2026-11-21)', () => {
  it('reads label portions', async () => {
    const { parsePortion } = await import('../src/components/macros/macros');
    expect(parsePortion('375 ml')).toEqual({ amount: 375, unit: 'ml' });
    expect(parsePortion('1 can (375 ml)')).toEqual({ amount: 375, unit: 'ml' });
    expect(parsePortion('33 cl')).toEqual({ amount: 330, unit: 'ml' });
    expect(parsePortion('1 serving (100 g)')).toEqual({ amount: 100, unit: 'g' });
    expect(parsePortion('30g')).toEqual({ amount: 30, unit: 'g' });
    expect(parsePortion('1 piece')).toBeNull();
  });
  it('a 375 ml beer can logs the whole can: label 40 kcal/100 ml -> 150 kcal, alcohol 3.55 g/100 ml -> 13.3 g', async () => {
    const { labelForPortion } = await import('../src/components/macros/macros');
    const l = labelForPortion({ kcal: 40, proteinG: 0.3, carbsG: 3, fatG: 0, alcoholG: 3.55 }, null, '375 ml');
    expect(l.serving).toBe('375 ml');
    expect(l.kcal).toBe(150);
    expect(l.alcoholG).toBe(13.3);
    expect(l.carbsG).toBe(11.3);
  });
  it('the serving size wins over the pack; no portion at all stays per 100 g', async () => {
    const { labelForPortion } = await import('../src/components/macros/macros');
    expect(labelForPortion({ kcal: 400, proteinG: 10, carbsG: 60, fatG: 12 }, '30 g', '500 g')).toMatchObject({ serving: '30 g', kcal: 120, carbsG: 18 });
    expect(labelForPortion({ kcal: 400, proteinG: 10, carbsG: 60, fatG: 12 }, null, null)).toMatchObject({ serving: '100g', kcal: 400 });
  });
});
