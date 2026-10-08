import { useEffect, useState } from 'react';
import { Icon } from '../Icon';
import { useAppStore } from '../../store/useAppStore';
import { useUserId } from '../../lib/useSession';
import { fetchLeaderboard, subscribeLeaderboard, type PublicProfile } from '../../lib/social';
import { getCharacterSnapshot } from '../../lib/characterThumbnail';
import { initials } from '../../lib/format';

function AvatarCell({ profile, className = 'league-avatar' }: { profile: PublicProfile; className?: string }) {
  const [src, setSrc] = useState('');
  useEffect(() => {
    if (profile.photo_url || !profile.character) {
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
  }, [profile.photo_url, profile.character]);

  const imgSrc = profile.photo_url || src;

  return (
    <div className={className} style={imgSrc ? { overflow: 'hidden', padding: 0 } : undefined}>
      {imgSrc ? <img className="fit-img" src={imgSrc} alt={profile.name} draggable={false} /> : initials(profile.name)}
    </div>
  );
}

const RANKS = [
  { cls: 'gold', label: '1' },
  { cls: 'silver', label: '2' },
  { cls: 'bronze', label: '3' },
] as const;

// Order on screen is 2nd-1st-3rd (the classic podium layout), but RANKS
// above stays in placement order (1/2/3) since that's what the flat list
// below still uses.
const PODIUM_ORDER = [1, 0, 2] as const;

function Podium({
  top3,
  userId,
  board,
  onOpen,
}: {
  top3: PublicProfile[];
  userId: string | null;
  board: Board;
  onOpen: (id: string) => void;
}) {
  return (
    <div className="podium">
      {PODIUM_ORDER.map((i) => {
        const r = top3[i];
        if (!r) return <div key={i} className={`podium-col ${RANKS[i].cls}`} />;
        const isYou = r.user_id === userId;
        const score = board === 'xp' ? `${r.monthly_xp} XP` : `${(r.monthly_steps || 0).toLocaleString()} steps`;
        return (
          <div key={r.user_id} className={`podium-col ${RANKS[i].cls}${isYou ? ' you' : ''}`} onClick={() => onOpen(r.user_id)}>
            {i === 0 && <Icon name="trophy" className="podium-crown" />}
            <AvatarCell profile={r} className="podium-avatar" />
            <div className="podium-name">{isYou ? 'You' : r.name}</div>
            <div className="podium-score">{score}</div>
            <div className="podium-stand">{i + 1}</div>
          </div>
        );
      })}
    </div>
  );
}

const BOARDS = [
  { id: 'xp', label: 'XP' },
  { id: 'steps', label: 'Steps' },
] as const;
type Board = (typeof BOARDS)[number]['id'];

export function LeagueTab() {
  const userId = useUserId();
  const openProfile = useAppStore((s) => s.openProfile);
  const [rows, setRows] = useState<PublicProfile[]>([]);
  const [board, setBoard] = useState<Board>('xp');
  // Equal-width (flex:1) buttons mean the pill's position is index/count -
  // derived, not measured, so it's correct from the first paint.
  const activeIndex = BOARDS.findIndex((b) => b.id === board);

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

  // fetchLeaderboard already orders by monthly_xp - the steps board is the
  // same small set of rows, just re-sorted client-side rather than a
  // second query, since these are two views onto one leaderboard.
  const sorted = board === 'xp' ? rows : [...rows].sort((a, b) => (b.monthly_steps || 0) - (a.monthly_steps || 0));
  const rest = sorted.slice(3);

  return (
    <>
      <div className="banner">
        <Icon name="info" />
        <span>Bronze League · this month's {board === 'xp' ? 'XP' : 'steps'}, resets on the 1st.</span>
      </div>

      <div className="seg" style={{ marginBottom: 16 }}>
        <div
          className="seg-thumb"
          style={{ width: `calc((100% - 8px) / ${BOARDS.length})`, transform: `translateX(${activeIndex * 100}%)` }}
        />
        {BOARDS.map((b) => (
          <button key={b.id} className={board === b.id ? 'active' : ''} onClick={() => setBoard(b.id)}>
            {b.label}
          </button>
        ))}
      </div>

      {sorted.length === 0 ? (
        <div className="card" style={{ padding: '16px 4px', color: 'var(--text-faint)', fontSize: 13 }}>
          No one's on the board yet - finish onboarding to show up here.
        </div>
      ) : (
        <>
          <Podium top3={sorted.slice(0, 3)} userId={userId} board={board} onOpen={openProfile} />
          {rest.length > 0 && (
            <div className="card">
              {rest.map((r, i) => (
                <div
                  className={`league-row${r.user_id === userId ? ' you' : ''}`}
                  key={r.user_id}
                  style={{ cursor: 'pointer' }}
                  onClick={() => openProfile(r.user_id)}
                >
                  <div className="league-rank">{i + 4}</div>
                  <AvatarCell profile={r} />
                  <div className="league-name-col">
                    <div className="league-name">{r.user_id === userId ? 'You' : r.name}</div>
                    <div className="league-sub">
                      {board === 'xp' ? `${(r.monthly_steps || 0).toLocaleString()} steps` : `${r.monthly_xp} XP`}
                    </div>
                  </div>
                  <div className="league-xp">
                    {board === 'xp' ? `${r.monthly_xp} XP` : `${(r.monthly_steps || 0).toLocaleString()}`}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </>
  );
}
