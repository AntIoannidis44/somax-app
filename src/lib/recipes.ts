import { supabase } from './supabase';
import { resizeToJpeg } from './chatImage';

const BUCKET = 'feed-images';
const MAX_SIDE = 1280;

export interface RecipeIngredient {
  name: string;
  amount: string;
}

export interface UserRecipe {
  id: string;
  user_id: string;
  name: string;
  image_url: string | null;
  servings: number;
  kcal: number | null;
  protein_g: number | null;
  carbs_g: number | null;
  fat_g: number | null;
  ingredients: RecipeIngredient[];
  steps: string[];
  source_label: string | null;
  source_url: string | null;
  created_at: string;
  is_favorite: boolean;
}

export async function fetchUserRecipes(userId: string): Promise<UserRecipe[]> {
  const { data, error } = await supabase
    .from('user_recipes')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) {
    console.error('[recipes] fetchUserRecipes:', error.message);
    return [];
  }
  return data as UserRecipe[];
}

export async function saveUserRecipe(
  userId: string,
  recipe: {
    name: string;
    imageUrl?: string | null;
    servings: number;
    kcal?: number | null;
    proteinG?: number | null;
    carbsG?: number | null;
    fatG?: number | null;
    ingredients: RecipeIngredient[];
    steps: string[];
    sourceLabel?: string | null;
    sourceUrl?: string | null;
    isFavorite?: boolean;
  },
): Promise<UserRecipe | null> {
  const { data, error } = await supabase
    .from('user_recipes')
    .insert({
      user_id: userId,
      name: recipe.name,
      image_url: recipe.imageUrl ?? null,
      servings: recipe.servings,
      kcal: recipe.kcal ?? null,
      protein_g: recipe.proteinG ?? null,
      carbs_g: recipe.carbsG ?? null,
      fat_g: recipe.fatG ?? null,
      ingredients: recipe.ingredients,
      steps: recipe.steps,
      source_label: recipe.sourceLabel ?? null,
      source_url: recipe.sourceUrl ?? null,
      is_favorite: recipe.isFavorite ?? false,
    })
    .select('*')
    .single();
  if (error) {
    console.error('[recipes] saveUserRecipe:', error.message);
    return null;
  }
  return data as UserRecipe;
}

export async function deleteUserRecipe(id: string): Promise<void> {
  const { error } = await supabase.from('user_recipes').delete().eq('id', id);
  if (error) console.error('[recipes] deleteUserRecipe:', error.message);
}

// For a recipe saved without a photo (an import whose page had none, or
// one created without taking a picture) - lets a photo be attached later
// instead of the recipe being stuck photo-less forever.
export async function updateUserRecipeImage(id: string, imageUrl: string): Promise<void> {
  const { error } = await supabase.from('user_recipes').update({ image_url: imageUrl }).eq('id', id);
  if (error) console.error('[recipes] updateUserRecipeImage:', error.message);
}

// Toggled from anywhere a recipe shows up - its own detail view, the My
// Recipes list, a recipe just saved from a DM - not just at save time, so
// "I got this ages ago and only now want it as a favourite" works too.
export async function setRecipeFavorite(id: string, isFavorite: boolean): Promise<void> {
  const { error } = await supabase.from('user_recipes').update({ is_favorite: isFavorite }).eq('id', id);
  if (error) console.error('[recipes] setRecipeFavorite:', error.message);
}

// Recipe photos reuse the same public feed-images bucket and resize helper
// as community post photos - a recipe's photo always ends up public the
// moment it's shared to the feed anyway, so there's no private-bucket case
// to handle here the way chat photos need.
export async function uploadRecipeImage(userId: string, file: File): Promise<string | null> {
  const blob = await resizeToJpeg(file, MAX_SIDE);
  const path = `${userId}/recipe-${crypto.randomUUID()}.jpg`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, blob, { contentType: 'image/jpeg' });
  if (error) {
    console.error('[recipes] uploadRecipeImage:', error.message);
    return null;
  }
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}
