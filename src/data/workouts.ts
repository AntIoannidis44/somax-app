import type { ExerciseDef, WorkoutDef } from '../types';
import { expandSets } from '../lib/workoutSets';

export const WORKOUTS: Record<string, WorkoutDef> = {
  push: {
    category: 'gym',
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
    category: 'gym',
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
    category: 'gym',
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
    category: 'fitness',
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
    category: 'run',
    name: 'Run',
    duration: '30 min',
    exercises: [
      { name: 'Warm-up jog', sets: 1, reps: '5 min' },
      { name: 'Steady-state run', sets: 1, reps: '20 min' },
      { name: 'Cool-down walk', sets: 1, reps: '5 min' },
    ],
  },
  walk: {
    category: 'walk',
    name: 'Walk',
    duration: '35 min',
    exercises: [
      { name: 'Brisk walk', sets: 1, reps: '30 min' },
      { name: 'Stretch', sets: 1, reps: '5 min' },
    ],
  },
  swim: {
    category: 'swim',
    name: 'Swim',
    duration: '40 min',
    exercises: [
      { name: 'Warm-up swim', sets: 1, reps: '5 min', distance: '200m' },
      { name: 'Main set intervals', sets: 6, reps: '', distance: '100m' },
      { name: 'Cool-down swim', sets: 1, reps: '5 min', distance: '150m' },
    ],
  },
  ride: {
    category: 'ride',
    name: 'Ride',
    duration: '45 min',
    exercises: [
      { name: 'Warm-up spin', sets: 1, reps: '5 min' },
      { name: 'Steady-state ride', sets: 1, reps: '30 min', distance: '15km' },
      { name: 'Cool-down spin', sets: 1, reps: '10 min' },
    ],
  },
};

export function exerciseMeta(ex: ExerciseDef): string {
  const sets = expandSets(ex);
  if (ex.distance && !ex.setList) return `${sets.length} x ${ex.reps || ex.distance}${ex.reps ? ` · ${ex.distance}` : ''}`;
  return `${sets.length} ${sets.length === 1 ? 'set' : 'sets'}`;
}

export function statBumpFor(wid: string): Partial<Record<string, number>> {
  const map: Record<string, Partial<Record<string, number>>> = {
    push: { strength: 1, endurance: 0.4 },
    pull: { strength: 1, discipline: 0.4 },
    legs: { strength: 1.2, endurance: 0.6 },
    cond: { endurance: 1.4, agility: 0.6, vitality: 0.4 },
    run: { endurance: 1.4, agility: 0.4, vitality: 0.3 },
    walk: { endurance: 0.6, recovery: 0.5, vitality: 0.3 },
    swim: { endurance: 1.3, agility: 0.5, recovery: 0.4 },
    ride: { endurance: 1.5, vitality: 0.4, agility: 0.2 },
  };
  // Custom/imported workouts (UUID keys) aren't in this map - give them a
  // small generic, evenly-spread bump rather than nothing at all.
  return map[wid] || { strength: 0.5, endurance: 0.5 };
}
