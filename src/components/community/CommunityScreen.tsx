import { useEffect, useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { useUserId } from '../../lib/useSession';
import {
  deletePost,
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
import { createGroup, fetchMyGroups, subscribeMyGroups, type GroupMembership } from '../../lib/groups';
import { useFeedEngagement } from '../../lib/useFeedEngagement';
import { FeedPostCard } from './FeedPostCard';
import { WeekSummary } from './WeekSummary';
import { isProgramPost } from '../../lib/programPosts';
import { UserAvatar } from './UserAvatar';
import { Icon } from '../Icon';
import { WORKOUT_TYPES } from '../../data/workoutTypes';
import type { CharacterConfig } from '../../types';
import { tierFor } from '../../lib/character';
import { timeAgo } from '../../lib/format';

const TABS = [
  { id: 'feed', label: 'Feed' },
  { id: 'friends', label: 'Friends' },
  { id: 'groups', label: 'Groups' },
] as const;

function FeedTab({ userId, myName }: { userId: string; myName: string }) {
  const openProfile = useAppStore((s) => s.openProfile);
  const openComposer = useAppStore((s) => s.openComposer);
  const myCharacter = useAppStore((s) => s.character);
  const myPhotoUrl = useAppStore((s) => s.profile?.photoUrl ?? null);
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [filterType, setFilterType] = useState<string | 'all'>('all');
  const [contentFilter, setContentFilter] = useState<'all' | 'programs' | 'posts'>('all');
  const [feedScope, setFeedScope] = useState<'community' | 'friends'>('community');
  const [friendIds, setFriendIds] = useState<Set<string>>(new Set());
  const [characters, setCharacters] = useState<Map<string, { character: CharacterConfig | null; photoUrl: string | null; level: number; name: string }>>(new Map());
  const engagement = useFeedEngagement(posts.map((p) => p.id), userId);

  useEffect(() => {
    let cancelled = false;
    function load() {
      fetchPosts().then((rows) => {
        if (!cancelled) setPosts(rows);
      });
      fetchLeaderboard().then((rows) => {
        if (!cancelled) setCharacters(new Map(rows.map((r) => [r.user_id, { character: r.character, photoUrl: r.photo_url, level: r.level, name: r.name }])));
      });
      fetchFriendships(userId).then((rows) => {
        if (cancelled) return;
        const ids = rows.filter((f) => f.status === 'accepted').map((f) => (f.requester_id === userId ? f.addressee_id : f.requester_id));
        setFriendIds(new Set(ids));
      });
    }
    load();
    const unsubscribe = subscribePosts(load);
    const unsubscribeBoard = subscribeLeaderboard(load);
    const unsubscribeFriends = subscribeFriendships(load);
    return () => {
      cancelled = true;
      unsubscribe();
      unsubscribeBoard();
      unsubscribeFriends();
    };
  }, [userId]);

  // Community = the public feed, everyone's public posts. Friends = just
  // the people you're actually connected to, their own friends-only posts
  // included (you have access as their friend) - plus your own posts
  // either way, since you should always be able to find what you shared.
  const scoped =
    feedScope === 'community'
      ? posts.filter((p) => p.visibility === 'public')
      : posts.filter((p) => p.user_id === userId || friendIds.has(p.user_id));
  // Programs = a routine someone shared for others to add. Posts = everything
  // else, including finished workouts and Watch activities (social posts).
  const contentFiltered =
    contentFilter === 'all' ? scoped : contentFilter === 'programs' ? scoped.filter(isProgramPost) : scoped.filter((p) => !isProgramPost(p));
  const shown = filterType === 'all' ? contentFiltered : contentFiltered.filter((p) => p.workout_type === filterType);
  // Stories row: friends first, then anyone else who has posted. A gradient
  // ring means they posted in the last 24 hours.
  const dayAgo = Date.now() - 24 * 3600 * 1000;
  const postedTodayIds = new Set(posts.filter((p) => new Date(p.created_at).getTime() > dayAgo).map((p) => p.user_id));
  const storyIds = [...new Set([...friendIds, ...posts.map((p) => p.user_id)])]
    .filter((id) => id !== userId && characters.has(id))
    .sort((x, y) => Number(postedTodayIds.has(y)) - Number(postedTodayIds.has(x)))
    .slice(0, 12);

  return (
    <>
      {storyIds.length > 0 && (
        <div className="stories">
          {storyIds.map((id) => {
            const c = characters.get(id)!;
            return (
              <button key={id} className="story" onClick={() => openProfile(id)}>
                <span className={`av-ring${postedTodayIds.has(id) ? ' on' : ''}`}>
                  <UserAvatar className="story-av" name={c.name} character={c.character} photoUrl={c.photoUrl} />
                </span>
                <span className="n">{c.name.split(' ')[0]}</span>
              </button>
            );
          })}
        </div>
      )}

      <div className="feed-filters" style={{ marginBottom: 4 }}>
        <div className="scope">
          <button className={feedScope === 'community' ? 'on' : ''} onClick={() => setFeedScope('community')}>
            Everyone
          </button>
          <button className={feedScope === 'friends' ? 'on' : ''} onClick={() => setFeedScope('friends')}>
            <Icon name="lock" />
            Friends
          </button>
        </div>
        <span className="divider" />
        <div className="scope">
          <button className={contentFilter === 'all' ? 'on' : ''} onClick={() => setContentFilter('all')}>
            All
          </button>
          <button className={contentFilter === 'programs' ? 'on' : ''} onClick={() => setContentFilter('programs')}>
            <Icon name="dumbbell" />
            Programs
          </button>
          <button className={contentFilter === 'posts' ? 'on' : ''} onClick={() => setContentFilter('posts')}>
            <Icon name="comment" />
            Posts
          </button>
        </div>
      </div>
      <div className="feed-filters">
        <button className={`type-chip${filterType === 'all' ? ' active' : ''}`} onClick={() => setFilterType('all')}>
          All sports
        </button>
        {WORKOUT_TYPES.map((w) => (
          <button key={w.id} className={`type-chip${filterType === w.id ? ' active' : ''}`} onClick={() => setFilterType(w.id)}>
            <span className="sw" style={{ background: `var(${w.colorVar})` }} />
            {w.label}
          </button>
        ))}
      </div>

      <WeekSummary />

      <button className="composer-trigger" onClick={() => openComposer()}>
        <UserAvatar className="feed-avatar" name={myName} character={myCharacter} photoUrl={myPhotoUrl} />
        <span>Share a workout…</span>
        <span className="ct-icons">
          <span>
            <Icon name="camera" />
          </span>
          <span>
            <Icon name="dumbbell" />
          </span>
        </span>
      </button>

      {shown.length === 0 ? (
        <div className="card" style={{ padding: '16px 4px', color: 'var(--text-faint)', fontSize: 13 }}>
          {scoped.length === 0
            ? feedScope === 'friends'
              ? 'Nothing from your friends yet.'
              : 'No posts yet - be the first to share something.'
            : 'No posts of this type yet.'}
        </div>
      ) : (
        shown.map((p) => (
          <FeedPostCard
            key={p.id}
            post={p}
            character={characters.get(p.user_id)?.character}
            photoUrl={characters.get(p.user_id)?.photoUrl}
            level={characters.get(p.user_id)?.level}
            likedBy={engagement
              .likersFor(p.id)
              .filter((id) => characters.has(id))
              .map((id) => ({ id, name: characters.get(id)!.name, character: characters.get(id)!.character, photoUrl: characters.get(id)!.photoUrl }))}
            myUserId={userId}
            liked={engagement.isLikedByMe(p.id)}
            likeCount={engagement.likeCountFor(p.id)}
            comments={engagement.commentsFor(p.id)}
            commentsOpen={engagement.commentsOpenFor(p.id)}
            commentDraft={engagement.draftFor(p.id)}
            onOpenProfile={openProfile}
            onToggleLike={() => engagement.toggleLike(p.id)}
            onToggleComments={() => engagement.toggleComments(p.id)}
            onCommentDraftChange={(text) => engagement.setDraft(p.id, text)}
            onSubmitComment={() => engagement.submitComment(p.id, myName)}
            onDeleteComment={engagement.removeComment}
            onDeletePost={() => deletePost(p.id)}
          />
        ))
      )}
    </>
  );
}

function FriendsTab({ userId }: { userId: string }) {
  const openDM = useAppStore((s) => s.openDM);
  const openProfile = useAppStore((s) => s.openProfile);
  const setFriendCount = useAppStore((s) => s.setFriendCount);
  const [profiles, setProfiles] = useState<PublicProfile[]>([]);
  const [friendships, setFriendships] = useState<Friendship[]>([]);
  const [query, setQuery] = useState('');

  useEffect(() => {
    let cancelled = false;
    function load() {
      Promise.all([fetchLeaderboard(), fetchFriendships(userId)]).then(([p, f]) => {
        if (!cancelled) {
          setProfiles(p);
          setFriendships(f);
          setFriendCount(f.filter((x) => x.status === 'accepted').length);
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

  const q = query.trim().toLowerCase();
  const match = (p: PublicProfile) => !q || p.name.toLowerCase().includes(q);

  function statusLine(p: PublicProfile) {
    const last = p.recent_activity?.[0];
    const recent = last && Date.now() - new Date(last.at).getTime() < 3 * 86400000;
    return (
      <>
        Lv {p.level} · {tierFor(p.level).name}
        {recent && (
          <>
            {' · '}
            <span className="live">
              {last.label} {timeAgo(last.at)}
            </span>
          </>
        )}
      </>
    );
  }

  function Row({ p, ring, children }: { p: PublicProfile; ring?: boolean; children: React.ReactNode }) {
    const recent = !!p.recent_activity?.[0] && Date.now() - new Date(p.recent_activity[0].at).getTime() < 86400000;
    return (
      <div className="friend-row">
        <span className={`av-ring${ring && recent ? ' on' : ''}`}>
          <UserAvatar className="league-avatar" name={p.name} character={p.character} photoUrl={p.photo_url} onClick={() => openProfile(p.user_id)} />
        </span>
        <div style={{ flex: 1, minWidth: 0, cursor: 'pointer' }} onClick={() => openProfile(p.user_id)}>
          <div className="league-name">{p.name}</div>
          <div className="friend-sub">{statusLine(p)}</div>
        </div>
        {children}
      </div>
    );
  }

  return (
    <>
      <div className="search-field">
        <Icon name="search" />
        <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search people" aria-label="Search people" />
      </div>

      {incoming.length > 0 && (
        <>
          <div className="section-label">
            Requests
            <span className="sl-note">{incoming.length} new</span>
          </div>
          <div className="card">
            {incoming.map((req) => {
              const p = byId.get(req.requester_id);
              if (!p) return null;
              return (
                <Row key={req.id} p={p}>
                  <div className="friend-actions">
                    <button className="btn btn-sm btn-primary" onClick={() => respondToFriendRequest(req.id, true)}>
                      Accept
                    </button>
                    <button className="icon-btn ghost" aria-label="Decline" onClick={() => respondToFriendRequest(req.id, false)}>
                      <Icon name="x" style={{ width: 18, height: 18 }} />
                    </button>
                  </div>
                </Row>
              );
            })}
          </div>
        </>
      )}

      <div className="section-label">
        Friends
        <span className="sl-note">{friends.length}</span>
      </div>
      <div className="card">
        {friends.filter(match).length === 0 ? (
          <div className="empty-hint">{q ? 'No friends match that name.' : 'No friends yet - add someone below.'}</div>
        ) : (
          friends.filter(match).map((f) => (
            <Row key={f.user_id} p={f} ring>
              <button className="btn btn-sm btn-ghost" onClick={() => openDM(f.user_id, f.name)}>
                Message
              </button>
            </Row>
          ))
        )}
      </div>

      <div className="section-label">Find people</div>
      <div className="card">
        {discoverable.filter(match).length === 0 ? (
          <div className="empty-hint">{q ? 'No one matches that name.' : 'Everyone testing Somax is already your friend or has a pending request.'}</div>
        ) : (
          discoverable.filter(match).map((p) => (
            <Row key={p.user_id} p={p}>
              {outgoingPending.has(p.user_id) ? (
                <span className="viewpill">Requested</span>
              ) : (
                <button className="btn btn-sm btn-soft" onClick={() => sendFriendRequest(userId, p.user_id)}>
                  <Icon name="plus" style={{ width: 14, height: 14 }} /> Add
                </button>
              )}
            </Row>
          ))
        )}
      </div>
    </>
  );
}

// Each group gets a stable colour from its name.
const GROUP_GRADIENTS = [
  'linear-gradient(140deg, #0f8f5c, #0b5a3a)',
  'linear-gradient(140deg, #d4425c, #7a1d2c)',
  'linear-gradient(140deg, #1554e6, #0b2f8e)',
  'linear-gradient(140deg, #8936e8, #4b1a8c)',
  'linear-gradient(140deg, #c1830f, #7a4a08)',
  'linear-gradient(140deg, #0f95a5, #0a5560)',
];
function hashName(name: string): number {
  let h = 0;
  for (const ch of name) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return h;
}

function GroupsTab({ userId }: { userId: string }) {
  const openGroup = useAppStore((s) => s.openGroup);
  const showToast = useAppStore((s) => s.showToast);
  const [groups, setGroups] = useState<GroupMembership[]>([]);
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState('');
  const [picked, setPicked] = useState<Set<string>>(new Set());
  const [friendProfiles, setFriendProfiles] = useState<PublicProfile[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    function load() {
      fetchMyGroups(userId).then((rows) => {
        if (!cancelled) setGroups(rows);
      });
    }
    load();
    const unsubscribe = subscribeMyGroups(load);
    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [userId]);

  function startCreate() {
    setCreating(true);
    setName('');
    setPicked(new Set());
    Promise.all([fetchLeaderboard(), fetchFriendships(userId)]).then(([profiles, friendships]) => {
      const friendIds = new Set(
        friendships.filter((f) => f.status === 'accepted').map((f) => (f.requester_id === userId ? f.addressee_id : f.requester_id)),
      );
      setFriendProfiles(profiles.filter((p) => friendIds.has(p.user_id)));
    });
  }

  function togglePick(id: string) {
    setPicked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function handleCreate() {
    const trimmed = name.trim();
    if (!trimmed) return;
    setSaving(true);
    const id = await createGroup(userId, trimmed, [...picked]);
    setSaving(false);
    if (id) {
      showToast('Group created');
      setCreating(false);
      openGroup(id, trimmed);
    } else {
      showToast('Could not create the group');
    }
  }

  if (creating) {
    return (
      <>
        <div className="field">
          <label>Group name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Morning Run Crew" />
        </div>
        <div className="section-label">Add friends</div>
        <div className="card" style={{ marginBottom: 18 }}>
          {friendProfiles.length === 0 ? (
            <div className="empty-hint">Add some friends first, then come back to build a group.</div>
          ) : (
            friendProfiles.map((f) => (
              <div className="member-pick" key={f.user_id} onClick={() => togglePick(f.user_id)}>
                <div className={`member-pick-check${picked.has(f.user_id) ? ' on' : ''}`}>
                  {picked.has(f.user_id) && <Icon name="check" style={{ width: 12, height: 12 }} />}
                </div>
                <UserAvatar className="league-avatar" name={f.name} character={f.character} photoUrl={f.photo_url} />
                <div className="league-name">{f.name}</div>
              </div>
            ))
          )}
        </div>
        <button className="btn btn-primary" disabled={!name.trim() || saving} onClick={handleCreate}>
          {saving ? 'Creating…' : `Create group${picked.size ? ` · ${picked.size} invited` : ''}`}
        </button>
        <div style={{ height: 10 }} />
        <button className="btn btn-ghost" disabled={saving} onClick={() => setCreating(false)}>
          Cancel
        </button>
      </>
    );
  }

  return (
    <>
      <div className="section-label">
        My groups
        <button className="link-btn" onClick={startCreate}>
          <Icon name="plus" style={{ width: 13, height: 13 }} /> Create
        </button>
      </div>
      <div className="card">
        {groups.length === 0 ? (
          <div className="empty-hint">No groups yet - start one with a few friends.</div>
        ) : (
          groups.map((g) => (
            <div className="group-row" key={g.id} onClick={() => openGroup(g.id, g.name)}>
              <div className="group-icon" style={{ background: GROUP_GRADIENTS[hashName(g.name) % GROUP_GRADIENTS.length] }}>
                <Icon name="community" style={{ width: 20, height: 20 }} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="league-name">{g.name}</div>
                <div className="group-meta">{g.role === 'admin' ? 'You created this' : 'Member'}</div>
              </div>
              <Icon name="chevron" style={{ width: 16, height: 16, color: 'var(--text-faint)' }} />
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
  const [tab, setTab] = useState<'feed' | 'friends' | 'groups'>('feed');

  const [requestCount, setRequestCount] = useState(0);

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    const load = () =>
      fetchFriendships(userId).then((rows) => {
        if (!cancelled) setRequestCount(rows.filter((f) => f.status === 'pending' && f.addressee_id === userId).length);
      });
    load();
    const unsubscribe = subscribeFriendships(load);
    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [userId]);

  if (!userId || !profile) return null;

  // Tab buttons are flex:1 (equal width), so the pill's position is fully
  // determined by index/count - no DOM measurement needed, which means it's
  // correct on the very first paint instead of only after a layout effect
  // runs (that gap was reading as the landing tab showing greyed-out/unselected).
  const activeIndex = TABS.findIndex((t) => t.id === tab);


  return (
    <>
      <div className="seg">
        <div
          className="seg-thumb"
          style={{ width: `calc((100% - 8px) / ${TABS.length})`, transform: `translateX(${activeIndex * 100}%)` }}
        />
        {TABS.map((t) => (
          <button key={t.id} className={tab === t.id ? 'active' : ''} onClick={() => setTab(t.id)}>
            {t.label}
            {t.id === 'friends' && requestCount > 0 && <span className="tab-badge">{requestCount}</span>}
          </button>
        ))}
      </div>
      {tab === 'feed' ? (
        <FeedTab userId={userId} myName={profile.name} />
      ) : tab === 'friends' ? (
        <FriendsTab userId={userId} />
      ) : (
        <GroupsTab userId={userId} />
      )}
    </>
  );
}
