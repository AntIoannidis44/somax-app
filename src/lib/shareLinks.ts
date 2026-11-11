import { supabase } from './supabase';
import type { ExerciseDef } from '../types';
import type { RecipeToShare } from './recipePosts';

const SHARE_DOMAIN = 'https://somaxx.app';

export interface ShareableProgram {
  name: string;
  duration: string;
  exercises: ExerciseDef[];
  category: string;
}

export async function createShareLink(ownerId: string, program: ShareableProgram): Promise<string | null> {
  const { data, error } = await supabase
    .from('shared_programs')
    .insert({ owner_id: ownerId, name: program.name, duration: program.duration, exercises: program.exercises, category: program.category })
    .select('code')
    .single();
  if (error || !data) return null;
  return `${SHARE_DOMAIN}/p/${data.code}`;
}

export async function fetchSharedProgramByCode(code: string): Promise<ShareableProgram | null> {
  const { data, error } = await supabase
    .from('shared_programs')
    .select('name, duration, exercises, category')
    .eq('code', code)
    .maybeSingle();
  if (error || !data) return null;
  return data as ShareableProgram;
}

// Same code-link mechanism as a shared program, for a recipe - a public,
// read-only snapshot anyone with the link can open without an account.
export async function createRecipeShareLink(ownerId: string, recipe: RecipeToShare): Promise<string | null> {
  const { data, error } = await supabase
    .from('shared_recipes')
    .insert({
      owner_id: ownerId,
      name: recipe.name,
      image_url: recipe.imageUrl,
      servings: recipe.servings,
      kcal: recipe.kcal,
      protein_g: recipe.proteinG,
      carbs_g: recipe.carbsG,
      fat_g: recipe.fatG,
      ingredients: recipe.ingredients,
      steps: recipe.steps,
      source_label: recipe.sourceLabel,
    })
    .select('code')
    .single();
  if (error || !data) return null;
  return `${SHARE_DOMAIN}/r/${data.code}`;
}

export async function fetchSharedRecipeByCode(code: string): Promise<RecipeToShare | null> {
  const { data, error } = await supabase
    .from('shared_recipes')
    .select('name, image_url, servings, kcal, protein_g, carbs_g, fat_g, ingredients, steps, source_label')
    .eq('code', code)
    .maybeSingle();
  if (error || !data) return null;
  return {
    name: data.name,
    imageUrl: data.image_url,
    servings: data.servings,
    kcal: data.kcal,
    proteinG: data.protein_g,
    carbsG: data.carbs_g,
    fatG: data.fat_g,
    ingredients: data.ingredients,
    steps: data.steps,
    sourceLabel: data.source_label ?? undefined,
  };
}
