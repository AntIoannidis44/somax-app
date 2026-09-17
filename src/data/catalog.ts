import type { CatalogKey, CharTier, HairItem, CatalogItem, OutfitItem, BodyBuild } from '../types';

export const CHAR_TIERS: CharTier[] = [
  { min: 1, name: 'Novice', c1: '#4f7fd4', c2: '#1c3d86' },
  { min: 6, name: 'Ascending', c1: '#2f7ff0', c2: '#0b2f8e' },
  { min: 12, name: 'Forged', c1: '#23b6c8', c2: '#124a96' },
  { min: 20, name: 'Vanguard', c1: '#e0a33c', c2: '#8a4a12' },
];

// index 0/1/2 map to the Light/Medium/Dark baked skin textures - the only
// real variants that exist for these models.
export const SKIN_TONES: string[] = ['#e8bd98', '#b57c50', '#6b4429'];

export const BODY_BUILDS: (CatalogItem & { id: BodyBuild })[] = [
  { id: 'regular', name: 'Regular' },
  { id: 'teen', name: 'Teen' },
  { id: 'superhero', name: 'Athletic', unlock: { level: 8 } },
];

export const HAIR_STYLES: HairItem[] = [
  { id: 'none', name: 'None' },
  { id: 'buzzed', name: 'Buzzed', base: 'male' },
  { id: 'dreads', name: 'Dreads', base: 'male' },
  { id: 'mohawk', name: 'Mohawk', base: 'male', unlock: { level: 10 } },
  { id: 'ponytail', name: 'Ponytail', base: 'male' },
  { id: 'simpleParted', name: 'Parted', base: 'male' },
  { id: 'slickBack', name: 'Slick back', base: 'male', unlock: { level: 5 } },
  { id: 'bob', name: 'Bob', base: 'female' },
  { id: 'buns', name: 'Buns', base: 'female' },
  { id: 'buzzedFemale', name: 'Buzzed', base: 'female' },
  { id: 'long', name: 'Long', base: 'female' },
  { id: 'longDreads', name: 'Long dreads', base: 'female' },
  { id: 'ponytail2', name: 'Ponytail', base: 'female', unlock: { level: 5 } },
];

export const OUTFITS: OutfitItem[] = [
  { id: 'none', name: 'Default' },
  { id: 'trainer', name: 'Trainer kit' },
  { id: 'ranger', name: 'Ranger', unlock: { level: 15 } },
];

export const CATALOG: Record<CatalogKey, CatalogItem[]> = {
  hair: HAIR_STYLES,
  outfit: OUTFITS,
  build: BODY_BUILDS,
};
