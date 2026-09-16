import { useMemo } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { currentStyle, getCharacterSnapshot, type ThumbnailMode } from '../../lib/characterThumbnail';
import type { CharacterConfig } from '../../types';

interface CharacterThumbnailProps {
  cfg: CharacterConfig;
  mode: ThumbnailMode;
  className?: string;
}

export function CharacterThumbnail({ cfg, mode, className }: CharacterThumbnailProps) {
  const displayMode = useAppStore((s) => s.mode);
  const style = currentStyle(displayMode);
  const src = useMemo(() => getCharacterSnapshot(cfg, mode, style), [JSON.stringify(cfg), mode, style]);

  if (!src) return null;
  return <img className={className || 'fit-img'} src={src} alt="Your character" draggable={false} />;
}
