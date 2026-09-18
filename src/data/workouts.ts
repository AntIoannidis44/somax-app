import type { ExerciseDef, WorkoutDef } from '../types';

export const WORKOUTS: Record<string, WorkoutDef> = {
  push: {
    name: 'Push Day',
    duration: '50 min',
    exercises: [
      { name: 'Barbell Bench Press', sets: 4, reps: '8' },
      { name: 'Overhead Press', sets: 3, reps: '10' },
      { name: 'Incline Dumbbell Press', sets: 3, reps: '10' },
      { name: 'Triceps Pushdown', sets: 3, reps: '12' },
      { name: 'Lateral Raise', sets: 3, reps: '15' },
    ],
  },
  pull: {
    name: 'Pull Day',
    duration: '48 min',
    exercises: [
      { name: 'Deadlift', sets: 3, reps: '5' },
      { name: 'Lat Pulldown', sets: 4, reps: '10' },
      { name: 'Barbell Row', sets: 3, reps: '10' },
      { name: 'Face Pull', sets: 3, reps: '15' },
      { name: 'Bicep Curl', sets: 3, reps: '12' },
    ],
  },
  legs: {
    name: 'Leg Day',
    duration: '55 min',
    exercises: [
      { name: 'Back Squat', sets: 4, reps: '8' },
      { name: 'Romanian Deadlift', sets: 3, reps: '10' },
      { name: 'Walking Lunge', sets: 3, reps: '12/leg' },
      { name: 'Leg Curl', sets: 3, reps: '12' },
      { name: 'Calf Raise', sets: 4, reps: '15' },
    ],
  },
  cond: {
    name: 'Conditioning',
    duration: '32 min',
    exercises: [
      { name: 'Rowing Intervals', sets: 8, reps: '250m' },
      { name: 'Kettlebell Swings', sets: 4, reps: '15' },
      { name: 'Battle Ropes', sets: 4, reps: '30s' },
      { name: 'Plank Hold', sets: 3, reps: '45s' },
    ],
  },
  run: {
    name: 'Run',
    duration: '30 min',
    exercises: [
      { name: 'Warm-up jog', sets: 1, reps: '5 min' },
      { name: 'Steady-state run', sets: 1, reps: '20 min' },
      { name: 'Cool-down walk', sets: 1, reps: '5 min' },
    ],
  },
  walk: {
    name: 'Walk',
    duration: '35 min',
    exercises: [
      { name: 'Brisk walk', sets: 1, reps: '30 min' },
      { name: 'Stretch', sets: 1, reps: '5 min' },
    ],
  },
};

export function exerciseMeta(ex: ExerciseDef): string {
  const base = `${ex.sets} x ${ex.reps}`;
  return ex.weight ? `${base} @ ${ex.weight}` : base;
}

export function statBumpFor(wid: string): Partial<Record<string, number>> {
  const map: Record<string, Partial<Record<string, number>>> = {
    push: { strength: 1, endurance: 0.4 },
    pull: { strength: 1, discipline: 0.4 },
    legs: { strength: 1.2, endurance: 0.6 },
    cond: { endurance: 1.4, agility: 0.6, vitality: 0.4 },
    run: { endurance: 1.4, agility: 0.4, vitality: 0.3 },
    walk: { endurance: 0.6, recovery: 0.5, vitality: 0.3 },
  };
  // Custom/imported workouts (UUID keys) aren't in this map - give them a
  // small generic, evenly-spread bump rather than nothing at all.
  return map[wid] || { strength: 0.5, endurance: 0.5 };
}
