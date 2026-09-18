import { useEffect, useState } from 'react';
import { Icon } from '../Icon';
import { useUserId } from '../../lib/useSession';
import { fetchLeaderboard, subscribeLeaderboard, type PublicProfile } from '../../lib/social';
import { getCharacterSnapshot } from '../../lib/characterThumbnail';
import { initials } from '../../lib/format';

function AvatarCell({ profile }: { profile: PublicProfile }) {
  const [src, setSrc] = useState('');
  useEffect(() => {
    if (!profile.character) {
      setSrc('');
      return;
    }
    let cancelled = false;
    getCharacterSnapshot(profile.character, 'portrait').then((url) => {
      if (!cancelled) setSrc(url);
    });
    return () => {
      cancelled = true;
    };
  }, [profile.character]);

  return (
    <div className="league-avatar" style={src ? { overflow: 'hidden', padding: 0 } : undefined}>
      {src ? <img className="fit-img" src={src} alt={profile.name} draggable={false} /> : initials(profile.name)}
    </div>
  );
}

export function LeagueTab() {
  const userId = useUserId();
  const [rows, setRows] = useState<PublicProfile[]>([]);

  useEffect(() => {
    let cancelled = false;
    function load() {
      fetchLeaderboard().then((data) => {
        if (!cancelled) setRows(data);
      });
    }
    load();
    const unsubscribe = subscribeLeaderboard(load);
    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, []);

  return (
    <>
      <div className="banner">
        <Icon name="info" />
        <span>Bronze League · live standings for everyone testing Somax right now.</span>
      </div>
      <div className="card">
        {rows.length === 0 ? (
          <div style={{ padding: '16px 4px', color: 'var(--text-faint)', fontSize: 13 }}>
            No one's on the board yet - finish onboarding to show up here.
          </div>
        ) : (
          rows.map((r, i) => (
            <div className={`league-row${r.user_id === userId ? ' you' : ''}`} key={r.user_id}>
              <div className="league-rank">{i + 1}</div>
              <AvatarCell profile={r} />
              <div className="league-name">{r.user_id === userId ? 'You' : r.name}</div>
              <div className="league-xp">{r.total_xp} XP</div>
            </div>
          ))
        )}
      </div>
    </>
  );
}
