import { useEffect, useState } from 'react';
import { getCharacterSnapshot, type ThumbnailMode } from '../../lib/characterThumbnail';
import type { CharacterConfig } from '../../types';

interface CharacterThumbnailProps {
  cfg: CharacterConfig;
  mode: ThumbnailMode;
  className?: string;
}

export function CharacterThumbnail({ cfg, mode, className }: CharacterThumbnailProps) {
  const [src, setSrc] = useState('');

  useEffect(() => {
    let cancelled = false;
    setSrc('');
    getCharacterSnapshot(cfg, mode).then((url) => {
      if (!cancelled) setSrc(url);
    });
    return () => {
      cancelled = true;
    };
  }, [cfg.base, mode]);

  if (!src) return null;
  return <img className={className || 'fit-img'} src={src} alt="Your character" draggable={false} />;
}
