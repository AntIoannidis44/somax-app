import type { IconName } from './icons';

export interface WorkoutType {
  id: string;
  label: string;
  icon: IconName;
  // Reuses the same 6-color attribute palette Profile's stat bars already
  // use (see --stat-* in app.css), rather than inventing a second color
  // system - a workout-type badge and an attribute bar now read as the
  // same visual language wherever they show up.
  colorVar: string;
}

// Shared list: the post composer's type picker, the feed's filter tabs, and
// (later) the league's per-type breakdown all read from this one list.
export const WORKOUT_TYPES: WorkoutType[] = [
  { id: 'fitness', label: 'Fitness', icon: 'fitness', colorVar: '--stat-vitality' },
  { id: 'gym', label: 'Gym', icon: 'dumbbell', colorVar: '--stat-strength' },
  { id: 'run', label: 'Run', icon: 'run', colorVar: '--stat-endurance' },
  { id: 'walk', label: 'Walk', icon: 'walk', colorVar: '--stat-recovery' },
  { id: 'ride', label: 'Ride', icon: 'ride', colorVar: '--stat-agility' },
  { id: 'swim', label: 'Swim', icon: 'swim', colorVar: '--stat-discipline' },
  { id: 'other', label: 'Other', icon: 'other', colorVar: '--text-faint' },
];

export function workoutTypeById(id: string | null | undefined): WorkoutType | undefined {
  return WORKOUT_TYPES.find((w) => w.id === id);
}

// Maps a HealthKit workout's activity name (see HealthPlugin.swift's
// Self.activityName) to one of our own category ids, so a Watch-synced
// activity can be tagged/attached the same way a built-in or custom
// program is, without needing its own separate category system.
export function categoryForActivityName(activityName: string): string {
  const name = activityName.toLowerCase();
  if (name.includes('run')) return 'run';
  if (name.includes('walk')) return 'walk';
  if (name.includes('cycl')) return 'ride';
  if (name.includes('swim')) return 'swim';
  if (name.includes('strength')) return 'gym';
  if (name.includes('core') || name.includes('hiit') || name.includes('cardio') || name.includes('yoga')) return 'fitness';
  return 'other';
}
