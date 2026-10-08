import type { PostWorkout } from './social';

// A completed session shared in chat - same PostWorkout shape a feed post
// already uses (name/duration/exercises/category, plus isActivity/
// distanceMeters/route for a real Watch-synced session), so the DM card and
// the feed card render identically and both open the same full-screen
// session detail. Travels inside the message itself, same reasoning as
// programShare.ts: no in-app web address to link to.
const PREFIX = '[activity]';

export function encodeActivityMessage(activity: PostWorkout): string {
  return PREFIX + JSON.stringify(activity);
}

export function decodeActivityMessage(text: string): PostWorkout | null {
  if (!text.startsWith(PREFIX)) return null;
  try {
    const parsed = JSON.parse(text.slice(PREFIX.length));
    if (parsed && typeof parsed.name === 'string' && Array.isArray(parsed.exercises)) return parsed as PostWorkout;
  } catch {
    // Not an activity message after all - fall through and show it as text.
  }
  return null;
}
