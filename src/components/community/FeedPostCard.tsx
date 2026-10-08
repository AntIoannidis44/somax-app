import { useState } from 'react';
import { Icon } from '../Icon';
import { TypeIconBadge } from '../TypeIconBadge';
import { UserAvatar } from './UserAvatar';
import { useAppStore } from '../../store/useAppStore';
import { saveWorkout } from '../../lib/customWorkouts';
import { workoutTypeById } from '../../data/workoutTypes';
import { initials, timeAgo } from '../../lib/format';
import { RouteMap } from '../train/RouteMap';
import type { CommunityPost, PostComment } from '../../lib/social';
import type { CharacterConfig } from '../../types';

function FeedWorkoutCard({ workout, userId }: { workout: NonNullable<CommunityPost['workout']>; userId: string | null }) {
  const showToast = useAppStore((s) => s.showToast);
  const openSessionDetail = useAppStore((s) => s.openSessionDetail);
  const [saved, setSaved] = useState(false);
  // Explicit flag, not inferred from distanceMeters/route being present -
  // HealthKit can legitimately return a real Watch activity with no
  // distance (logged indoors, or a source that never wrote it), and that
  // should still open as a session, just without a distance/pace/map.
  const isSession = workout.isActivity === true;

  async function handleAdd() {
    if (!userId) return;
    const id = await saveWorkout(userId, { name: workout.name, duration: workout.duration, exercises: workout.exercises, category: workout.category });
    if (id) {
      setSaved(true);
      showToast('Added to your programs');
    } else {
      showToast('Could not add this program');
    }
  }

  return (
    <>
      <div
        className="feed-workout-card"
        style={isSession ? { cursor: 'pointer' } : undefined}
        onClick={isSession ? () => openSessionDetail(workout) : undefined}
      >
        <TypeIconBadge category={workout.category} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="feed-workout-name">{workout.name}</div>
          <div className="feed-workout-meta">
            {isSession
              ? workout.distanceMeters
                ? `${workout.duration} · ${(workout.distanceMeters / 1000).toFixed(2)} km`
                : workout.duration
              : `${workout.duration} · ${workout.exercises.length} exercises`}
          </div>
        </div>
        {isSession ? (
          <Icon name="chevron" style={{ width: 16, height: 16, color: 'var(--text-faint)', flexShrink: 0 }} />
        ) : (
          <button className="btn btn-ghost btn-sm" disabled={saved} onClick={handleAdd}>
            {saved ? 'Added' : 'Add'}
          </button>
        )}
      </div>
    </>
  );
}

interface FeedPostCardProps {
  post: CommunityPost;
  character?: CharacterConfig | null;
  photoUrl?: string | null;
  myUserId: string | null;
  liked: boolean;
  likeCount: number;
  comments: PostComment[];
  commentsOpen: boolean;
  commentDraft: string;
  onOpenProfile: (id: string) => void;
  onToggleLike: () => void;
  onToggleComments: () => void;
  onCommentDraftChange: (text: string) => void;
  onSubmitComment: () => void;
  onDeleteComment: (id: string) => void;
  onDeletePost?: () => void;
}

// A single feed post, styled to match Instagram/Threads conventions rather
// than this app's usual card chrome: no background/shadow of its own (sits
// flat on the page), content-first (text/image/workout), then a minimal
// icon-only action row, a light "N likes · N comments" line, and the
// timestamp last in small caps - not a bold name/time pair up top like a
// typical app notification list.
export function FeedPostCard({
  post,
  character,
  photoUrl,
  myUserId,
  liked,
  likeCount,
  comments,
  commentsOpen,
  commentDraft,
  onOpenProfile,
  onToggleLike,
  onToggleComments,
  onCommentDraftChange,
  onSubmitComment,
  onDeleteComment,
  onDeletePost,
}: FeedPostCardProps) {
  const wt = workoutTypeById(post.workout_type);

  return (
    <div className="feed-post">
      <div className="feed-post-head">
        <UserAvatar className="feed-avatar" name={post.name} character={character} photoUrl={photoUrl} onClick={() => onOpenProfile(post.user_id)} />
        <b className="feed-name" onClick={() => onOpenProfile(post.user_id)}>
          {post.name}
        </b>
        {wt && (
          <span className="feed-type-badge">
            <Icon name={wt.icon} style={{ width: 11, height: 11 }} />
            {wt.label}
          </span>
        )}
        {onDeletePost && post.user_id === myUserId && (
          <button
            className="feed-post-delete"
            title="Delete post"
            onClick={() => window.confirm('Delete this post? This removes it for everyone.') && onDeletePost()}
          >
            <Icon name="trash" style={{ width: 14, height: 14 }} />
          </button>
        )}
      </div>

      {post.location && (
        <div className="feed-location">
          <Icon name="pin" style={{ width: 12, height: 12 }} />
          {post.location}
        </div>
      )}
      {post.text && <div className="feed-text">{post.text}</div>}
      {post.image_url ? (
        <div className="feed-image" onDoubleClick={() => !liked && onToggleLike()}>
          <img src={post.image_url} alt="" loading="lazy" draggable={false} />
        </div>
      ) : (
        // No photo attached - if this is a GPS activity, the route itself
        // becomes the post's hero visual instead of leaving it text-only.
        // A real attached photo always wins when there is one.
        post.workout?.route &&
        post.workout.route.length > 1 && (
          <div className="feed-image" style={{ background: 'none' }} onDoubleClick={() => !liked && onToggleLike()}>
            <RouteMap points={post.workout.route} height={260} />
          </div>
        )
      )}
      {post.workout && <FeedWorkoutCard workout={post.workout} userId={myUserId} />}
      {post.link && (
        <a className="feed-link-chip" href={post.link} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()}>
          <Icon name="link" style={{ width: 12, height: 12 }} />
          {post.link.replace(/^https?:\/\//, '')}
        </a>
      )}

      <div className="feed-actions">
        <button className={`feed-action-btn${liked ? ' liked' : ''}`} onClick={onToggleLike}>
          <Icon name="heart" style={{ width: 21, height: 21, fill: liked ? 'currentColor' : 'none' }} />
        </button>
        <button className="feed-action-btn" onClick={onToggleComments}>
          <Icon name="comment" style={{ width: 20, height: 20 }} />
        </button>
      </div>

      {(likeCount > 0 || comments.length > 0) && (
        <div className="feed-stats-line">
          {likeCount > 0 && <span>{likeCount} like{likeCount === 1 ? '' : 's'}</span>}
          {comments.length > 0 && (
            <span className="feed-view-comments" onClick={onToggleComments}>
              {commentsOpen ? 'Hide comments' : comments.length === 1 ? 'View 1 comment' : `View all ${comments.length} comments`}
            </span>
          )}
        </div>
      )}

      {commentsOpen && (
        <div className="feed-comments">
          {comments.map((c) => (
            <div className="feed-comment" key={c.id}>
              <div className="feed-comment-avatar">{initials(c.name)}</div>
              <div className="feed-comment-body">
                <span className="feed-comment-name" onClick={() => onOpenProfile(c.user_id)}>
                  {c.name}
                </span>{' '}
                {c.text}
                {c.user_id === myUserId && (
                  <button className="feed-comment-del" onClick={() => onDeleteComment(c.id)}>
                    <Icon name="x" style={{ width: 11, height: 11 }} />
                  </button>
                )}
              </div>
            </div>
          ))}
          <div className="feed-comment-input-row">
            <input
              type="text"
              placeholder="Add a comment…"
              value={commentDraft}
              onChange={(e) => onCommentDraftChange(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && onSubmitComment()}
            />
            <button className="feed-comment-send" disabled={!commentDraft.trim()} onClick={onSubmitComment}>
              <Icon name="chevron" style={{ width: 15, height: 15 }} />
            </button>
          </div>
        </div>
      )}

      <div className="feed-timestamp">{timeAgo(post.created_at)}</div>
    </div>
  );
}
