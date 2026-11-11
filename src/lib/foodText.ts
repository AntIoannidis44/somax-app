import { supabase } from './supabase';

export interface FoodTextEstimate {
  name: string;
  estimatedGrams: number;
  kcal: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  confidence: 'low' | 'medium' | 'high';
  notes: string;
  recognized: boolean;
}

// Shared text-based estimator (supabase/functions/estimate-food-text) used
// both to recalculate a log entry after its name is hand-edited, and by
// the voice-to-text flow (transcribed speech goes straight through here).
export async function estimateFoodText(text: string): Promise<FoodTextEstimate> {
  const { data, error } = await supabase.functions.invoke('estimate-food-text', {
    body: { text },
  });
  if (error) throw new Error(error.message ?? 'Estimation failed');
  if (data?.error) throw new Error(data.error);
  return data as FoodTextEstimate;
}
