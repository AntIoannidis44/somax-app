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
