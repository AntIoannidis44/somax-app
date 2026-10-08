import { Capacitor } from '@capacitor/core';
import { PushNotifications } from '@capacitor/push-notifications';
import { supabase } from './supabase';

export function pushAvailableOnPlatform(): boolean {
  return Capacitor.getPlatform() === 'ios';
}

let listenersBound = false;

// Registers this device for remote push (league updates) and saves the
// resulting APNs token to Supabase so the notify-league-update Edge
// Function can find it. Safe to call repeatedly - `register()` only
// prompts the user once; afterwards it just re-confirms the existing
// grant and re-fires `registration` with the same token.
export async function registerForPush(userId: string): Promise<void> {
  if (!pushAvailableOnPlatform()) return;

  const perm = await PushNotifications.checkPermissions();
  if (perm.receive !== 'granted') {
    const req = await PushNotifications.requestPermissions();
    if (req.receive !== 'granted') return;
  }

  if (!listenersBound) {
    listenersBound = true;
    PushNotifications.addListener('registration', async (token) => {
      const { error } = await supabase
        .from('push_tokens')
        .upsert({ user_id: userId, token: token.value, platform: 'ios', updated_at: new Date().toISOString() }, { onConflict: 'user_id,token' });
      if (error) console.error('[push] failed to save token:', error.message);
    });
    PushNotifications.addListener('registrationError', (err) => {
      console.error('[push] registration error:', JSON.stringify(err));
    });
  }

  await PushNotifications.register();
}

export async function unregisterPushToken(userId: string): Promise<void> {
  if (!pushAvailableOnPlatform()) return;
  const current = await PushNotifications.checkPermissions();
  if (current.receive !== 'granted') return;
  // There's no "get current token" API after the fact, so this just
  // clears every saved token for the account - the next registerForPush()
  // call (e.g. re-enabling the setting) repopulates it.
  const { error } = await supabase.from('push_tokens').delete().eq('user_id', userId);
  if (error) console.error('[push] failed to clear tokens:', error.message);
}
