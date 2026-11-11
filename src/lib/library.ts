import { supabase } from './supabase';
import type { ExerciseDef } from '../types';
import type { IconName } from '../data/icons';

// Program & Meal Library - one browsable catalogue, filterable by level,
// sport and goal. Two places feed it:
//   - curated items (Programs by Somax + credited public programs) are
//     bundled with the app in src/data/library/ - instant, offline, no DB;
//   - library_items in Supabase - community shares from the app (named or
//     anonymous), plus anything curated we add later without an app update.

export type LibraryKind = 'program' | 'meal';
export type LibraryLevel = 'beginner' | 'intermediate' | 'advanced';
export type LibrarySource = 'somax' | 'credited' | 'community';

export const LEVELS: { id: LibraryLevel; label: string }[] = [
  { id: 'beginner', label: 'Beginner' },
  { id: 'intermediate', label: 'Intermediate' },
  { id: 'advanced', label: 'Advanced' },
];

// icon + colorVar drive the sport "wheel" (scrolling chip row) - same
// icon set and --stat-* palette as WORKOUT_TYPES so it reads like the
// community feed's sport filter.
export const SPORTS: { id: string; label: string; icon: IconName; colorVar: string }[] = [
  { id: 'strength-training', label: 'Strength', icon: 'dumbbell', colorVar: '--stat-strength' },
  { id: 'bodybuilding', label: 'Bodybuilding', icon: 'dumbbell', colorVar: '--stat-strength' },
  { id: 'powerlifting', label: 'Powerlifting', icon: 'dumbbell', colorVar: '--stat-strength' },
  { id: 'running', label: 'Running', icon: 'run', colorVar: '--stat-endurance' },
  { id: 'cycling', label: 'Cycling', icon: 'ride', colorVar: '--stat-agility' },
  { id: 'swimming', label: 'Swimming', icon: 'swim', colorVar: '--stat-discipline' },
  { id: 'calisthenics', label: 'Calisthenics', icon: 'fitness', colorVar: '--stat-vitality' },
  { id: 'hiit', label: 'HIIT', icon: 'flame', colorVar: '--stat-vitality' },
  { id: 'pilates', label: 'Pilates', icon: 'pilates', colorVar: '--sport-pilates' },
  { id: 'yoga-mobility', label: 'Yoga & mobility', icon: 'pilates', colorVar: '--stat-recovery' },
  { id: 'football', label: 'Football', icon: 'trophy', colorVar: '--stat-agility' },
  { id: 'basketball', label: 'Basketball', icon: 'trophy', colorVar: '--stat-agility' },
  { id: 'tennis', label: 'Tennis', icon: 'trophy', colorVar: '--stat-agility' },
  { id: 'boxing', label: 'Boxing', icon: 'zap', colorVar: '--stat-strength' },
  { id: 'golf', label: 'Golf', icon: 'trophy', colorVar: '--stat-recovery' },
  { id: 'hybrid', label: 'Hybrid', icon: 'zap', colorVar: '--stat-endurance' },
  { id: 'general', label: 'General', icon: 'walk', colorVar: '--stat-recovery' },
];

export const GOALS: { id: string; label: string }[] = [
  { id: 'strength', label: 'Strength' },
  { id: 'muscle', label: 'Build muscle' },
  { id: 'fat-loss', label: 'Fat loss' },
  { id: 'endurance', label: 'Endurance' },
  { id: 'mobility', label: 'Mobility' },
  { id: 'general-fitness', label: 'General fitness' },
  { id: 'sport-performance', label: 'Sport performance' },
];

export const LIFESTYLES: { id: string; label: string }[] = [
  { id: 'busy', label: 'Busy schedule' },
  { id: 'time-efficient', label: 'Time-efficient' },
  { id: 'home', label: 'At home' },
  { id: 'minimal-equipment', label: 'Minimal equipment' },
  { id: 'full-gym', label: 'Full gym' },
  { id: 'travel', label: 'Travel' },
  { id: 'outdoor', label: 'Outdoor' },
  { id: 'older-adults', label: 'Older adults' },
];

export const DAYS_FILTERS: { id: string; label: string }[] = [
  { id: '1-2', label: '1-2 days' },
  { id: '3', label: '3 days' },
  { id: '4', label: '4 days' },
  { id: '5+', label: '5+ days' },
];

export function matchesDays(days: number | undefined, filter: string): boolean {
  if (filter === 'all') return true;
  if (!days) return false;
  if (filter === '1-2') return days <= 2;
  if (filter === '5+') return days >= 5;
  return days === Number(filter);
}

export const MEAL_TYPES: { id: string; label: string; icon: IconName; colorVar: string }[] = [
  { id: 'breakfast', label: 'Breakfast', icon: 'coffee', colorVar: '--stat-vitality' },
  { id: 'lunch', label: 'Lunch', icon: 'sun', colorVar: '--stat-recovery' },
  { id: 'dinner', label: 'Dinner', icon: 'moon', colorVar: '--stat-discipline' },
  { id: 'snack', label: 'Snack', icon: 'nutrition', colorVar: '--stat-agility' },
];

export const DIETS: { id: string; label: string }[] = [
  { id: 'high-protein', label: 'High protein' },
  { id: 'vegetarian', label: 'Vegetarian' },
  { id: 'vegan', label: 'Vegan' },
  { id: 'low-carb', label: 'Low carb' },
  { id: 'dairy-free', label: 'Dairy free' },
  { id: 'gluten-free', label: 'Gluten free' },
];

export function labelFor(list: { id: string; label: string }[], id: string | null | undefined): string {
  return list.find((x) => x.id === id)?.label ?? (id ? id.replace(/-/g, ' ') : '');
}

export interface ProgramContent {
  exercises: ExerciseDef[];
  series?: string;
  day?: number;
  daysInSeries?: number;
  daysPerWeek?: number;
  // Coaching knowledge: who it suits (schedule, lifestyle, experience)
  // and how to run/progress it - not just the exercise list.
  whoItsFor?: string;
  howToRun?: string[];
  lifestyle?: string[];
  sessionMinutes?: number;
}

export interface MealContent {
  servings: number;
  kcal: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  ingredients: { name: string; amount: string }[];
  steps: string[];
  imageUrl?: string | null;
  prepMinutes?: number;
  whoItsFor?: string;
  tips?: string[];
}

interface LibraryItemBase {
  id: string;
  name: string;
  level: LibraryLevel;
  sport: string | null;
  goals: string[];
  // programs: equipment; meals: diet tags
  tags: string[];
  // programs: workout type id (icon); meals: meal type
  category: string;
  duration: string | null;
  description: string | null;
  source: LibrarySource;
  // Null on a community item = shared anonymously.
  credit_name: string | null;
  source_url: string | null;
  created_at: string;
}
export interface LibraryProgram extends LibraryItemBase {
  kind: 'program';
  content: ProgramContent;
}
export interface LibraryMeal extends LibraryItemBase {
  kind: 'meal';
  content: MealContent;
}
export type LibraryItem = LibraryProgram | LibraryMeal;

// "by Somax" / "Shared by Ant Ioannidis" / "Shared anonymously" / "Program by Hal Higdon"
export function creditLine(item: LibraryItem): string {
  if (item.source === 'somax') return item.kind === 'program' ? 'Program by Somax' : 'Recipe by Somax';
  if (item.source === 'community') return item.credit_name ? `Shared by ${item.credit_name}` : 'Shared anonymously';
  return `${item.kind === 'program' ? 'Program' : 'Recipe'} by ${item.credit_name ?? 'unknown'}`;
}

const COLUMNS = 'id, kind, name, level, sport, goals, tags, category, duration, description, content, source, credit_name, source_url, created_at';

async function fetchRemote(kind: LibraryKind): Promise<LibraryItem[]> {
  const { data, error } = await supabase.from('library_items').select(COLUMNS).eq('kind', kind).order('created_at', { ascending: false });
  if (error) {
    // Table not created yet, or offline - the curated set still shows.
    console.warn('[library] fetchRemote:', error.message);
    return [];
  }
  return data as LibraryItem[];
}

export async function loadLibrary(kind: LibraryKind): Promise<LibraryItem[]> {
  const [curated, remote] = await Promise.all([
    import('../data/library').then((m) => (kind === 'program' ? m.CURATED_PROGRAMS : m.CURATED_MEALS) as LibraryItem[]),
    fetchRemote(kind),
  ]);
  // Remote first (newest community shares on top); a remote curated row
  // with the same id as a bundled one replaces it.
  const remoteIds = new Set(remote.map((r) => r.id));
  return [...remote, ...curated.filter((c) => !remoteIds.has(c.id))];
}

export async function myLibraryItemIds(): Promise<Set<string>> {
  const { data, error } = await supabase.rpc('my_library_item_ids');
  if (error) return new Set();
  return new Set((data as string[]) ?? []);
}

export async function removeMyLibraryItem(id: string): Promise<boolean> {
  const { error } = await supabase.rpc('delete_my_library_item', { item_id: id });
  if (error) console.error('[library] remove:', error.message);
  return !error;
}

export interface LibraryShareMeta {
  level: LibraryLevel;
  daysPerWeek?: number | null;
  whoItsFor?: string;
  sport: string | null;
  goals: string[];
  tags: string[];
  description: string;
  // Null = share anonymously.
  creditName: string | null;
}

export async function shareProgramToLibrary(
  program: { name: string; duration: string; category: string; exercises: ExerciseDef[] },
  meta: LibraryShareMeta,
): Promise<boolean> {
  const { error } = await supabase.from('library_items').insert({
    kind: 'program',
    name: program.name,
    level: meta.level,
    sport: meta.sport,
    goals: meta.goals,
    tags: meta.tags,
    category: program.category,
    duration: program.duration,
    description: meta.description.trim() || null,
    content: {
      exercises: program.exercises,
      ...(meta.daysPerWeek ? { daysPerWeek: meta.daysPerWeek } : {}),
      ...(meta.whoItsFor?.trim() ? { whoItsFor: meta.whoItsFor.trim() } : {}),
    } satisfies ProgramContent,
    source: 'community',
    credit_name: meta.creditName?.trim() || null,
  });
  if (error) console.error('[library] shareProgram:', error.message);
  return !error;
}

export async function shareMealToLibrary(meal: MealContent & { name: string }, mealType: string, meta: LibraryShareMeta): Promise<boolean> {
  const { name, ...content } = meal;
  const { error } = await supabase.from('library_items').insert({
    kind: 'meal',
    name,
    level: meta.level,
    sport: null,
    goals: meta.goals,
    tags: meta.tags,
    category: mealType,
    duration: content.prepMinutes ? `${content.prepMinutes} min` : null,
    description: meta.description.trim() || null,
    content: meta.whoItsFor?.trim() ? { ...content, whoItsFor: meta.whoItsFor.trim() } : content,
    source: 'community',
    credit_name: meta.creditName?.trim() || null,
  });
  if (error) console.error('[library] shareMeal:', error.message);
  return !error;
}

// ---------- saves / popularity ----------

export async function fetchSaveCounts(kind: LibraryKind): Promise<Map<string, number>> {
  const { data, error } = await supabase.rpc('library_save_counts', { k: kind });
  if (error) return new Map(); // table not created yet - badges just stay hidden
  return new Map((data as { item_id: string; saves: number }[]).map((r) => [r.item_id, Number(r.saves)]));
}

// One row per user per item, so re-adding never double-counts.
export async function recordLibrarySave(itemId: string, kind: LibraryKind): Promise<boolean> {
  const { error } = await supabase.from('library_saves').upsert({ item_id: itemId, kind }, { onConflict: 'item_id,user_id', ignoreDuplicates: true });
  if (error) console.warn('[library] recordSave:', error.message);
  return !error;
}
