import { supabase } from './supabase';
import { resizeToJpeg } from './chatImage';
import { isPersonPhoto } from './photoCheck';

const BUCKET = 'profile-photos';
const MAX_SIDE = 800;

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve((reader.result as string).split(',')[1] ?? '');
    reader.onerror = () => reject(reader.error ?? new Error('Could not read image'));
    reader.readAsDataURL(blob);
  });
}

export type ProfilePhotoResult = { ok: true; url: string } | { ok: false; reason: 'not-a-person' | 'upload-failed' };

// One photo per user, fixed filename so a re-upload just overwrites the old
// one (storage.objects RLS scopes writes to the uploader's own folder -
// see the profile_photos_owner_* policies).
export async function uploadProfilePhoto(userId: string, file: File): Promise<ProfilePhotoResult> {
  const blob = await resizeToJpeg(file, MAX_SIDE);
  const base64 = await blobToBase64(blob);

  const isPerson = await isPersonPhoto(base64);
  if (!isPerson) return { ok: false, reason: 'not-a-person' };

  const path = `${userId}/avatar.jpg`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, blob, { contentType: 'image/jpeg', upsert: true });
  if (error) {
    console.error('[profilePhoto] upload failed:', error.message);
    return { ok: false, reason: 'upload-failed' };
  }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  // Cache-bust so the new photo shows immediately everywhere it's already
  // been loaded once (same path as before, upsert overwrote the bytes).
  return { ok: true, url: `${data.publicUrl}?v=${Date.now()}` };
}

export async function removeProfilePhoto(userId: string): Promise<void> {
  await supabase.storage.from(BUCKET).remove([`${userId}/avatar.jpg`]);
}
