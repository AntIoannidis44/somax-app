import { registerPlugin } from '@capacitor/core';
import { pushAvailableOnPlatform } from './push';

interface BadgePlugin {
  setBadge(options: { count: number }): Promise<void>;
}

const Badge = registerPlugin<BadgePlugin>('Badge');

// Sets the number on the app's own home-screen icon (not a push's own
// aps.badge, which only updates it from a notification that actually
// arrives - this also needs to drop back to 0 the moment the user reads a
// conversation in-app, with no new push involved). iOS doesn't expose this
// through any Capacitor core/official plugin, hence the small local one -
// see ios/App/App/BadgePlugin.swift.
export async function setBadgeCount(count: number): Promise<void> {
  if (!pushAvailableOnPlatform()) return;
  try {
    await Badge.setBadge({ count });
  } catch (err) {
    console.error('[badge] setBadge failed:', err);
  }
}
