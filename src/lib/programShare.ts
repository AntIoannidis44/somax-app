import type { ExerciseDef } from '../types';

// Programs travel inside the chat message itself, not as a link. A link only
// works if the recipient can open the web address it points to, and inside
// the iOS app there is no such address - so the whole program goes in the
// message and the chat turns it into a card with Open / Add to my programs.
const PREFIX = '[program]';

export interface SharedProgram {
  name: string;
  duration: string;
  exercises: ExerciseDef[];
  category: string;
}

export function encodeProgramMessage(program: SharedProgram): string {
  return PREFIX + JSON.stringify(program);
}

export function decodeProgramMessage(text: string): SharedProgram | null {
  if (!text.startsWith(PREFIX)) return null;
  try {
    const parsed = JSON.parse(text.slice(PREFIX.length));
    if (parsed && typeof parsed.name === 'string' && Array.isArray(parsed.exercises)) return parsed as SharedProgram;
  } catch {
    // Not a program message after all - fall through and show it as text.
  }
  return null;
}
