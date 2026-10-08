import { supabase } from './supabase';

// Chat photos live in a private bucket. A message carries only the storage
// path, and the chat turns it into a short-lived signed link when it shows
// the picture, so nothing public is ever stored.
const PREFIX = '[image]';
const BUCKET = 'chat-images';
const MAX_SIDE = 1280;

export function encodeImageMessage(path: string): string {
  return PREFIX + path;
}

export function imagePathFromMessage(text: string): string | null {
  return text.startsWith(PREFIX) ? text.slice(PREFIX.length) : null;
}

// Phone photos can be 4000px+ and several MB - shrink to a sensible size first
// so chat stays quick on mobile data. Exported since profilePhoto.ts reuses
// it rather than duplicating the same canvas-resize logic.
export async function resizeToJpeg(file: File, maxSide = MAX_SIDE): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext('2d')!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return new Promise((resolve, reject) =>
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('Could not prepare image'))), 'image/jpeg', 0.82),
  );
}

export async function uploadChatImage(senderId: string, file: File): Promise<string> {
  const blob = await resizeToJpeg(file);
  const path = `${senderId}/${crypto.randomUUID()}.jpg`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, blob, { contentType: 'image/jpeg' });
  if (error) throw new Error(error.message);
  return path;
}

export async function signedChatImageUrl(path: string): Promise<string | null> {
  const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(path, 60 * 60);
  if (error) {
    console.error('[chatImage] signedUrl:', error.message);
    return null;
  }
  return data.signedUrl;
}
