import { useRef, useState } from 'react';
import { Modal } from '../layout/Modal';
import { Icon } from '../Icon';
import { requestSpeechPermission, speechToTextAvailableOnPlatform, startVoiceListening, stopVoiceListening } from '../../lib/speechToText';

// Shared chrome for both DMScreen and GroupChatScreen: the per-chat
// wallpaper picker. The avatar+name row lives in the top device header now
// (not a second header row in the chat screen) - see DeviceHeader.tsx.

export type WallpaperKey = 'default' | 'ocean' | 'mint' | 'blush' | 'slate';

export const WALLPAPER_OPTIONS: { key: WallpaperKey; label: string }[] = [
  { key: 'default', label: 'Default' },
  { key: 'ocean', label: 'Ocean' },
  { key: 'mint', label: 'Mint' },
  { key: 'blush', label: 'Blush' },
  { key: 'slate', label: 'Slate' },
];

// Wallpaper choice is a per-device preference, not synced data - same
// reasoning as a native chat app remembering a per-conversation background
// locally rather than treating it as content.
export function getWallpaper(storageKey: string): WallpaperKey {
  try {
    const v = localStorage.getItem(storageKey);
    if (v && WALLPAPER_OPTIONS.some((w) => w.key === v)) return v as WallpaperKey;
  } catch {
    // Private mode / blocked storage - default wallpaper is a fine fallback.
  }
  return 'default';
}

export function setWallpaper(storageKey: string, value: WallpaperKey): void {
  try {
    localStorage.setItem(storageKey, value);
  } catch {
    // Nothing to persist to - the chat still works, just forgets the choice.
  }
}

// A deliberate downward drag, starting from the very top of the message
// list (so it never fights a normal mid-scroll gesture), dismisses the
// keyboard - a lighter stand-in for iOS's own "drag the keyboard away"
// gesture, which a WKWebView text field doesn't get for free.
export function useSwipeToDismissKeyboard() {
  const start = useRef<number | null>(null);
  function onPointerDown(e: React.PointerEvent<HTMLElement>) {
    start.current = e.currentTarget.scrollTop <= 0 ? e.clientY : null;
  }
  function onPointerMove(e: React.PointerEvent<HTMLElement>) {
    if (start.current === null) return;
    if (e.currentTarget.scrollTop > 0) {
      start.current = null;
      return;
    }
    if (e.clientY - start.current > 70) {
      (document.activeElement as HTMLElement | null)?.blur();
      start.current = null;
    }
  }
  function onPointerUp() {
    start.current = null;
  }
  return { onPointerDown, onPointerMove, onPointerUp, onPointerCancel: onPointerUp };
}

// Voice-to-text dictation for the message box, reusing the same custom
// native plugin (SpeechToTextPlugin.swift, Apple's own Speech framework -
// no third-party dependency) that voice food-logging already uses in
// AddFoodSheet.tsx. Unlike that screen, there's no "estimate" step here:
// whatever was heard becomes the draft text, appended after anything
// already typed rather than overwriting it.
export function useVoiceDictation(draft: string, setDraft: (text: string) => void) {
  const [listening, setListening] = useState(false);
  const prefix = useRef('');

  async function toggle() {
    if (listening) {
      setListening(false);
      try {
        const transcript = await stopVoiceListening();
        if (transcript.trim()) setDraft(prefix.current ? `${prefix.current} ${transcript.trim()}` : transcript.trim());
      } catch {
        // Nothing to recover - the draft just stays whatever it already was.
      }
      return;
    }
    const granted = await requestSpeechPermission();
    if (!granted) return;
    prefix.current = draft.trim();
    try {
      await startVoiceListening();
      setListening(true);
    } catch {
      // Mic stays idle - the button press simply did nothing.
    }
  }

  return { listening, toggle, available: speechToTextAvailableOnPlatform() };
}

interface WallpaperPickerProps {
  open: boolean;
  value: WallpaperKey;
  onClose: () => void;
  onPick: (key: WallpaperKey) => void;
}

export function WallpaperPicker({ open, value, onClose, onPick }: WallpaperPickerProps) {
  return (
    <Modal open={open} onClose={onClose} title="Chat wallpaper">
      <div className="wallpaper-grid">
        {WALLPAPER_OPTIONS.map((w) => (
          <button key={w.key} className={`wallpaper-swatch wp-${w.key}${value === w.key ? ' on' : ''}`} onClick={() => onPick(w.key)}>
            {value === w.key && <Icon name="check" style={{ width: 16, height: 16 }} />}
            <span className="wallpaper-swatch-label">{w.label}</span>
          </button>
        ))}
      </div>
    </Modal>
  );
}
