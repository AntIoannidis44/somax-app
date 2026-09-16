import { useEffect, useState } from 'react';
import { Icon } from '../Icon';
import { LEAGUE_NPCS } from '../../data/league';
import { useAppStore } from '../../store/useAppStore';
import { getCharacterSnapshot } from '../../lib/characterThumbnail';
import { initials } from '../../lib/format';

export function LeagueTab() {
  const profile = useAppStore((s) => s.profile);
  const leagueXP = useAppStore((s) => s.leagueXP);
  const character = useAppStore((s) => s.character);

  const [youAvatarSrc, setYouAvatarSrc] = useState('');
  useEffect(() => {
    if (!character) {
      setYouAvatarSrc('');
      return;
    }
    let cancelled = false;
    getCharacterSnapshot(character, 'portrait').then((url) => {
      if (!cancelled) setYouAvatarSrc(url);
    });
    return () => {
      cancelled = true;
    };
  }, [character]);

  const rows = LEAGUE_NPCS.map((n) => ({ name: n.name, xp: n.xp, you: false }));
  rows.push({ name: profile?.name || 'You', xp: leagueXP, you: true });
  rows.sort((a, b) => b.xp - a.xp);

  return (
    <>
      <div className="banner">
        <Icon name="info" />
        <span>
          Bronze League · season ends Day 28. League XP comes from challenge progress — join one to start climbing.
        </span>
      </div>
      <div className="card">
        {rows.map((r, i) => (
          <div className={`league-row${r.you ? ' you' : ''}`} key={r.name + i}>
            <div className="league-rank">{i + 1}</div>
            <div className="league-avatar" style={r.you ? { overflow: 'hidden', padding: 0 } : undefined}>
              {r.you && youAvatarSrc ? (
                <img className="fit-img" src={youAvatarSrc} alt="Your character" draggable={false} />
              ) : (
                initials(r.name)
              )}
            </div>
            <div className="league-name">{r.you ? 'You' : r.name}</div>
            <div className="league-xp">{r.xp} XP</div>
          </div>
        ))}
      </div>
    </>
  );
}
