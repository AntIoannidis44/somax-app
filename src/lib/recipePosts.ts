import { createPost, type CommunityPost } from './social';

export interface RecipeToShare {
  name: string;
  imageUrl: string | null;
  servings: number;
  kcal: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  ingredients: { name: string; amount: string }[];
  steps: string[];
  sourceLabel?: string;
}

// A recipe post shares a favourite meal to the Nutrition feed. Mirrors
// isProgramPost's reasoning in programPosts.ts - the content type lives
// inside the shared workout JSONB blob, not a separate column.
export function isRecipePost(p: CommunityPost): boolean {
  return !!p.workout?.isRecipe;
}

// Rebuilds a shareable snapshot from a feed post's own workout blob, for
// re-sharing someone else's recipe post (the feed card's Share button).
export function recipeFromPost(p: CommunityPost): RecipeToShare | null {
  const w = p.workout;
  if (!w?.isRecipe) return null;
  return {
    name: w.name,
    imageUrl: p.image_url,
    servings: w.servings ?? 1,
    kcal: w.kcal ?? 0,
    proteinG: w.proteinG ?? 0,
    carbsG: w.carbsG ?? 0,
    fatG: w.fatG ?? 0,
    ingredients: w.ingredients ?? [],
    steps: w.steps ?? [],
    sourceLabel: w.sourceLabel,
  };
}

export async function shareRecipeToFeed(
  userId: string,
  name: string,
  recipe: RecipeToShare,
  caption?: string,
  visibility: 'public' | 'friends' = 'public',
  // Extra photos beyond recipe.imageUrl (which stays the cover/first image)
  // - a meal that started with no photo at all (shared straight from the
  // nutrition log) can pick up one or several here.
  extraImageUrls?: string[],
): Promise<void> {
  const allImages = [recipe.imageUrl, ...(extraImageUrls ?? [])].filter((u): u is string => !!u);
  await createPost(
    userId,
    name,
    caption?.trim() || `Shared ${recipe.name}`,
    null,
    allImages[0] ?? null,
    {
      name: recipe.name,
      duration: `${recipe.servings} serving${recipe.servings === 1 ? '' : 's'}`,
      category: 'nutrition',
      exercises: [],
      isRecipe: true,
      servings: recipe.servings,
      kcal: recipe.kcal,
      proteinG: recipe.proteinG,
      carbsG: recipe.carbsG,
      fatG: recipe.fatG,
      ingredients: recipe.ingredients,
      steps: recipe.steps,
      sourceLabel: recipe.sourceLabel,
    },
    null,
    null,
    visibility,
    allImages.length > 1 ? allImages.slice(1) : null,
  );
}
