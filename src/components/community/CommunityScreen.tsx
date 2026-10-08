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
import { UserAvatar } from './UserAvatar';
import { Icon } from '../Icon';
import { WORKOUT_TYPES } from '../../data/workoutTypes';
import type { CharacterConfig } from '../../types';

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
  const [characters, setCharacters] = useState<Map<string, { character: CharacterConfig | null; photoUrl: string | null }>>(new Map());
  const engagement = useFeedEngagement(posts.map((p) => p.id), userId);

  useEffect(() => {
    let cancelled = false;
    function load() {
      fetchPosts().then((rows) => {
        if (!cancelled) setPosts(rows);
      });
      fetchLeaderboard().then((rows) => {
        if (!cancelled) setCharacters(new Map(rows.map((r) => [r.user_id, { character: r.character, photoUrl: r.photo_url }])));
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
  // Programs = a real workout/activity is attached (a shared routine you
  // could browse and add) - Posts = everything else (text/photo updates
  // with nothing to add to your own training).
  const contentFiltered =
    contentFilter === 'all' ? scoped : contentFilter === 'programs' ? scoped.filter((p) => p.workout) : scoped.filter((p) => !p.workout);
  const shown = filterType === 'all' ? contentFiltered : contentFiltered.filter((p) => p.workout_type === filterType);

  return (
    <>
      <div className="composer-visibility" style={{ marginBottom: 12 }}>
        <button className={`composer-visibility-opt${feedScope === 'community' ? ' active' : ''}`} onClick={() => setFeedScope('community')}>
          <Icon name="community" style={{ width: 14, height: 14 }} />
          Community
        </button>
        <button className={`composer-visibility-opt${feedScope === 'friends' ? ' active' : ''}`} onClick={() => setFeedScope('friends')}>
          <Icon name="lock" style={{ width: 14, height: 14 }} />
          Friends
        </button>
      </div>

      <div className="composer-visibility" style={{ marginBottom: 12 }}>
        <button className={`composer-visibility-opt${contentFilter === 'all' ? ' active' : ''}`} onClick={() => setContentFilter('all')}>
          All
        </button>
        <button className={`composer-visibility-opt${contentFilter === 'programs' ? ' active' : ''}`} onClick={() => setContentFilter('programs')}>
          <Icon name="dumbbell" style={{ width: 14, height: 14 }} />
          Programs
        </button>
        <button className={`composer-visibility-opt${contentFilter === 'posts' ? ' active' : ''}`} onClick={() => setContentFilter('posts')}>
          <Icon name="comment" style={{ width: 14, height: 14 }} />
          Posts
        </button>
      </div>

      <div className="type-tabs">
        <button className={`type-chip${filterType === 'all' ? ' active' : ''}`} onClick={() => setFilterType('all')}>
          All
        </button>
        {WORKOUT_TYPES.map((w) => (
          <button key={w.id} className={`type-chip${filterType === w.id ? ' active' : ''}`} onClick={() => setFilterType(w.id)}>
            <Icon name={w.icon} style={{ width: 14, height: 14 }} />
            {w.label}
          </button>
        ))}
      </div>

      <button className="composer-trigger" onClick={() => openComposer()}>
        <UserAvatar className="feed-avatar" name={myName} character={myCharacter} photoUrl={myPhotoUrl} />
        <span>Share something…</span>
        <Icon name="plus" style={{ width: 17, height: 17, flexShrink: 0 }} />
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
                  <UserAvatar className="league-avatar" name={p?.name || '?'} character={p?.character} photoUrl={p?.photo_url} onClick={() => openProfile(req.requester_id)} />
                  <div className="league-name" style={{ flex: 1, cursor: 'pointer' }} onClick={() => openProfile(req.requester_id)}>
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
              <UserAvatar className="league-avatar" name={f.name} character={f.character} photoUrl={f.photo_url} onClick={() => openProfile(f.user_id)} />
              <div className="league-name" style={{ flex: 1, cursor: 'pointer' }} onClick={() => openProfile(f.user_id)}>
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
              <UserAvatar className="league-avatar" name={p.name} character={p.character} photoUrl={p.photo_url} onClick={() => openProfile(p.user_id)} />
              <div className="league-name" style={{ flex: 1, cursor: 'pointer' }} onClick={() => openProfile(p.user_id)}>
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
              <div className="group-icon">
                <Icon name="community" style={{ width: 18, height: 18 }} />
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
