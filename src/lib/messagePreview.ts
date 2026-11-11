import { decodeProgramMessage } from './programShare';
import { decodeActivityMessage } from './activityShare';
import { decodeRecipeMessage } from './recipeShare';
import { imagePathFromMessage } from './chatImage';

// A human label for a message's raw text, for the conversation list preview
// - mirrors the notify-message edge function's previewForMessage so the
// inbox and the lock-screen notification never disagree about what a
// shared-content message says.
export function messagePreview(text: string): string {
  if (imagePathFromMessage(text)) return 'Photo';
  const program = decodeProgramMessage(text);
  if (program) return `Shared a program: ${program.name}`;
  const activity = decodeActivityMessage(text);
  if (activity) return `Shared an activity: ${activity.name}`;
  const recipe = decodeRecipeMessage(text);
  if (recipe) return `Shared a recipe: ${recipe.name}`;
  return text;
}
