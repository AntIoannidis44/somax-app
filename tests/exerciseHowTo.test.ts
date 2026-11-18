import { describe, expect, it } from 'vitest';
import { candidates, findHowToIndex } from '../src/lib/exerciseHowTo';

describe('how-to name matcher', () => {
  const lookup: Record<string, number> = {
    'cable fly': 66,
    'cable fly low to high': -1, // checked: no picture shows the low-to-high fly
    'bench press': 139,
    'dumbbell bench press': 3,
  };

  it('finds exact and note-stripped names', () => {
    expect(findHowToIndex(lookup, 'Bench Press')).toBe(139);
    expect(findHowToIndex(lookup, 'Bench press (drop set)')).toBe(139);
    expect(findHowToIndex(lookup, 'Cable Fly, light')).toBe(66);
  });

  it('a blocked name never falls back to a shorter, different movement', () => {
    expect(candidates('Cable Fly (low to high)')).toContain('cable fly');
    expect(findHowToIndex(lookup, 'Cable Fly (low to high)')).toBeUndefined();
  });

  it('unknown names open nothing', () => {
    expect(findHowToIndex(lookup, 'Toe touches')).toBeUndefined();
  });
});
