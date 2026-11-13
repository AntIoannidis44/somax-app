import { useEffect, useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { useUserId } from '../../lib/useSession';
import { groupGradient } from '../../lib/groupIcon';
import {
  deletePost,
  fetchFriends,
  fetchFriendships,
  fetchLastDMPerPartner,
  fetchLeaderboard,
  fetchPosts,
  fetchUnreadDMCounts,
  respondToFriendRequest,
  sendFriendRequest,
  subscribeDMs,
  subscribeFriendships,
  subscribeLeaderboard,
  subscribePosts,
  type CommunityPost,
  type Friendship,
  type PublicProfile,
} from '../../lib/social';
import { createGroup, fetchLastGroupMessagesFor, fetchMyGroups, subscribeGroupMessages, subscribeMyGroups } from '../../lib/groups';
import { messagePreview } from '../../lib/messagePreview';
import { useFeedEngagement } from '../../lib/useFeedEngagement';
import { FeedPostCard } from './FeedPostCard';
import { WeekSummary } from './WeekSummary';
import { isProgramPost } from '../../lib/programPosts';
import { isRecipePost, recipeFromPost, type RecipeToShare } from '../../lib/recipePosts';
import { ShareRecipeSheet } from './ShareRecipeSheet';
import { MyRecipesScreen } from './MyRecipesScreen';
import { UserAvatar } from './UserAvatar';
import { Icon } from '../Icon';
import { WORKOUT_TYPES } from '../../data/workoutTypes';
import type { CharacterConfig } from '../../types';
import { tierFor } from '../../lib/character';
import { timeAgo } from '../../lib/format';

const TABS = [
  { id: 'feed', label: 'Feed' },
  { id: 'friends', label: 'Friends' },
  { id: 'messages', label: 'Messages' },
] as const;

function FeedTab({ userId, myName }: { userId: string; myName: string }) {
  const openProfile = useAppStore((s) => s.openProfile);
  const openComposer = useAppStore((s) => s.openComposer);
  const myCharacter = useAppStore((s) => s.character);
  const myPhotoUrl = useAppStore((s) => s.profile?.photoUrl ?? null);
  const unreadDM = useAppStore((s) => s.unreadDM);
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [feedError, setFeedError] = useState(false);
  const [filterType, setFilterType] = useState<string | 'all'>('all');
  const [contentFilter, setContentFilter] = useState<'all' | 'programs' | 'posts' | 'nutrition'>('all');
  const [feedSort, setFeedSort] = useState<'recent' | 'trending'>('recent');
  const [feedScope, setFeedScope] = useState<'community' | 'friends'>('community');
  const [myRecipesOpen, setMyRecipesOpen] = useState(false);
  const [shareTarget, setShareTarget] = useState<{ recipe: RecipeToShare; sourcePostId: string } | null>(null);
  const [friendIds, setFriendIds] = useState<Set<string>>(new Set());
  const [characters, setCharacters] = useState<Map<string, { character: CharacterConfig | null; photoUrl: string | null; level: number; name: string }>>(new Map());
  const engagement = useFeedEngagement(posts.map((p) => p.id), userId);

  useEffect(() => {
    let cancelled = false;
    let retryTimer: ReturnType<typeof setTimeout> | null = null;
    function load() {
      fetchPosts()
        .then((rows) => {
          if (cancelled) return;
          setPosts(rows);
          setFeedError(false);
        })
        .catch((err) => {
          if (cancelled) return;
          // A denied/dropped read, not necessarily an empty feed - keep
          // whatever posts are already on screen and quietly retry,
          // instead of wiping them and looking like the feed got cleared.
          console.error('[feed] fetchPosts failed:', err);
          setFeedError(true);
          retryTimer = setTimeout(load, 4000);
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
      if (retryTimer) clearTimeout(retryTimer);
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
  // Programs = a routine someone shared for others to add. Nutrition =
  // shared recipes/favourite meals. Posts = everything else, including
  // finished workouts and Watch activities (social posts).
  const contentFiltered =
    contentFilter === 'all'
      ? scoped
      : contentFilter === 'programs'
        ? scoped.filter(isProgramPost)
        : contentFilter === 'nutrition'
          ? scoped.filter(isRecipePost)
          : scoped.filter((p) => !isProgramPost(p) && !isRecipePost(p));
  const typeFiltered = filterType === 'all' ? contentFiltered : contentFiltered.filter((p) => p.workout_type === filterType);
  // Trending has no real signal yet, so likes + comments + shares stands
  // in for it - ranked highest first; Recent just keeps created_at order.
  const shown =
    feedSort === 'trending'
      ? [...typeFiltered].sort(
          (a, b) =>
            engagement.likeCountFor(b.id) + engagement.commentsFor(b.id).length + b.shares_count -
            (engagement.likeCountFor(a.id) + engagement.commentsFor(a.id).length + a.shares_count),
        )
      : typeFiltered;
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
            const unread = unreadDM[id] ?? 0;
            return (
              <button key={id} className="story" onClick={() => openProfile(id)}>
                <span className={`av-ring${postedTodayIds.has(id) ? ' on' : ''}`} style={{ position: 'relative' }}>
                  <UserAvatar className="story-av" name={c.name} character={c.character} photoUrl={c.photoUrl} />
                  {unread > 0 && <span className="friend-unread-badge">{unread > 9 ? '9+' : unread}</span>}
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
          <button className={contentFilter === 'nutrition' ? 'on' : ''} onClick={() => setContentFilter('nutrition')}>
            <Icon name="nutrition" />
            Nutrition
          </button>
        </div>
      </div>
      {contentFilter === 'nutrition' ? (
        <div className="feed-filters" style={{ justifyContent: 'space-between' }}>
          <div className="scope">
            <button className={feedSort === 'recent' ? 'on' : ''} onClick={() => setFeedSort('recent')}>
              Recent
            </button>
            <button className={feedSort === 'trending' ? 'on' : ''} onClick={() => setFeedSort('trending')}>
              <Icon name="flame" />
              Trending
            </button>
          </div>
          <button className="link-btn" onClick={() => setMyRecipesOpen(true)}>
            My recipes
          </button>
        </div>
      ) : (
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
      )}

      <WeekSummary />

      {feedError && (
        <div className="banner" style={{ marginBottom: 14 }}>
          <Icon name="info" />
          <span>Having trouble loading the latest posts - retrying…</span>
        </div>
      )}

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
          {feedError
            ? 'Could not load posts right now.'
            : scoped.length === 0
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
            onShareRecipe={(post) => {
              const recipe = recipeFromPost(post);
              if (recipe) setShareTarget({ recipe, sourcePostId: post.id });
            }}
          />
        ))
      )}

      <MyRecipesScreen open={myRecipesOpen} onClose={() => setMyRecipesOpen(false)} />
      {shareTarget && (
        <ShareRecipeSheet
          recipe={shareTarget.recipe}
          sourcePostId={shareTarget.sourcePostId}
          initialStep="friends"
          onClose={() => setShareTarget(null)}
        />
      )}
    </>
  );
}

function FriendsTab({ userId }: { userId: string }) {
  const openDM = useAppStore((s) => s.openDM);
  const openProfile = useAppStore((s) => s.openProfile);
  const setFriendCount = useAppStore((s) => s.setFriendCount);
  const unreadDM = useAppStore((s) => s.unreadDM);
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
    const unread = unreadDM[p.user_id] ?? 0;
    return (
      <div className="friend-row">
        <span className={`av-ring${ring && recent ? ' on' : ''}`} style={{ position: 'relative' }}>
          <UserAvatar className="league-avatar" name={p.name} character={p.character} photoUrl={p.photo_url} onClick={() => openProfile(p.user_id)} />
          {unread > 0 && <span className="friend-unread-badge">{unread > 9 ? '9+' : unread}</span>}
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
              <button className="btn btn-sm btn-ghost" onClick={() => openDM(f.user_id, f.name, f.photo_url, f.character)}>
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

interface Conversation {
  id: string;
  kind: 'individual' | 'group';
  name: string;
  photoUrl: string | null;
  character: CharacterConfig | null;
  preview: string;
  at: string | null;
  unread: number;
}

function MessagesTab({ userId }: { userId: string }) {
  const openDM = useAppStore((s) => s.openDM);
  const openGroup = useAppStore((s) => s.openGroup);
  const showToast = useAppStore((s) => s.showToast);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'individual' | 'group'>('all');
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState('');
  const [picked, setPicked] = useState<Set<string>>(new Set());
  const [friendProfiles, setFriendProfiles] = useState<PublicProfile[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const [friends, lastDms, unreadCounts, groups] = await Promise.all([
        fetchFriends(userId),
        fetchLastDMPerPartner(userId),
        fetchUnreadDMCounts(userId),
        fetchMyGroups(userId),
      ]);
      const groupMsgs = await fetchLastGroupMessagesFor(groups.map((g) => g.id));
      if (cancelled) return;
      const individuals: Conversation[] = friends.map((f) => {
        const last = lastDms[f.user_id];
        return {
          id: f.user_id,
          kind: 'individual',
          name: f.name,
          photoUrl: f.photo_url,
          character: f.character,
          preview: last ? messagePreview(last.text) : 'Say hi 👋',
          at: last?.created_at ?? null,
          unread: unreadCounts[f.user_id] ?? 0,
        };
      });
      const groupConvos: Conversation[] = groups.map((g) => {
        const last = groupMsgs[g.id];
        return {
          id: g.id,
          kind: 'group',
          name: g.name,
          photoUrl: g.photo_url,
          character: null,
          preview: last ? `${last.sender_name}: ${messagePreview(last.text)}` : 'No messages yet',
          at: last?.created_at ?? null,
          unread: 0,
        };
      });
      setConversations([...individuals, ...groupConvos]);
    }
    load();
    const un1 = subscribeDMs(load);
    const un2 = subscribeMyGroups(load);
    const un3 = subscribeFriendships(load);
    const un4 = subscribeGroupMessages(load);
    return () => {
      cancelled = true;
      un1();
      un2();
      un3();
      un4();
    };
  }, [userId]);

  const q = query.trim().toLowerCase();
  const shown = conversations
    .filter((c) => (typeFilter === 'all' || c.kind === typeFilter) && (!q || c.name.toLowerCase().includes(q)))
    .sort((a, b) => {
      if (a.at && b.at) return new Date(b.at).getTime() - new Date(a.at).getTime();
      if (a.at) return -1;
      if (b.at) return 1;
      return a.name.localeCompare(b.name);
    });

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
      <div className="search-field">
        <Icon name="search" />
        <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search messages" aria-label="Search messages" />
      </div>
      <div className="feed-filters">
        <div className="scope">
          <button className={typeFilter === 'all' ? 'on' : ''} onClick={() => setTypeFilter('all')}>
            All
          </button>
          <button className={typeFilter === 'individual' ? 'on' : ''} onClick={() => setTypeFilter('individual')}>
            Individual
          </button>
          <button className={typeFilter === 'group' ? 'on' : ''} onClick={() => setTypeFilter('group')}>
            Groups
          </button>
        </div>
        <span className="divider" />
        <button className="link-btn" onClick={startCreate}>
          <Icon name="plus" style={{ width: 13, height: 13 }} /> New group
        </button>
      </div>

      {shown.length === 0 ? (
        <div className="card" style={{ padding: '16px 4px', color: 'var(--text-faint)', fontSize: 13 }}>
          {q ? 'No conversations match that name.' : 'No conversations yet - message a friend or start a group.'}
        </div>
      ) : (
        shown.map((c) => (
          <div
            className="msg-row"
            key={`${c.kind}-${c.id}`}
            onClick={() => (c.kind === 'individual' ? openDM(c.id, c.name, c.photoUrl, c.character) : openGroup(c.id, c.name, c.photoUrl))}
          >
            {c.kind === 'individual' ? (
              <UserAvatar className="msg-row-avatar" name={c.name} character={c.character} photoUrl={c.photoUrl} />
            ) : c.photoUrl ? (
              <span className="msg-row-avatar" style={{ padding: 0, overflow: 'hidden' }}>
                <img className="fit-img" src={c.photoUrl} alt="" />
              </span>
            ) : (
              <span className="group-icon" style={{ width: 50, height: 50, borderRadius: 16, background: groupGradient(c.name) }}>
                <Icon name="community" style={{ width: 22, height: 22 }} />
              </span>
            )}
            <div className="msg-row-main">
              <div className="msg-row-name">{c.name}</div>
              <div className="msg-row-preview">{c.preview}</div>
            </div>
            <div className="msg-row-meta">
              {c.at && <span className="msg-row-time">{timeAgo(c.at)}</span>}
              {c.unread > 0 && <span className="msg-unread-badge">{c.unread > 9 ? '9+' : c.unread}</span>}
            </div>
          </div>
        ))
      )}
    </>
  );
}

export function CommunityScreen() {
  const userId = useUserId();
  const profile = useAppStore((s) => s.profile);
  const [tab, setTab] = useState<'feed' | 'friends' | 'messages'>('feed');

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
        <MessagesTab userId={userId} />
      )}
    </>
  );
}
