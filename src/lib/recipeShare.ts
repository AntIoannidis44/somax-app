// Same reasoning as programShare.ts - a recipe travels inside the chat
// message itself, not as a link, since there's no web address that resolves
// inside the native app.
const PREFIX = '[recipe]';

export interface SharedRecipe {
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

export function encodeRecipeMessage(recipe: SharedRecipe): string {
  return PREFIX + JSON.stringify(recipe);
}

export function decodeRecipeMessage(text: string): SharedRecipe | null {
  if (!text.startsWith(PREFIX)) return null;
  try {
    const parsed = JSON.parse(text.slice(PREFIX.length));
    if (parsed && typeof parsed.name === 'string' && Array.isArray(parsed.ingredients)) return parsed as SharedRecipe;
  } catch {
    // Not a recipe message after all - fall through and show it as text.
  }
  return null;
}
