import { useEffect, useRef, useState } from 'react';
import { Icon } from '../Icon';
import { useAppStore } from '../../store/useAppStore';
import { useUserId } from '../../lib/useSession';
import { fetchLeaderboard, subscribeLeaderboard, type PublicProfile } from '../../lib/social';
import { getCharacterSnapshot } from '../../lib/characterThumbnail';
import { initials } from '../../lib/format';
import { rankLeague, scoreLabel, type Board, type Ranked } from '../../lib/league';

function AvatarCell({ profile, className = 'league-avatar' }: { profile: PublicProfile; className?: string }) {
  const [src, setSrc] = useState('');
  // Character portraits are rendered from 3D - only do it for rows that are
  // actually on (or near) screen, so a 100-person league stays light.
  const ref = useRef<HTMLDivElement>(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || seen) return;
    if (typeof IntersectionObserver === 'undefined') return setSeen(true);
    const io = new IntersectionObserver((entries) => entries.some((e) => e.isIntersecting) && setSeen(true), { rootMargin: '200px' });
    io.observe(el);
    return () => io.disconnect();
  }, [seen]);
  useEffect(() => {
    if (!seen) return;
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
  }, [seen, profile.photo_url, profile.character]);

  const imgSrc = profile.photo_url || src;

  return (
    <div ref={ref} className={className} style={imgSrc ? { overflow: 'hidden', padding: 0 } : undefined}>
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

function Podium({ top3, userId, onOpen }: { top3: Ranked[]; userId: string | null; onOpen: (id: string) => void }) {
  return (
    <div className="podium">
      {PODIUM_ORDER.map((i) => {
        const entry = top3[i];
        if (!entry) return <div key={i} className={`podium-col ${RANKS[i].cls}`} />;
        const r = entry.row;
        const isYou = r.user_id === userId;
        const score = entry.label;
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

const BOARDS: { id: Board; label: string }[] = [
  { id: 'xp', label: 'XP' },
  { id: 'steps', label: 'Steps' },
];

// Rows beyond this show behind "Show all" - a big league stays quick to open.
const LIST_PREVIEW = 50;

// Podium + ranked list + "You" bar for one board. Pure presentation over
// rankLeague(), exported so it can be exercised with any number of people.
export function LeagueBoard({ ranked, userId, board, onOpen }: { ranked: Ranked[]; userId: string | null; board: Board; onOpen: (id: string) => void }) {
  const [showAll, setShowAll] = useState(false);
  const rest = ranked.slice(3);
  const shown = showAll ? rest : rest.slice(0, LIST_PREVIEW);
  const me = ranked.find((x) => x.row.user_id === userId) ?? null;
  const third = ranked[2];
  return (
    <>
      <Podium top3={ranked.slice(0, 3)} userId={userId} onOpen={onOpen} />
      {rest.length > 0 && (
        <div className="card">
          {shown.map((x) => (
            <div
              className={`league-row${x.row.user_id === userId ? ' you' : ''}`}
              key={x.row.user_id}
              style={{ cursor: 'pointer' }}
              onClick={() => onOpen(x.row.user_id)}
            >
              <div className="league-rank">{x.rank}</div>
              <AvatarCell profile={x.row} />
              <div className="league-name-col">
                <div className="league-name">{x.row.user_id === userId ? 'You' : x.row.name}</div>
                <div className="league-sub">Level {x.row.level ?? 1}</div>
              </div>
              <div className="league-xp">{x.label}</div>
            </div>
          ))}
          {!showAll && rest.length > LIST_PREVIEW && (
            <button type="button" className="lib-more" style={{ margin: '6px 0 4px' }} onClick={() => setShowAll(true)}>
              Show all {ranked.length}
            </button>
          )}
        </div>
      )}
      {me && me.rank > 3 && third && (
        <div className="mebar">
          <span className="rk">#{me.rank}</span>
          <AvatarCell profile={me.row} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="t">You · {me.label}</div>
            <div className="s">
              Ahead of {Math.round(((ranked.length - me.rank) / Math.max(1, ranked.length - 1)) * 100)}% of the league ·{' '}
              {scoreLabel(Math.max(0, third.score - me.score + 1), board)} to top 3
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export function LeagueTab() {
  const userId = useUserId();
  const openProfile = useAppStore((s) => s.openProfile);
  const [rows, setRows] = useState<PublicProfile[]>([]);
  const [board, setBoard] = useState<Board>('xp');
  // Equal-width (flex:1) buttons mean the pill's position is index/count -
  // derived, not measured, so it's correct from the first paint.

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

  // Both boards are views onto the same rows, ranked by lib/league.ts.
  const ranked = rankLeague(rows, board);

  return (
    <>
      <SeasonBanner board={board} />

      <div className="board-row">
        <div className="scope">
          {BOARDS.map((b) => (
            <button key={b.id} className={board === b.id ? 'on' : ''} onClick={() => setBoard(b.id)}>
              <Icon name={b.id === 'xp' ? 'zap' : 'steps'} />
              {b.label}
            </button>
          ))}
        </div>
        <span>{ranked.length} in your league</span>
      </div>

      {ranked.length === 0 ? (
        <div className="card" style={{ padding: '16px 4px', color: 'var(--text-faint)', fontSize: 13 }}>
          No one's on the board yet - finish onboarding to show up here.
        </div>
      ) : (
        <LeagueBoard key={board} ranked={ranked} userId={userId} board={board} onOpen={openProfile} />
      )}
    </>
  );
}

// Monthly league: counts down to the reset on the 1st.
function SeasonBanner({ board }: { board: Board }) {
  const now = new Date();
  const reset = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const ms = Math.max(0, reset.getTime() - now.getTime());
  const days = Math.floor(ms / 86400000);
  const hours = Math.floor((ms % 86400000) / 3600000);
  const mins = Math.floor((ms % 3600000) / 60000);
  const pad = (n: number) => n.toString().padStart(2, '0');
  return (
    <div className="season">
      <div style={{ position: 'relative', zIndex: 1, minWidth: 0 }}>
        <div className="k">{now.toLocaleString('en', { month: 'long' })} · resets in</div>
        <h3>Bronze League</h3>
        <div className="rule">Ranked by this month's {board === 'xp' ? 'XP' : 'steps'}</div>
      </div>
      <div className="cd">
        <div>
          <b>{pad(days)}</b>d
        </div>
        <div>
          <b>{pad(hours)}</b>h
        </div>
        <div>
          <b>{pad(mins)}</b>m
        </div>
      </div>
    </div>
  );
}
