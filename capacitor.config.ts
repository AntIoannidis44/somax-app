import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.somaxx.app',
  appName: 'SOMAXX',
  webDir: 'dist',
  plugins: {
    // Without this, the native plugin's willPresent handler returns no
    // presentation options at all for a push that arrives while the app is
    // the active foreground app (phone unlocked, app open) - it would
    // still show fine locked or backgrounded, just silently not show a
    // banner while in use, which is the "I'm looking at my phone and got
    // nothing" case.
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
  },
};

export default config;
