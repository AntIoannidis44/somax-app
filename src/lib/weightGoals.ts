import { supabase } from './supabase';
import { resizeToJpeg } from './chatImage';
import { readScaleWeight } from './scaleReader';

const BUCKET = 'weight-photos';
const MAX_SIDE = 1400; // a scale's digits are smaller than a face in frame - more headroom than the 800px profile-photo resize

export interface WeightGoal {
  id: string;
  user_id: string;
  start_weight_kg: number;
  target_weight_kg: number;
  direction: 'gain' | 'lose';
  start_date: string;
  target_date: string;
  status: 'active' | 'completed' | 'abandoned';
  created_at: string;
  updated_at: string;
}

export interface WeightLog {
  id: string;
  user_id: string;
  goal_id: string | null;
  weight_kg: number;
  photo_url: string | null;
  ocr_confidence: number | null;
  verified: boolean;
  logged_at: string;
}

export async function fetchActiveGoal(userId: string): Promise<WeightGoal | null> {
  const { data, error } = await supabase
    .from('weight_goals')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) {
    console.error('[weightGoals] fetchActiveGoal:', error.message);
    return null;
  }
  return data as WeightGoal | null;
}

export async function createWeightGoal(
  userId: string,
  startWeightKg: number,
  targetWeightKg: number,
  targetDate: string,
): Promise<WeightGoal | null> {
  const direction = targetWeightKg >= startWeightKg ? 'gain' : 'lose';
  const { data, error } = await supabase
    .from('weight_goals')
    .insert({ user_id: userId, start_weight_kg: startWeightKg, target_weight_kg: targetWeightKg, direction, target_date: targetDate })
    .select('*')
    .single();
  if (error) {
    console.error('[weightGoals] createWeightGoal:', error.message);
    return null;
  }
  return data as WeightGoal;
}

export async function abandonGoal(goalId: string): Promise<void> {
  const { error } = await supabase.from('weight_goals').update({ status: 'abandoned', updated_at: new Date().toISOString() }).eq('id', goalId);
  if (error) console.error('[weightGoals] abandonGoal:', error.message);
}

async function completeGoal(goalId: string): Promise<void> {
  const { error } = await supabase.from('weight_goals').update({ status: 'completed', updated_at: new Date().toISOString() }).eq('id', goalId);
  if (error) console.error('[weightGoals] completeGoal:', error.message);
}

export async function fetchWeightLogs(userId: string, goalId?: string): Promise<WeightLog[]> {
  let query = supabase.from('weight_logs').select('*').eq('user_id', userId).order('logged_at', { ascending: false });
  if (goalId) query = query.eq('goal_id', goalId);
  const { data, error } = await query.limit(60);
  if (error) {
    console.error('[weightGoals] fetchWeightLogs:', error.message);
    return [];
  }
  return data as WeightLog[];
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve((reader.result as string).split(',')[1] ?? '');
    reader.onerror = () => reject(reader.error ?? new Error('Could not read image'));
    reader.readAsDataURL(blob);
  });
}

export interface ScaleScanResult {
  weightKg: number | null;
  blob: Blob;
}

// Resize once, OCR that same resized image, hand both back to the caller -
// the UI shows "We read 76.4kg - looks right?" before anything is saved,
// and the blob it already scanned is exactly what gets uploaded on confirm
// (no second resize, no risk of the two diverging).
export async function scanScalePhoto(file: File): Promise<ScaleScanResult> {
  const blob = await resizeToJpeg(file, MAX_SIDE);
  const base64 = await blobToBase64(blob);
  const { weightKg } = await readScaleWeight(base64);
  return { weightKg, blob };
}

async function uploadWeightPhoto(userId: string, blob: Blob): Promise<string> {
  const path = `${userId}/${crypto.randomUUID()}.jpg`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, blob, { contentType: 'image/jpeg' });
  if (error) throw new Error(error.message);
  return path;
}

export async function signedWeightPhotoUrl(path: string): Promise<string | null> {
  const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(path, 60 * 60);
  if (error) {
    console.error('[weightGoals] signedUrl:', error.message);
    return null;
  }
  return data.signedUrl;
}

// Logs a verified weigh-in (the native plugin already read the number off
// the photo before this is called - see ScaleReaderPlugin) and auto-marks
// the goal complete once a real log actually reaches/passes the target, in
// whichever direction the goal is going (gain: >=, lose: <=). Returns
// whether this log just completed the goal, so the caller knows whether to
// award the completion bonus on top of the per-log XP.
export async function logWeight(
  userId: string,
  goal: WeightGoal,
  weightKg: number,
  photoBlob: Blob,
): Promise<{ log: WeightLog | null; goalCompleted: boolean }> {
  let photoPath: string | null = null;
  try {
    photoPath = await uploadWeightPhoto(userId, photoBlob);
  } catch (err) {
    console.error('[weightGoals] uploadWeightPhoto:', err instanceof Error ? err.message : err);
  }
  const { data, error } = await supabase
    .from('weight_logs')
    .insert({ user_id: userId, goal_id: goal.id, weight_kg: weightKg, photo_url: photoPath, ocr_confidence: 1, verified: true })
    .select('*')
    .single();
  if (error) {
    console.error('[weightGoals] logWeight:', error.message);
    return { log: null, goalCompleted: false };
  }
  const reachedTarget = goal.direction === 'gain' ? weightKg >= goal.target_weight_kg : weightKg <= goal.target_weight_kg;
  if (reachedTarget) await completeGoal(goal.id);
  return { log: data as WeightLog, goalCompleted: reachedTarget };
}
