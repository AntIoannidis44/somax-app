import { createPost, type CommunityPost } from './social';
import type { ExerciseDef } from '../types';

export interface ProgramToShare {
  name: string;
  duration: string;
  category: string;
  exercises: ExerciseDef[];
}

// A program post shares a routine for others to add. Older program posts
// predate the isProgram flag, so they're recognised by their caption.
export function isProgramPost(p: CommunityPost): boolean {
  if (!p.workout || p.workout.isActivity) return false;
  return !!p.workout.isProgram || /^Sharing my .+ program$/.test(p.text ?? '');
}

export async function shareProgramToFeed(
  userId: string,
  name: string,
  program: ProgramToShare,
  caption?: string,
  visibility: 'public' | 'friends' = 'public',
): Promise<void> {
  await createPost(userId, name, caption?.trim() || `Sharing my ${program.name} program`, program.category, null, {
    name: program.name,
    duration: program.duration,
    category: program.category,
    exercises: program.exercises,
    isProgram: true,
  }, null, null, visibility);
}
