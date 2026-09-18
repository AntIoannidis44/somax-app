import { useEffect, useState } from 'react';
import { supabase } from './supabase';
import { WORKOUTS } from '../data/workouts';
import type { ExerciseDef, WorkoutDef } from '../types';

export interface CustomWorkout {
  id: string;
  user_id: string;
  name: string;
  duration: string;
  exercises: ExerciseDef[];
  created_at: string;
  updated_at: string;
}

// Populated by loadMyWorkouts() and refreshed after any create/update/
// delete - lets getWorkout() resolve a weekPlan slot synchronously
// (mirroring the built-in WORKOUTS dict) instead of every render site
// that shows a workout's name/exercises needing to be async-aware.
let myWorkoutsCache: CustomWorkout[] = [];

// Plain cache reads (getWorkout) don't need reactivity, but "My programs"
// UI does - a tiny pub-sub lets any component re-render when the cache
// changes without lifting this into the zustand store.
const listeners = new Set<() => void>();
function notifyMyWorkoutsChanged() {
  listeners.forEach((l) => l());
}

export async function loadMyWorkouts(userId: string): Promise<CustomWorkout[]> {
  const { data, error } = await supabase.from('custom_workouts').select('*').eq('user_id', userId).order('created_at', { ascending: false });
  if (error) {
    console.error('[customWorkouts] loadMyWorkouts:', error.message);
    return myWorkoutsCache;
  }
  myWorkoutsCache = data as CustomWorkout[];
  notifyMyWorkoutsChanged();
  return myWorkoutsCache;
}

export function myWorkouts(): CustomWorkout[] {
  return myWorkoutsCache;
}

export function useMyWorkouts(): CustomWorkout[] {
  const [list, setList] = useState(myWorkoutsCache);
  useEffect(() => {
    const listener = () => setList(myWorkoutsCache);
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);
  return list;
}

// Built-ins first, then whatever's in the current user's own cache - a
// weekPlan slot's `key` is always either a fixed preset id (push/pull/...)
// or one of the user's own custom_workouts rows (imports create a real
// copy in that table, see importWorkout below), never a stranger's id.
export function getWorkout(key: string): WorkoutDef | undefined {
  return WORKOUTS[key] || myWorkoutsCache.find((w) => w.id === key);
}

export async function fetchWorkoutById(id: string): Promise<CustomWorkout | null> {
  const { data, error } = await supabase.from('custom_workouts').select('*').eq('id', id).maybeSingle();
  if (error) {
    console.error('[customWorkouts] fetchWorkoutById:', error.message);
    return null;
  }
  return data as CustomWorkout | null;
}

export interface WorkoutDraft {
  id?: string;
  name: string;
  duration: string;
  exercises: ExerciseDef[];
}

// Insert (no id) or update (id present, must be owned by this user - RLS
// enforces that regardless) and refresh the cache either way.
export async function saveWorkout(userId: string, draft: WorkoutDraft): Promise<string | null> {
  const row = {
    user_id: userId,
    name: draft.name,
    duration: draft.duration,
    exercises: draft.exercises,
    updated_at: new Date().toISOString(),
  };
  const { data, error } = draft.id
    ? await supabase.from('custom_workouts').update(row).eq('id', draft.id).select('id').single()
    : await supabase.from('custom_workouts').insert(row).select('id').single();
  if (error) {
    console.error('[customWorkouts] saveWorkout:', error.message);
    return null;
  }
  await loadMyWorkouts(userId);
  return data.id as string;
}

export async function deleteWorkout(userId: string, id: string): Promise<void> {
  const { error } = await supabase.from('custom_workouts').delete().eq('id', id);
  if (error) console.error('[customWorkouts] deleteWorkout:', error.message);
  await loadMyWorkouts(userId);
}

// Sharing: a link just carries the source workout's id. Anyone signed in
// can read any row (see the table's RLS policy), so opening the link
// shows a live preview; "Add to my programs" copies it into a brand-new
// row owned by the importing user rather than referencing the original.
export async function importWorkout(userId: string, source: CustomWorkout): Promise<string | null> {
  return saveWorkout(userId, { name: source.name, duration: source.duration, exercises: source.exercises });
}

export function shareLinkFor(id: string): string {
  return `${window.location.origin}${window.location.pathname}?program=${id}`;
}
