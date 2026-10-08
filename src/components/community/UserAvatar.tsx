import { useEffect, useState } from 'react';
import { getCharacterSnapshot } from '../../lib/characterThumbnail';
import { initials } from '../../lib/format';
import type { CharacterConfig } from '../../types';

interface UserAvatarProps {
  name: string;
  character?: CharacterConfig | null;
  photoUrl?: string | null;
  className: string;
  onClick?: () => void;
}

// A real uploaded photo always wins over the character snapshot when one's
// set - see profilePhoto.ts. Otherwise shows the character headshot once
// its snapshot is ready, and initials until then (or with no character).
export function UserAvatar({ name, character, photoUrl, className, onClick }: UserAvatarProps) {
  const [src, setSrc] = useState('');

  useEffect(() => {
    let cancelled = false;
    setSrc('');
    if (photoUrl || !character) return;
    getCharacterSnapshot(character, 'portrait').then((url) => {
      if (!cancelled) setSrc(url);
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [photoUrl, character?.base, character?.build, character?.skin, character?.hair, character?.hairColor, character?.outfit, character?.outfitColor]);

  const imgSrc = photoUrl || src;

  return (
    <div className={className} style={{ padding: 0, overflow: 'hidden', cursor: onClick ? 'pointer' : undefined }} onClick={onClick}>
      {imgSrc ? <img className="fit-img" src={imgSrc} alt="" draggable={false} /> : initials(name)}
    </div>
  );
}
