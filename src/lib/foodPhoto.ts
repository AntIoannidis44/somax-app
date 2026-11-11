import { supabase } from './supabase';
import { resizeToJpeg } from './chatImage';

export interface FoodPhotoItem {
  name: string;
  estimatedGrams: number;
  kcal: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  itemConfidence: 'low' | 'medium' | 'high';
  alternatives: string[];
}

export interface FoodPhotoAnalysis {
  items: FoodPhotoItem[];
  totalKcal: number;
  totalProteinG: number;
  totalCarbsG: number;
  totalFatG: number;
  confidence: 'low' | 'medium' | 'high';
  notes: string;
}

const MAX_SIDE = 1024; // Claude's vision token cost scales with pixel count - this is plenty of detail for food identification

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve((reader.result as string).split(',')[1] ?? '');
    reader.onerror = () => reject(reader.error ?? new Error('Could not read image'));
    reader.readAsDataURL(blob);
  });
}

// Sends a food or recipe photo to the analyze-food-photo edge function,
// which calls Claude Haiku's vision for identification + macro estimation
// (see supabase/functions/analyze-food-photo). The Anthropic key never
// reaches the client - this only ever talks to our own edge function.
export async function analyzeFoodPhoto(file: File, mode: 'food' | 'recipe' = 'food'): Promise<FoodPhotoAnalysis> {
  const blob = await resizeToJpeg(file, MAX_SIDE);
  const imageBase64 = await blobToBase64(blob);

  const { data, error } = await supabase.functions.invoke('analyze-food-photo', {
    body: { imageBase64, mediaType: 'image/jpeg', mode },
  });

  if (error) throw new Error(error.message ?? 'Photo analysis failed');
  if (data?.error) throw new Error(data.error);
  return data as FoodPhotoAnalysis;
}
