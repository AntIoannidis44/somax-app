import { registerPlugin, Capacitor } from '@capacitor/core';

interface PhotoCheckPlugin {
  checkIsPerson(options: { base64: string }): Promise<{ isPerson: boolean }>;
}

const PhotoCheck = registerPlugin<PhotoCheckPlugin>('PhotoCheck');

// On-device Vision face detection - iOS only, same reasoning as health.ts's
// native-only gating. There's no web fallback: a profile photo check that
// can't actually check anything would be worse than just blocking it.
export async function isPersonPhoto(base64: string): Promise<boolean> {
  if (Capacitor.getPlatform() !== 'ios' || !Capacitor.isNativePlatform()) return false;
  // Checked explicitly (rather than just calling checkIsPerson and letting
  // it throw) so a missing native registration surfaces as a clearly
  // distinguishable error instead of getting lost in whatever generic
  // message a failed plugin call produces.
  if (!Capacitor.isPluginAvailable('PhotoCheck')) {
    throw new Error('PhotoCheck native plugin is not registered on this build');
  }
  const { isPerson } = await PhotoCheck.checkIsPerson({ base64 });
  return isPerson;
}
