import { supabase } from './supabase';
import type { ExerciseDef } from '../types';

const SHARE_DOMAIN = 'https://somaxx.app';

export interface ShareableProgram {
  name: string;
  duration: string;
  exercises: ExerciseDef[];
  category: string;
}

export async function createShareLink(ownerId: string, program: ShareableProgram): Promise<string | null> {
  const { data, error } = await supabase
    .from('shared_programs')
    .insert({ owner_id: ownerId, name: program.name, duration: program.duration, exercises: program.exercises, category: program.category })
    .select('code')
    .single();
  if (error || !data) return null;
  return `${SHARE_DOMAIN}/p/${data.code}`;
}

export async function fetchSharedProgramByCode(code: string): Promise<ShareableProgram | null> {
  const { data, error } = await supabase
    .from('shared_programs')
    .select('name, duration, exercises, category')
    .eq('code', code)
    .maybeSingle();
  if (error || !data) return null;
  return data as ShareableProgram;
}
