import { registerPlugin, Capacitor } from '@capacitor/core';

export interface ScaleReading {
  weightKg: number | null;
  rawText: string[];
}

interface ScaleReaderPlugin {
  readWeight(options: { base64: string }): Promise<ScaleReading>;
}

const ScaleReader = registerPlugin<ScaleReaderPlugin>('ScaleReader');

// Reads the number off a photo of a scale entirely on-device (Apple Vision
// text recognition) - see ScaleReaderPlugin.swift. Returns null on web or
// if the plugin genuinely found nothing readable; the caller decides what
// "couldn't verify" means for the UI, this just reports what Vision saw.
export async function readScaleWeight(base64: string): Promise<ScaleReading> {
  if (Capacitor.getPlatform() !== 'ios') return { weightKg: null, rawText: [] };
  try {
    return await ScaleReader.readWeight({ base64 });
  } catch {
    return { weightKg: null, rawText: [] };
  }
}
