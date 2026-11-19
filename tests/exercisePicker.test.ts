import fs from 'node:fs';
import { describe, expect, it } from 'vitest';
import { isExactCatalogName, searchExercises, type CatalogData } from '../src/lib/exerciseCatalog';

const data: CatalogData = JSON.parse(fs.readFileSync('public/data/exercise-catalog.json', 'utf8'));
const names = (r: { name: string }[]) => r.map((e) => e.name);

describe('exercise picker search', () => {
  it('word match + shorthand: "db bench" finds the dumbbell bench press first', () => {
    expect(names(searchExercises(data.exercises, 'db bench'))[0]).toBe('Dumbbell Bench Press');
  });
  it('matches other names people use (aka)', () => {
    expect(names(searchExercises(data.exercises, 'swimming prep'))).toContain('Bird Dog');
  });
  it('every word must match - no fuzzy wrong movement', () => {
    expect(names(searchExercises(data.exercises, 'incline dumbbell press'))).toContain('Incline Dumbbell Press');
    expect(names(searchExercises(data.exercises, 'incline dumbbell press'))).not.toContain('Dumbbell Bench Press');
  });
  it('filters by sport, movement and muscle', () => {
    const pull = searchExercises(data.exercises, '', { pattern: 'Pull', muscle: 'Back' });
    expect(pull.length).toBeGreaterThan(5);
    expect(pull.every((e) => e.pattern === 'Pull' && (e.primary.includes('Back') || e.secondary.includes('Back')))).toBe(true);
    const golf = searchExercises(data.exercises, '', { sport: 'Golf' });
    expect(golf.every((e) => e.sports.includes('Golf'))).toBe(true);
    expect(golf.length).toBeGreaterThan(5);
  });
  it('knows when typed text is already one of the list names', () => {
    expect(isExactCatalogName(data.exercises, 'dumbbell bench press')).toBe(true);
    expect(isExactCatalogName(data.exercises, "Nana's garden squats")).toBe(false);
  });
  it('the list has every planned movement and the facets the filters show', () => {
    expect(names(data.exercises)).toEqual(expect.arrayContaining(['Lying Toe Touch', 'Underhand Barbell Bent-over Row']));
    expect(data.sports).toEqual(expect.arrayContaining(['Gym', 'Running', 'Swimming', 'Boxing', 'AFL', 'Golf', 'Pilates']));
    expect(data.patterns).toEqual(expect.arrayContaining(['Push', 'Pull', 'Squat', 'Hinge', 'Core']));
    expect(data.muscles).toEqual(expect.arrayContaining(['Chest', 'Back', 'Glutes', 'Quads', 'Hamstrings', 'Core']));
    expect(new Set(names(data.exercises)).size).toBe(data.exercises.length);
  });
});

import { findHowToIndex } from '../src/lib/exerciseHowTo';
import { nameMatchesPicture } from '../src/lib/howtoNameMatch';
describe('a picked exercise gets the right how-to picture', () => {
  const howto = JSON.parse(fs.readFileSync('public/data/exercise-howto.json', 'utf8'));
  const planned = JSON.parse(fs.readFileSync('howto-pipeline/plan/planned_images.json', 'utf8')) as Record<string, unknown>;
  it('every list name either opens a picture whose own name it matches, or is a planned (not yet drawn) movement', () => {
    const bad: string[] = [];
    for (const e of data.exercises) {
      const i = findHowToIndex(howto.lookup, e.name);
      if (i === undefined) { if (!planned[e.name] && !Object.keys(planned).some((p) => p.replace(/\s*\([^)]*\)/g, '').trim() === e.name)) bad.push(`${e.name}: opens nothing and isn't planned`); continue; }
      const pic = howto.entries[i];
      if (!nameMatchesPicture(e.name, pic.name, pic.aka ?? [])) bad.push(`${e.name} -> ${pic.name}`);
    }
    expect(bad).toEqual([]);
  });
});
