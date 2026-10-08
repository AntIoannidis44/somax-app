import { supabase } from './supabase';
import { resizeToJpeg } from './chatImage';

const BUCKET = 'feed-images';
const MAX_SIDE = 1280;

export async function uploadFeedImage(userId: string, file: File): Promise<string | null> {
  const blob = await resizeToJpeg(file, MAX_SIDE);
  const path = `${userId}/${crypto.randomUUID()}.jpg`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, blob, { contentType: 'image/jpeg' });
  if (error) {
    console.error('[feedImage] upload failed:', error.message);
    return null;
  }
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}
