import { useEffect, useState } from 'react';
import { CharacterThumbnail } from '../character/CharacterThumbnail';
import { CharacterStage } from '../character/CharacterStage';
import { Icon } from '../Icon';
import { FeedPostCard } from './FeedPostCard';
import { useAppStore } from '../../store/useAppStore';
import { useUserId } from '../../lib/useSession';
import { useMyWorkouts } from '../../lib/customWorkouts';
import { useFeedEngagement } from '../../lib/useFeedEngagement';
import { encodeProgramMessage } from '../../lib/programShare';
import { tierFor } from '../../lib/character';
import { timeAgo } from '../../lib/format';
import { workoutTypeById } from '../../data/workoutTypes';
import {
  createPost,
  deletePost,
  fetchFriendships,
  fetchPostsByUser,
  fetchProfile,
  respondToFriendRequest,
  sendDM,
  sendFriendRequest,
  subscribeFriendships,
  subscribeLeaderboard,
  subscribePosts,
  type CommunityPost,
  type Friendship,
  type PublicProfile,
} from '../../lib/social';

const TABS = [
  { id: 'activity', label: 'Activity' },
  { id: 'feed', label: 'Feed' },
  { id: 'character', label: 'Character' },
] as const;
type Tab = (typeof TABS)[number]['id'];

export function ProfileViewScreen() {
  const viewedId = useAppStore((s) => s.viewingProfile);
  const openDM = useAppStore((s) => s.openDM);
  const openProfile = useAppStore((s) => s.openProfile);
  const showToast = useAppStore((s) => s.showToast);
  const myId = useUserId();
  const myProfile = useAppStore((s) => s.profile);
  const myWorkouts = useMyWorkouts();

  const [profile, setProfile] = useState<PublicProfile | null | undefined>(undefined);
  const [friendship, setFriendship] = useState<Friendship | null>(null);
  const [sharePickerOpen, setSharePickerOpen] = useState(false);
  const [tab, setTab] = useState<Tab>('activity');
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const engagement = useFeedEngagement(posts.map((p) => p.id), myId ?? '');

  useEffect(() => {
    if (!viewedId || !myId) return;
    let cancelled = false;
    async function load() {
      const [p, friendships] = await Promise.all([fetchProfile(viewedId!), fetchFriendships(myId!)]);
      if (cancelled) return;
      setProfile(p);
      setFriendship(friendships.find((f) => f.requester_id === viewedId || f.addressee_id === viewedId) ?? null);
    }
    load();
    // Without these, accepting/declining right here on the profile (or a
    // change made from elsewhere, e.g. the Friends tab) would leave this
    // screen showing the stale pending state - it was only ever fetched
    // once on mount.
    const un1 = subscribeFriendships(load);
    const un2 = subscribeLeaderboard(load);
    return () => {
      cancelled = true;
      un1();
      un2();
    };
  }, [viewedId, myId]);

  useEffect(() => {
    if (!viewedId) return;
    let cancelled = false;
    function load() {
      fetchPostsByUser(viewedId!).then((rows) => {
        if (!cancelled) setPosts(rows);
      });
    }
    load();
    const un = subscribePosts(load);
    return () => {
      cancelled = true;
      un();
    };
  }, [viewedId]);

  if (!viewedId || !myId) return null;
  if (profile === undefined) return null;
  if (profile === null) {
    return (
      <div className="empty-hint" style={{ padding: 24 }}>
        Couldn't load this profile.
      </div>
    );
  }

  const isSelf = viewedId === myId;
  const t = tierFor(profile.level);
  const isFriend = friendship?.status === 'accepted';
  const isOutgoing = friendship?.status === 'pending' && friendship.requester_id === myId;
  const isIncoming = friendship?.status === 'pending' && friendship.addressee_id === myId;
  // Private profile: everyone still sees the name/avatar (the feed and
  // leaderboard both show those), but stats, activity and their post feed
  // only show to the owner and accepted friends. Character stays visible -
  // same reasoning, it's just the avatar.
  const isLocked = !isSelf && profile.is_private && !isFriend;

  // Top 3 most-tagged workout types among their own posts - the closest
  // real signal we have to "favorite workouts" without a dedicated
  // per-category time-logged table (which this app doesn't track yet).
  const typeCounts = new Map<string, number>();
  for (const p of posts) {
    if (!p.workout_type) continue;
    typeCounts.set(p.workout_type, (typeCounts.get(p.workout_type) ?? 0) + 1);
  }
  const favoriteTypes = [...typeCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3);

  async function handleShareDM(workoutId: string) {
    if (!myId || !viewedId) return;
    const program = myWorkouts.find((w) => w.id === workoutId);
    if (!program) return;
    await sendDM(myId, viewedId, encodeProgramMessage({ name: program.name, duration: program.duration, exercises: program.exercises, category: program.category }));
    setSharePickerOpen(false);
    showToast(`Shared with ${profile!.name}`);
  }

  // Posting a program publicly (vs. DMing it privately, above) - this is
  // what makes it show up as a normal feed post with the workout attached,
  // not just a private share between two people.
  async function handleSharePost(workoutId: string) {
    if (!myId || !myProfile) return;
    const program = myWorkouts.find((w) => w.id === workoutId);
    if (!program) return;
    await createPost(myId, myProfile.name, `Sharing my ${program.name} program`, program.category, null, {
      name: program.name,
      duration: program.duration,
      category: program.category,
      exercises: program.exercises,
    });
    setSharePickerOpen(false);
    showToast('Posted to the feed');
  }

  return (
    <>
      <div className="pv-header">
        <div className="pv-avatar">
          {profile.photo_url ? (
            <img src={profile.photo_url} alt={profile.name} className="fit-img" draggable={false} />
          ) : (
            <CharacterThumbnail cfg={profile.character ?? { base: 'female', build: 'regular', skin: 1, hair: 'none', hairColor: 0, outfit: 'none', outfitColor: 0 }} mode="full" />
          )}
        </div>
        <div className="pv-stats">
          <div className="pv-stat">
            <div className="pv-stat-num">{posts.length}</div>
            <div className="pv-stat-label">Posts</div>
          </div>
          <div className="pv-stat">
            <div className="pv-stat-num">{profile.level}</div>
            <div className="pv-stat-label">Level</div>
          </div>
          <div className="pv-stat">
            <div className="pv-stat-num">{profile.current_streak}</div>
            <div className="pv-stat-label">Streak</div>
          </div>
        </div>
      </div>

      <div className="pv-name">{profile.name}</div>
      <div className="pv-tier">{t.name} tier</div>

      {!isSelf && (
        <div className="pv-actions">
          {isFriend ? (
            <>
              <button className="btn btn-sm btn-primary" style={{ flex: 1 }} onClick={() => openDM(profile!.user_id, profile!.name)}>
                Message
              </button>
              <button className="btn btn-sm btn-ghost" style={{ flex: 1 }} onClick={() => setSharePickerOpen((v) => !v)}>
                Share a workout
              </button>
            </>
          ) : isIncoming ? (
            <>
              <button className="btn btn-sm btn-primary" style={{ flex: 1 }} onClick={() => friendship && respondToFriendRequest(friendship.id, true)}>
                Accept request
              </button>
              <button className="btn btn-sm btn-ghost" style={{ flex: 1 }} onClick={() => friendship && respondToFriendRequest(friendship.id, false)}>
                Decline
              </button>
            </>
          ) : isOutgoing ? (
            <span style={{ fontSize: 12, color: 'var(--text-faint)', fontWeight: 700, alignSelf: 'center', margin: '0 auto' }}>Request sent</span>
          ) : (
            <button className="btn btn-sm btn-primary" style={{ flex: 1 }} onClick={() => sendFriendRequest(myId, profile!.user_id)}>
              Add friend
            </button>
          )}
        </div>
      )}

      {sharePickerOpen && (
        <div className="card" style={{ marginBottom: 18 }}>
          {myWorkouts.length === 0 ? (
            <div className="empty-hint">Create a custom program in Train first.</div>
          ) : (
            myWorkouts.map((w) => (
              <div key={w.id} className="share-workout-row">
                <span>{w.name}</span>
                <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                  <button className="btn btn-ghost btn-sm" onClick={() => handleShareDM(w.id)}>
                    Message
                  </button>
                  <button className="btn btn-ghost btn-sm" onClick={() => handleSharePost(w.id)}>
                    Post
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {!isLocked && (
        <>
          <div className="section-label">Key achievements</div>
          <div className="pv-achievements">
            <div className="pv-achievement">
              <div className="pv-achievement-icon">
                <Icon name="coin" style={{ width: 21, height: 21 }} />
              </div>
              <div className="pv-achievement-num">{profile.total_xp.toLocaleString()}</div>
              <div className="pv-achievement-label">Total XP</div>
            </div>
            <div className="pv-achievement">
              <div className="pv-achievement-icon">
                <Icon name="trophy" style={{ width: 21, height: 21 }} />
              </div>
              <div className="pv-achievement-num">{profile.monthly_xp.toLocaleString()}</div>
              <div className="pv-achievement-label">XP this month</div>
            </div>
            <div className="pv-achievement">
              <div className="pv-achievement-icon">
                <Icon name="flame" style={{ width: 21, height: 21 }} />
              </div>
              <div className="pv-achievement-num">{profile.current_streak}</div>
              <div className="pv-achievement-label">Day streak</div>
            </div>
          </div>

          {favoriteTypes.length > 0 && (
            <>
              <div className="section-label">Favorite workouts</div>
              <div className="pv-favorites">
                {favoriteTypes.map(([typeId, count]) => {
                  const wt = workoutTypeById(typeId);
                  if (!wt) return null;
                  return (
                    <div className="pv-favorite" key={typeId}>
                      <div className="pv-favorite-icon">
                        <Icon name={wt.icon} style={{ width: 18, height: 18 }} />
                      </div>
                      <div className="pv-favorite-label">{wt.label}</div>
                      <div className="pv-favorite-count">
                        {count} post{count === 1 ? '' : 's'}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </>
      )}

      <div className="seg" style={{ marginTop: 6, marginBottom: 16 }}>
        <div className="seg-thumb" style={{ width: `calc((100% - 8px) / ${TABS.length})`, transform: `translateX(${TABS.findIndex((x) => x.id === tab) * 100}%)` }} />
        {TABS.map((tb) => (
          <button key={tb.id} className={tab === tb.id ? 'active' : ''} onClick={() => setTab(tb.id)}>
            {tb.label}
          </button>
        ))}
      </div>

      {tab === 'character' ? (
        <div className="pv-character-view">
          <div className="pv-character-shift">
            <CharacterStage
              view="studio"
              anim="idle"
              cfg={profile.character ?? { base: 'female', build: 'regular', skin: 1, hair: 'none', hairColor: 0, outfit: 'none', outfitColor: 0 }}
              level={profile.level}
              showPedestal={false}
            />
          </div>
        </div>
      ) : isLocked ? (
        <div className="card" style={{ padding: '18px 16px', textAlign: 'center' }}>
          <Icon name="lock" style={{ width: 20, height: 20, margin: '0 auto 8px', display: 'block', color: 'var(--text-faint)' }} />
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 3 }}>{profile.name}'s profile is private</div>
          <div style={{ fontSize: 12, color: 'var(--text-faint)' }}>Add them as a friend to see their activity and feed.</div>
        </div>
      ) : tab === 'activity' ? (
        <div className="card">
          {profile.recent_activity.length === 0 ? (
            <div style={{ padding: '16px 4px', color: 'var(--text-faint)', fontSize: 13 }}>Nothing logged yet.</div>
          ) : (
            profile.recent_activity.map((a, i) => (
              <div className="goal-row" key={i}>
                <div className="goal-main">
                  <div className="goal-title">{a.label}</div>
                  <div className="goal-meta">{timeAgo(a.at)}</div>
                </div>
                <div className="goal-xp">+{a.xp} XP</div>
              </div>
            ))
          )}
        </div>
      ) : posts.length === 0 ? (
        <div className="card" style={{ padding: '16px 4px', color: 'var(--text-faint)', fontSize: 13 }}>
          No posts yet.
        </div>
      ) : (
        posts.map((p) => (
          <FeedPostCard
            key={p.id}
            post={p}
            character={profile.character}
            photoUrl={profile.photo_url}
            myUserId={myId}
            liked={engagement.isLikedByMe(p.id)}
            likeCount={engagement.likeCountFor(p.id)}
            comments={engagement.commentsFor(p.id)}
            commentsOpen={engagement.commentsOpenFor(p.id)}
            commentDraft={engagement.draftFor(p.id)}
            onOpenProfile={openProfile}
            onToggleLike={() => engagement.toggleLike(p.id)}
            onToggleComments={() => engagement.toggleComments(p.id)}
            onCommentDraftChange={(text) => engagement.setDraft(p.id, text)}
            onSubmitComment={() => engagement.submitComment(p.id, myProfile?.name ?? 'Someone')}
            onDeleteComment={engagement.removeComment}
            onDeletePost={() => deletePost(p.id)}
          />
        ))
      )}
    </>
  );
}
