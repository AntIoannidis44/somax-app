import { useEffect, useRef, useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { useUserId } from '../../lib/useSession';
import {
  createPost,
  fetchFriendships,
  fetchLeaderboard,
  fetchPosts,
  respondToFriendRequest,
  sendFriendRequest,
  subscribeFriendships,
  subscribeLeaderboard,
  subscribePosts,
  type CommunityPost,
  type Friendship,
  type PublicProfile,
} from '../../lib/social';
import { initials, timeAgo } from '../../lib/format';

const TABS = [
  { id: 'feed', label: 'Feed' },
  { id: 'friends', label: 'Friends' },
] as const;

function FeedTab({ userId, myName }: { userId: string; myName: string }) {
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [draft, setDraft] = useState('');

  useEffect(() => {
    let cancelled = false;
    function load() {
      fetchPosts().then((rows) => {
        if (!cancelled) setPosts(rows);
      });
    }
    load();
    const unsubscribe = subscribePosts(load);
    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, []);

  function handlePost() {
    const text = draft.trim();
    if (!text) return;
    setDraft('');
    createPost(userId, myName, text);
  }

  return (
    <>
      <div className="composer">
        <textarea placeholder="Share something with the group…" value={draft} onChange={(e) => setDraft(e.target.value)} rows={2} />
        <button className="btn btn-primary btn-sm" onClick={handlePost} disabled={!draft.trim()}>
          Post
        </button>
      </div>
      <div className="card">
        {posts.length === 0 ? (
          <div style={{ padding: '16px 4px', color: 'var(--text-faint)', fontSize: 13 }}>
            No posts yet - be the first to share something.
          </div>
        ) : (
          posts.map((p) => (
            <div className="feed-item" key={p.id}>
              <div className="feed-avatar">{initials(p.name)}</div>
              <div className="feed-body">
                <div className="feed-text">
                  <b>{p.name}</b> {p.text}
                </div>
                <div className="feed-time">{timeAgo(p.created_at)}</div>
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
}

function FriendsTab({ userId }: { userId: string }) {
  const openDM = useAppStore((s) => s.openDM);
  const [profiles, setProfiles] = useState<PublicProfile[]>([]);
  const [friendships, setFriendships] = useState<Friendship[]>([]);

  useEffect(() => {
    let cancelled = false;
    function load() {
      Promise.all([fetchLeaderboard(), fetchFriendships(userId)]).then(([p, f]) => {
        if (!cancelled) {
          setProfiles(p);
          setFriendships(f);
        }
      });
    }
    load();
    const un1 = subscribeLeaderboard(load);
    const un2 = subscribeFriendships(load);
    return () => {
      cancelled = true;
      un1();
      un2();
    };
  }, [userId]);

  const byId = new Map(profiles.map((p) => [p.user_id, p]));
  const incoming = friendships.filter((f) => f.status === 'pending' && f.addressee_id === userId);
  const outgoingPending = new Set(friendships.filter((f) => f.status === 'pending' && f.requester_id === userId).map((f) => f.addressee_id));
  const friendIds = new Set(
    friendships.filter((f) => f.status === 'accepted').map((f) => (f.requester_id === userId ? f.addressee_id : f.requester_id)),
  );
  const knownIds = new Set(friendships.map((f) => (f.requester_id === userId ? f.addressee_id : f.requester_id)));
  const discoverable = profiles.filter((p) => p.user_id !== userId && !knownIds.has(p.user_id));
  const friends = profiles.filter((p) => friendIds.has(p.user_id));

  return (
    <>
      {incoming.length > 0 && (
        <>
          <div className="section-label">Friend requests</div>
          <div className="card" style={{ marginBottom: 18 }}>
            {incoming.map((req) => {
              const p = byId.get(req.requester_id);
              return (
                <div className="friend-row" key={req.id}>
                  <div className="league-avatar">{initials(p?.name || '?')}</div>
                  <div className="league-name" style={{ flex: 1 }}>
                    {p?.name || 'Someone'}
                  </div>
                  <div className="friend-actions">
                    <button className="btn btn-sm btn-primary" onClick={() => respondToFriendRequest(req.id, true)}>
                      Accept
                    </button>
                    <button className="btn btn-sm btn-ghost" onClick={() => respondToFriendRequest(req.id, false)}>
                      Decline
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      <div className="section-label">Friends</div>
      <div className="card" style={{ marginBottom: 18 }}>
        {friends.length === 0 ? (
          <div style={{ padding: '16px 4px', color: 'var(--text-faint)', fontSize: 13 }}>
            No friends yet - add someone below.
          </div>
        ) : (
          friends.map((f) => (
            <div className="friend-row" key={f.user_id}>
              <div className="league-avatar">{initials(f.name)}</div>
              <div className="league-name" style={{ flex: 1 }}>
                {f.name} · Lv {f.level}
              </div>
              <button className="btn btn-sm btn-ghost" onClick={() => openDM(f.user_id, f.name)}>
                Message
              </button>
            </div>
          ))
        )}
      </div>

      <div className="section-label">Find people</div>
      <div className="card">
        {discoverable.length === 0 ? (
          <div style={{ padding: '16px 4px', color: 'var(--text-faint)', fontSize: 13 }}>
            Everyone testing Somax is already your friend or has a pending request.
          </div>
        ) : (
          discoverable.map((p) => (
            <div className="friend-row" key={p.user_id}>
              <div className="league-avatar">{initials(p.name)}</div>
              <div className="league-name" style={{ flex: 1 }}>
                {p.name} · Lv {p.level}
              </div>
              {outgoingPending.has(p.user_id) ? (
                <span style={{ fontSize: 12, color: 'var(--text-faint)', fontWeight: 700 }}>Requested</span>
              ) : (
                <button className="btn btn-sm btn-ghost" onClick={() => sendFriendRequest(userId, p.user_id)}>
                  Add friend
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </>
  );
}

export function CommunityScreen() {
  const userId = useUserId();
  const profile = useAppStore((s) => s.profile);
  const [tab, setTab] = useState<'feed' | 'friends'>('feed');
  const thumbRef = useRef<HTMLDivElement>(null);
  const btnRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const [thumbStyle, setThumbStyle] = useState<{ width: number; left: number }>({ width: 0, left: 0 });

  useEffect(() => {
    const btn = btnRefs.current[tab];
    if (btn) setThumbStyle({ width: btn.offsetWidth, left: btn.offsetLeft });
  }, [tab]);

  if (!userId || !profile) return null;

  return (
    <>
      <div className="seg">
        <div className="seg-thumb" ref={thumbRef} style={{ width: thumbStyle.width, left: thumbStyle.left }} />
        {TABS.map((t) => (
          <button
            key={t.id}
            ref={(el) => {
              btnRefs.current[t.id] = el;
            }}
            className={tab === t.id ? 'active' : ''}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>
      {tab === 'feed' ? <FeedTab userId={userId} myName={profile.name} /> : <FriendsTab userId={userId} />}
    </>
  );
}
