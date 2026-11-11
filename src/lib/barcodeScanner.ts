import { registerPlugin, Capacitor } from '@capacitor/core';

interface BarcodeScanResult {
  code: string;
  format: string;
}

interface BarcodeScannerPlugin {
  scan(): Promise<BarcodeScanResult>;
  cancel(): Promise<void>;
}

const BarcodeScanner = registerPlugin<BarcodeScannerPlugin>('BarcodeScanner');

export function barcodeScanAvailableOnPlatform(): boolean {
  return Capacitor.getPlatform() === 'ios';
}

// Presents the native full-screen live scanner (see
// ios/App/App/BarcodeScannerPlugin.swift) and resolves with the decoded
// barcode once one is found, or null if the user cancels.
export async function scanBarcode(): Promise<BarcodeScanResult | null> {
  if (!barcodeScanAvailableOnPlatform()) return null;
  try {
    return await BarcodeScanner.scan();
  } catch (err) {
    if (err instanceof Error && err.message === 'cancelled') return null;
    console.error('[barcodeScanner] scan failed:', err);
    return null;
  }
}
