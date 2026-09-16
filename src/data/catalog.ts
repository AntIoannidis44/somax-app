import type {
  CatalogKey,
  CharTier,
  HairColorItem,
  CatalogItem,
  WardrobeItem,
  ShoeItem,
} from '../types';

export const CHAR_TIERS: CharTier[] = [
  { min: 1, name: 'Novice', c1: '#4f7fd4', c2: '#1c3d86' },
  { min: 6, name: 'Ascending', c1: '#2f7ff0', c2: '#0b2f8e' },
  { min: 12, name: 'Forged', c1: '#23b6c8', c2: '#124a96' },
  { min: 20, name: 'Vanguard', c1: '#e0a33c', c2: '#8a4a12' },
];

export const SKIN_TONES: string[] = ['#f6d9c0', '#e9bb97', '#cf9468', '#a86b41', '#7d4a2c', '#4e2f1d'];

export const HAIR_COLORS: HairColorItem[] = [
  { id: 'black', name: 'Black', c: '#1b1a1f' },
  { id: 'brown', name: 'Brown', c: '#4a2e1c' },
  { id: 'blonde', name: 'Blonde', c: '#d9b26a' },
  { id: 'auburn', name: 'Auburn', c: '#8a3b1e' },
  { id: 'electric', name: 'Electric', c: '#2e6cff', unlock: { level: 5 } },
  { id: 'rose', name: 'Rose', c: '#e2588c', unlock: { streak: 7 } },
  { id: 'silver', name: 'Silver', c: '#c9d0dc', unlock: { level: 12 } },
];

export const HAIR_STYLES: CatalogItem[] = [
  { id: 'short', name: 'Short' },
  { id: 'buzz', name: 'Buzz' },
  { id: 'ponytail', name: 'Ponytail' },
  { id: 'long', name: 'Long' },
  { id: 'bun', name: 'Top bun' },
  { id: 'curls', name: 'Curls' },
  { id: 'mohawk', name: 'Mohawk', unlock: { level: 10 } },
];

export const TOPS: WardrobeItem[] = [
  { id: 'tee-black', name: 'Training tee', c: '#1c1f27', style: 'tee' },
  { id: 'tee-white', name: 'Club tee', c: '#eef0f4', style: 'tee' },
  { id: 'tank-blue', name: 'Somax tank', c: '#1554e6', style: 'tank', unlock: { level: 3 } },
  { id: 'hoodie-grey', name: 'Recovery hoodie', c: '#6b7280', style: 'long', unlock: { level: 5 } },
  { id: 'comp-navy', name: 'Compression', c: '#0b2461', style: 'long', unlock: { level: 8 } },
  { id: 'jersey-league', name: 'League jersey', c: '#0f8f5c', style: 'tee', unlock: { streak: 7 } },
  { id: 'jacket-gold', name: 'Vanguard jacket', c: '#d8a23a', style: 'long', unlock: { level: 15 } },
];

export const BOTTOMS: WardrobeItem[] = [
  { id: 'shorts-black', name: 'Shorts', c: '#1c1f27', style: 'shorts' },
  { id: 'joggers-grey', name: 'Joggers', c: '#5b6270', style: 'long' },
  { id: 'leggings-navy', name: 'Leggings', c: '#0b2461', style: 'long', unlock: { level: 4 } },
  { id: 'shorts-blue', name: 'Somax shorts', c: '#1554e6', style: 'shorts', unlock: { level: 6 } },
  { id: 'track-gold', name: 'Vanguard track', c: '#c7902a', style: 'long', unlock: { level: 12 } },
];

export const SHOES: ShoeItem[] = [
  { id: 'white', name: 'Trainers', c: '#f2f3f5' },
  { id: 'black', name: 'Trainers', c: '#1c1f27' },
  { id: 'blue', name: 'Runners', c: '#1554e6', unlock: { level: 3 } },
  { id: 'red', name: 'High-tops', c: '#d4425c', unlock: { level: 7 } },
  { id: 'gold', name: 'Elite', c: '#e0b04a', unlock: { level: 15 } },
];

export const EXTRAS: CatalogItem[] = [
  { id: 'none', name: 'None' },
  { id: 'headband', name: 'Headband', unlock: { level: 3 } },
  { id: 'wristbands', name: 'Wristbands', unlock: { level: 4 } },
  { id: 'cap', name: 'Cap', unlock: { level: 5 } },
  { id: 'glasses', name: 'Shades', unlock: { level: 8 } },
  { id: 'aura', name: 'Forged aura', unlock: { level: 12 } },
];

export const CATALOG: Record<CatalogKey, CatalogItem[]> = {
  hair: HAIR_STYLES,
  hairColor: HAIR_COLORS,
  top: TOPS,
  bottom: BOTTOMS,
  shoes: SHOES,
  extra: EXTRAS,
};
