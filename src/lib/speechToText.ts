import { registerPlugin, Capacitor } from '@capacitor/core';

interface SpeechToTextPlugin {
  requestPermission(): Promise<{ granted: boolean }>;
  startListening(): Promise<void>;
  stopListening(): Promise<{ text: string }>;
}

const SpeechToText = registerPlugin<SpeechToTextPlugin>('SpeechToText');

export function speechToTextAvailableOnPlatform(): boolean {
  return Capacitor.getPlatform() === 'ios';
}

export async function requestSpeechPermission(): Promise<boolean> {
  if (!speechToTextAvailableOnPlatform()) return false;
  const { granted } = await SpeechToText.requestPermission();
  return granted;
}

export async function startVoiceListening(): Promise<void> {
  await SpeechToText.startListening();
}

export async function stopVoiceListening(): Promise<string> {
  const { text } = await SpeechToText.stopListening();
  return text;
}
