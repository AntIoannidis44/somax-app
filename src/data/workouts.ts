import type { WorkoutDef } from '../types';

export const WORKOUTS: Record<string, WorkoutDef> = {
  push: {
    name: 'Push Day',
    duration: '50 min',
    exercises: [
      { name: 'Barbell Bench Press', meta: '4 x 8' },
      { name: 'Overhead Press', meta: '3 x 10' },
      { name: 'Incline Dumbbell Press', meta: '3 x 10' },
      { name: 'Triceps Pushdown', meta: '3 x 12' },
      { name: 'Lateral Raise', meta: '3 x 15' },
    ],
  },
  pull: {
    name: 'Pull Day',
    duration: '48 min',
    exercises: [
      { name: 'Deadlift', meta: '3 x 5' },
      { name: 'Lat Pulldown', meta: '4 x 10' },
      { name: 'Barbell Row', meta: '3 x 10' },
      { name: 'Face Pull', meta: '3 x 15' },
      { name: 'Bicep Curl', meta: '3 x 12' },
    ],
  },
  legs: {
    name: 'Leg Day',
    duration: '55 min',
    exercises: [
      { name: 'Back Squat', meta: '4 x 8' },
      { name: 'Romanian Deadlift', meta: '3 x 10' },
      { name: 'Walking Lunge', meta: '3 x 12/leg' },
      { name: 'Leg Curl', meta: '3 x 12' },
      { name: 'Calf Raise', meta: '4 x 15' },
    ],
  },
  cond: {
    name: 'Conditioning',
    duration: '32 min',
    exercises: [
      { name: 'Rowing Intervals', meta: '8 x 250m' },
      { name: 'Kettlebell Swings', meta: '4 x 15' },
      { name: 'Battle Ropes', meta: '4 x 30s' },
      { name: 'Plank Hold', meta: '3 x 45s' },
    ],
  },
  run: {
    name: 'Run',
    duration: '30 min',
    exercises: [
      { name: 'Warm-up jog', meta: '5 min' },
      { name: 'Steady-state run', meta: '20 min' },
      { name: 'Cool-down walk', meta: '5 min' },
    ],
  },
  walk: {
    name: 'Walk',
    duration: '35 min',
    exercises: [
      { name: 'Brisk walk', meta: '30 min' },
      { name: 'Stretch', meta: '5 min' },
    ],
  },
};

export function statBumpFor(wid: string): Partial<Record<string, number>> {
  const map: Record<string, Partial<Record<string, number>>> = {
    push: { strength: 1, endurance: 0.4 },
    pull: { strength: 1, discipline: 0.4 },
    legs: { strength: 1.2, endurance: 0.6 },
    cond: { endurance: 1.4, agility: 0.6, vitality: 0.4 },
    run: { endurance: 1.4, agility: 0.4, vitality: 0.3 },
    walk: { endurance: 0.6, recovery: 0.5, vitality: 0.3 },
  };
  return map[wid] || {};
}
