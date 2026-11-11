import { supabase } from '../../lib/supabase';
import { resizeToJpeg } from '../../lib/chatImage';
import type { WeightGoal } from '../../lib/weightGoals';

const FOOD_PHOTO_BUCKET = 'feed-images';
const FOOD_PHOTO_MAX_SIDE = 1280;

export type MealId = 'breakfast' | 'lunch' | 'dinner' | 'snacks';

export interface FoodLogEntry {
  id: string;
  user_id: string;
  log_date: string;
  meal: MealId;
  name: string;
  serving: string | null;
  // Per-unit macros (one serving/piece) - the logged total is these times
  // quantity, computed at read time rather than stored pre-multiplied, so
  // bumping quantity later doesn't need a fresh AI call.
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  kcal: number;
  quantity: number;
  source: 'manual' | 'barcode' | 'photo' | 'voice' | 'skipped';
  barcode: string | null;
  created_at: string;
  // Optional - a photo the user attached to this specific logged item
  // (tap the thumbnail in Today's log), separate from `source: 'photo'`
  // which means the macros themselves came from a vision estimate.
  image_url: string | null;
}

// A deliberately-skipped meal (fasting, cutting snacks, etc.) is still a
// real food_log_entries row - zero macros, source: 'skipped' - rather than
// some separate flag, so it needs no new table/column and the existing
// "log all 4 meals" checklist goal (syncMacroGoal, keyed off which meal
// ids have ANY entry) and 7-day streak count both already recognize it as
// that meal being accounted for, with zero extra plumbing.
export function isSkippedEntry(e: Pick<FoodLogEntry, 'source'>): boolean {
  return e.source === 'skipped';
}

export function entryTotal(e: FoodLogEntry): { kcal: number; protein: number; carbs: number; fat: number } {
  return {
    kcal: Math.round(e.kcal * e.quantity),
    protein: e.protein_g * e.quantity,
    carbs: e.carbs_g * e.quantity,
    fat: e.fat_g * e.quantity,
  };
}

export interface FavoriteMealItem {
  name: string;
  serving: string;
  proteinG: number;
  carbsG: number;
  fatG: number;
}

export interface FavoriteMeal {
  id: string;
  user_id: string;
  name: string;
  meal: MealId;
  items: FavoriteMealItem[];
  created_at: string;
  image_url: string | null;
}

export interface NutritionGoals {
  user_id: string;
  maintenance_kcal: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  updated_at: string;
}

const DEFAULT_GOALS: Omit<NutritionGoals, 'user_id' | 'updated_at'> = {
  maintenance_kcal: 2200,
  protein_g: 150,
  carbs_g: 220,
  fat_g: 70,
};

// 1kg of body fat is ~7700 kcal - the standard conversion used to turn a
// weekly weight-change rate (derived from the real weight_goals row) into
// a daily calorie deficit/surplus. Mirrors the prototype's math exactly,
// now against real goal data instead of typed-in placeholder numbers.
const KCAL_PER_KG = 7700;

export function kcalForMacros(proteinG: number, carbsG: number, fatG: number): number {
  return Math.round(proteinG * 4 + carbsG * 4 + fatG * 9);
}

function daysBetween(a: string, b: string): number {
  return Math.round((new Date(b).getTime() - new Date(a).getTime()) / 86400000);
}

export interface GoalCalories {
  calories: number;
  dailyDeltaKcal: number;
  weeklyRateKg: number | null;
}

// With no active weight goal, calorie goal is just maintenance (maintain
// mode) - no deficit or surplus to apply.
export function computeGoalCalories(goal: WeightGoal | null, maintenanceKcal: number): GoalCalories {
  if (!goal) return { calories: Math.round(maintenanceKcal), dailyDeltaKcal: 0, weeklyRateKg: null };
  const totalDays = Math.max(1, daysBetween(goal.start_date, goal.target_date));
  const weeklyRateKg = (goal.target_weight_kg - goal.start_weight_kg) / (totalDays / 7);
  const dailyDeltaKcal = Math.round((weeklyRateKg * KCAL_PER_KG) / 7);
  return { calories: Math.round(maintenanceKcal + dailyDeltaKcal), dailyDeltaKcal, weeklyRateKg };
}

export async function fetchDayEntries(userId: string, logDate: string): Promise<FoodLogEntry[]> {
  const { data, error } = await supabase
    .from('food_log_entries')
    .select('*')
    .eq('user_id', userId)
    .eq('log_date', logDate)
    .order('created_at', { ascending: true });
  if (error) {
    console.error('[macros] fetchDayEntries:', error.message);
    return [];
  }
  return data as FoodLogEntry[];
}

// Used by the day strip to show an under/over dot for the last 7 days
// without firing 7 separate queries.
export async function fetchRecentEntries(userId: string, fromDate: string): Promise<FoodLogEntry[]> {
  const { data, error } = await supabase
    .from('food_log_entries')
    .select('*')
    .eq('user_id', userId)
    .gte('log_date', fromDate)
    .order('log_date', { ascending: true });
  if (error) {
    console.error('[macros] fetchRecentEntries:', error.message);
    return [];
  }
  return data as FoodLogEntry[];
}

export async function addFoodEntry(
  userId: string,
  logDate: string,
  entry: {
    meal: MealId;
    name: string;
    serving?: string;
    proteinG: number;
    carbsG: number;
    fatG: number;
    quantity?: number;
    source?: FoodLogEntry['source'];
    barcode?: string;
    // Only ever carried over from a favourite meal or recipe that already
    // has a photo - never a per-entry upload.
    imageUrl?: string | null;
  },
): Promise<FoodLogEntry | null> {
  const kcal = kcalForMacros(entry.proteinG, entry.carbsG, entry.fatG);
  const { data, error } = await supabase
    .from('food_log_entries')
    .insert({
      user_id: userId,
      log_date: logDate,
      meal: entry.meal,
      name: entry.name,
      serving: entry.serving ?? null,
      protein_g: entry.proteinG,
      carbs_g: entry.carbsG,
      fat_g: entry.fatG,
      kcal,
      quantity: entry.quantity ?? 1,
      source: entry.source ?? 'manual',
      barcode: entry.barcode ?? null,
      image_url: entry.imageUrl ?? null,
    })
    .select('*')
    .single();
  if (error) {
    console.error('[macros] addFoodEntry:', error.message);
    return null;
  }
  return data as FoodLogEntry;
}

// Marks a meal as deliberately skipped (fasting, cutting snacks, etc.) -
// a zero-macro entry with source 'skipped', so it still counts toward
// "logged this meal" for the daily checklist goal and the 7-day streak,
// same as any real entry would.
export async function addSkippedMeal(userId: string, logDate: string, meal: MealId): Promise<FoodLogEntry | null> {
  return addFoodEntry(userId, logDate, { meal, name: 'Skipped', proteinG: 0, carbsG: 0, fatG: 0, source: 'skipped' });
}

export async function deleteFoodEntry(entryId: string): Promise<void> {
  const { error } = await supabase.from('food_log_entries').delete().eq('id', entryId);
  if (error) console.error('[macros] deleteFoodEntry:', error.message);
}

// Tap a logged item's thumbnail in Today's log to attach/replace a photo -
// same public bucket and resize helper recipes already use, just its own
// path prefix.
export async function uploadFoodEntryImage(userId: string, file: File): Promise<string | null> {
  const blob = await resizeToJpeg(file, FOOD_PHOTO_MAX_SIDE);
  const path = `${userId}/food-${crypto.randomUUID()}.jpg`;
  const { error } = await supabase.storage.from(FOOD_PHOTO_BUCKET).upload(path, blob, { contentType: 'image/jpeg' });
  if (error) {
    console.error('[macros] uploadFoodEntryImage:', error.message);
    return null;
  }
  const { data } = supabase.storage.from(FOOD_PHOTO_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

export async function updateFoodEntryImage(entryId: string, imageUrl: string): Promise<void> {
  const { error } = await supabase.from('food_log_entries').update({ image_url: imageUrl }).eq('id', entryId);
  if (error) console.error('[macros] updateFoodEntryImage:', error.message);
}

export async function updateFoodEntry(
  entryId: string,
  fields: { name: string; serving?: string; proteinG: number; carbsG: number; fatG: number; quantity: number },
): Promise<FoodLogEntry | null> {
  const kcal = kcalForMacros(fields.proteinG, fields.carbsG, fields.fatG);
  const { data, error } = await supabase
    .from('food_log_entries')
    .update({
      name: fields.name,
      serving: fields.serving ?? null,
      protein_g: fields.proteinG,
      carbs_g: fields.carbsG,
      fat_g: fields.fatG,
      kcal,
      quantity: fields.quantity,
    })
    .eq('id', entryId)
    .select('*')
    .single();
  if (error) {
    console.error('[macros] updateFoodEntry:', error.message);
    return null;
  }
  return data as FoodLogEntry;
}

export async function fetchNutritionGoals(userId: string): Promise<NutritionGoals> {
  const { data, error } = await supabase.from('nutrition_goals').select('*').eq('user_id', userId).maybeSingle();
  if (error) console.error('[macros] fetchNutritionGoals:', error.message);
  if (data) return data as NutritionGoals;
  return { user_id: userId, updated_at: new Date().toISOString(), ...DEFAULT_GOALS };
}

export async function saveNutritionGoals(
  userId: string,
  goals: { maintenanceKcal: number; proteinG: number; carbsG: number; fatG: number },
): Promise<void> {
  const { error } = await supabase.from('nutrition_goals').upsert({
    user_id: userId,
    maintenance_kcal: goals.maintenanceKcal,
    protein_g: goals.proteinG,
    carbs_g: goals.carbsG,
    fat_g: goals.fatG,
    updated_at: new Date().toISOString(),
  });
  if (error) console.error('[macros] saveNutritionGoals:', error.message);
}

export function isoToday(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function addDaysIso(iso: string, n: number): string {
  const d = new Date(iso + 'T00:00:00');
  d.setDate(d.getDate() + n);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export async function fetchFavoriteMeals(userId: string): Promise<FavoriteMeal[]> {
  const { data, error } = await supabase
    .from('favorite_meals')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) {
    console.error('[macros] fetchFavoriteMeals:', error.message);
    return [];
  }
  return data as FavoriteMeal[];
}

export async function saveFavoriteMeal(userId: string, name: string, meal: MealId, items: FavoriteMealItem[]): Promise<FavoriteMeal | null> {
  const { data, error } = await supabase
    .from('favorite_meals')
    .insert({ user_id: userId, name, meal, items })
    .select('*')
    .single();
  if (error) {
    console.error('[macros] saveFavoriteMeal:', error.message);
    return null;
  }
  return data as FavoriteMeal;
}

export async function deleteFavoriteMeal(id: string): Promise<void> {
  const { error } = await supabase.from('favorite_meals').delete().eq('id', id);
  if (error) console.error('[macros] deleteFavoriteMeal:', error.message);
}

export async function updateFavoriteMealImage(id: string, imageUrl: string): Promise<void> {
  const { error } = await supabase.from('favorite_meals').update({ image_url: imageUrl }).eq('id', id);
  if (error) console.error('[macros] updateFavoriteMealImage:', error.message);
}

export interface FoodSuggestion {
  name: string;
  serving: string | null;
  proteinG: number | null;
  carbsG: number | null;
  fatG: number | null;
  source: 'history' | 'generic' | 'database';
}

// Relevance tier for ranking search results against the typed query -
// lower is better. An exact match wins outright, then "starts with", then
// "query appears as a whole word", then any other substring match. This
// is what actually determines order now, not which source a row came
// from or an arbitrary DB fetch order.
function matchTier(name: string, q: string): number {
  const n = name.toLowerCase();
  const query = q.toLowerCase();
  if (n === query) return 0;
  if (n.startsWith(query)) return 1;
  if (new RegExp(`\\b${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`).test(n)) return 2;
  return 3;
}

// Autocomplete for the manual "Food" field - searches your own food log,
// the USDA generic-foods table and the Open Food Facts mirror together,
// with NO artificial cap on how many results come back (the search
// screen scrolls); ranked purely by how well each name matches what was
// typed, then by name length as a tiebreaker (shorter/plainer names read
// as more "canonical" for an equally good match).
export async function searchFoodSuggestions(userId: string, query: string): Promise<FoodSuggestion[]> {
  const q = query.trim();
  if (q.length < 2) return [];

  const [historyRes, genericRes, dbRes] = await Promise.all([
    supabase
      .from('food_log_entries')
      .select('name, serving, protein_g, carbs_g, fat_g, created_at')
      .eq('user_id', userId)
      .ilike('name', `%${q}%`)
      .order('created_at', { ascending: false })
      .limit(100),
    supabase
      .from('generic_foods')
      .select('name, protein_100g, carbs_100g, fat_100g')
      .ilike('name', `%${q}%`)
      .limit(300),
    supabase
      .from('food_products')
      .select('name, serving_size, protein_100g, carbs_100g, fat_100g')
      .ilike('name', `%${q}%`)
      .order('unique_scans_n', { ascending: false, nullsFirst: false })
      .limit(300),
  ]);

  const seen = new Set<string>();
  const out: FoodSuggestion[] = [];

  function addAll(rows: { name: string; serving: string | null; proteinG: number | null; carbsG: number | null; fatG: number | null; source: FoodSuggestion['source'] }[]) {
    for (const row of rows) {
      const key = row.name.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      out.push(row);
    }
  }

  addAll((historyRes.data ?? []).map((r) => ({ name: r.name, serving: r.serving, proteinG: r.protein_g, carbsG: r.carbs_g, fatG: r.fat_g, source: 'history' as const })));
  addAll((genericRes.data ?? []).map((r) => ({ name: r.name, serving: '100g', proteinG: r.protein_100g, carbsG: r.carbs_100g, fatG: r.fat_100g, source: 'generic' as const })));
  addAll((dbRes.data ?? []).map((r) => ({ name: r.name, serving: r.serving_size, proteinG: r.protein_100g, carbsG: r.carbs_100g, fatG: r.fat_100g, source: 'database' as const })));

  out.sort((a, b) => {
    const tierDiff = matchTier(a.name, q) - matchTier(b.name, q);
    if (tierDiff !== 0) return tierDiff;
    return a.name.length - b.name.length;
  });

  return out;
}
