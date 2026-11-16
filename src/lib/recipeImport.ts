import { supabase } from './supabase';
import { resizeToJpeg } from './chatImage';
import type { RecipeIngredient } from './recipes';

export interface ImportedRecipe {
  name: string;
  servings: number;
  ingredients: RecipeIngredient[];
  steps: string[];
  kcal: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  sourceLabel: string;
  // Only set for a URL import (the page's own og:image/schema.org photo,
  // extracted server-side) - a photo import's image is the photo itself,
  // handled client-side.
  imageUrl: string | null;
  // Only meaningful for a URL import: false means the page couldn't be
  // read (blocked, 404, needs JS...) and everything below - including the
  // missing image - was reconstructed from the link itself, not the real
  // page. Undefined for a photo import, where the question doesn't apply.
  fromPage?: boolean;
}

const MAX_SIDE = 1280; // a recipe card/page needs more legible detail than a food photo does

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve((reader.result as string).split(',')[1] ?? '');
    reader.onerror = () => reject(reader.error ?? new Error('Could not read image'));
    reader.readAsDataURL(blob);
  });
}

// Sends a photo of a recipe card/cookbook page to the import-recipe edge
// function's vision path (see supabase/functions/import-recipe).
export async function importRecipeFromPhoto(file: File): Promise<ImportedRecipe> {
  const blob = await resizeToJpeg(file, MAX_SIDE);
  const imageBase64 = await blobToBase64(blob);

  const { data, error } = await supabase.functions.invoke('import-recipe', {
    body: { imageBase64, mediaType: 'image/jpeg' },
  });

  if (error) throw new Error(error.message ?? 'Recipe import failed');
  if (data?.error) throw new Error(data.error);
  return data as ImportedRecipe;
}

// Sends a pasted recipe URL to the import-recipe edge function's URL path -
// it fetches the page server-side (no CORS issue there) and extracts the
// recipe, preferring the page's own schema.org/Recipe structured data.
export async function importRecipeFromUrl(url: string): Promise<ImportedRecipe> {
  const { data, error } = await supabase.functions.invoke('import-recipe', {
    body: { url },
  });

  if (error) throw new Error(error.message ?? 'Recipe import failed');
  if (data?.error) throw new Error(data.error);
  return data as ImportedRecipe;
}

export interface FoodFromLink {
  name: string;
  serving: string;
  estimatedGrams: number;
  kcal: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  // true = the numbers came from the page itself (a nutrition table/label),
  // false = estimated from what the link is about.
  fromPage: boolean;
  confidence: 'low' | 'medium' | 'high';
  sourceLabel: string;
  recognized: boolean;
}

// Log one food from any link - a menu item, product page, meal-kit or
// recipe page. Same import-recipe edge function, 'food' mode: it reads the
// page server-side (falling back to the URL itself when a site blocks it)
// and returns one serving's macros.
export async function importFoodFromUrl(url: string): Promise<FoodFromLink> {
  const { data, error } = await supabase.functions.invoke('import-recipe', {
    body: { url: normaliseUrl(url), mode: 'food' },
  });
  if (error) throw new Error(error.message ?? 'Could not read that link');
  if (data?.error) throw new Error(data.error);
  return data as FoodFromLink;
}

// People paste "mcdonalds.com.au/..." or share-sheet text with words around
// the link - pull out the URL and give it a scheme.
export function normaliseUrl(input: string): string {
  const m = input.match(/https?:\/\/\S+/i) ?? input.match(/\b[\w-]+(\.[\w-]+)+\/?\S*/);
  const raw = (m ? m[0] : input).trim().replace(/[)\].,]+$/, '');
  return /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
}
