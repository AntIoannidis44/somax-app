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
//
// A list of people without photos (League, friends, DMs, feed stories)
// mounts every row's avatar at once - each one a distinct character, so
// none of them can share the composeCharacter() work the way two
// thumbnails of the *same* character can (see characterThumbnail.ts).
// That's a real burst of full render jobs with no way to cut the total
// work, only to stop it from competing with the list's own first paint -
// waiting for the browser to report idle (bounded by a timeout) does
// that, same fix as Home's Unlocks rail.
export function UserAvatar({ name, character, photoUrl, className, onClick }: UserAvatarProps) {
  const [src, setSrc] = useState('');

  useEffect(() => {
    let cancelled = false;
    setSrc('');
    if (photoUrl || !character) return;
    const ric = (window as unknown as { requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number }).requestIdleCallback;
    const run = () => {
      getCharacterSnapshot(character, 'portrait').then((url) => {
        if (!cancelled) setSrc(url);
      });
    };
    let idleId: number | undefined;
    let timer: ReturnType<typeof setTimeout> | undefined;
    if (ric) idleId = ric(run, { timeout: 400 });
    else timer = setTimeout(run, 150);
    return () => {
      cancelled = true;
      if (idleId !== undefined) (window as unknown as { cancelIdleCallback?: (id: number) => void }).cancelIdleCallback?.(idleId);
      if (timer !== undefined) clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [photoUrl, character?.base, character?.build, character?.skin, character?.hair, character?.hairColor, character?.outfit, character?.outfitColor, character?.top, character?.bottom, character?.shoes, character?.legwear, (character?.acc ?? []).join(), character?.topColor, character?.bottomColor, character?.shoesColor]);

  const imgSrc = photoUrl || src;

  return (
    <div className={className} style={{ padding: 0, overflow: 'hidden', cursor: onClick ? 'pointer' : undefined }} onClick={onClick}>
      {imgSrc ? <img className="fit-img" src={imgSrc} alt="" draggable={false} /> : initials(name)}
    </div>
  );
}
