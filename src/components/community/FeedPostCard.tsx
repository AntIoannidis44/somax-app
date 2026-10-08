import { useState, type ReactNode } from 'react';
import { Icon } from '../Icon';
import { TypeIconBadge } from '../TypeIconBadge';
import { UserAvatar } from './UserAvatar';
import { useAppStore } from '../../store/useAppStore';
import { saveWorkout } from '../../lib/customWorkouts';
import { workoutTypeById } from '../../data/workoutTypes';
import { initials, timeAgo } from '../../lib/format';
import { RouteMap } from '../train/RouteMap';
import { computeKmSplits } from '../../lib/routeSplits';
import { isProgramPost } from '../../lib/programPosts';
import type { CommunityPost, PostComment } from '../../lib/social';
import type { CharacterConfig } from '../../types';

function FeedWorkoutCard({ workout, userId, asProgram }: { workout: NonNullable<CommunityPost['workout']>; userId: string | null; asProgram?: boolean }) {
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

  if (asProgram) {
    return (
      <div className="feed-workout-card program">
        <div className="fp-head">
          <TypeIconBadge category={workout.category} size={40} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="feed-workout-name">{workout.name}</div>
            <div className="feed-workout-meta">
              {workout.exercises.length} exercise{workout.exercises.length === 1 ? '' : 's'} · {workout.duration}
            </div>
          </div>
        </div>
        <div className="fp-ex">
          {workout.exercises.slice(0, 4).map((ex, i) => (
            <div key={i}>
              <span>{ex.name}</span>
              <span>
                {ex.sets} × {ex.reps}
                {ex.weight ? ` · ${ex.weight}` : ''}
              </span>
            </div>
          ))}
          {workout.exercises.length > 4 && <div className="fp-more">+{workout.exercises.length - 4} more</div>}
        </div>
        <button className={`btn ${saved ? 'btn-ghost' : 'btn-soft'}`} disabled={saved || !userId} onClick={handleAdd}>
          <Icon name={saved ? 'check' : 'plus'} style={{ width: 15, height: 15 }} /> {saved ? 'Added to your programs' : 'Add to my programs'}
        </button>
      </div>
    );
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
  level?: number;
  // People who liked the post (already resolved to names/avatars), for
  // the "Liked by ..." line. Optional - without it the plain count shows.
  likedBy?: { id: string; name: string; character?: CharacterConfig | null; photoUrl?: string | null }[];
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

// "45 min", "1h 5m", "1 h 05 min" -> minutes.
function durationMinutes(duration: string): number | null {
  const h = /(\d+)\s*h/i.exec(duration);
  const m = /(\d+)\s*m/i.exec(duration);
  if (!h && !m) return null;
  return (h ? +h[1] * 60 : 0) + (m ? +m[1] : 0);
}

function paceLabel(secondsPerKm: number): string {
  const mm = Math.floor(secondsPerKm / 60);
  const ss = Math.round(secondsPerKm % 60);
  return `${mm}:${ss.toString().padStart(2, '0')}`;
}

type Stat = { k: string; v: string; unit?: string };

// Strava-style headline numbers for whatever's attached to the post.
function statsFor(workout: CommunityPost['workout']): Stat[] {
  if (!workout) return [];
  if (workout.isActivity) {
    const mins = durationMinutes(workout.duration);
    const km = workout.distanceMeters ? workout.distanceMeters / 1000 : null;
    const out: Stat[] = [];
    if (km) out.push({ k: 'Distance', v: km.toFixed(2), unit: 'km' });
    if (km && mins) out.push({ k: 'Pace', v: paceLabel((mins * 60) / km), unit: '/km' });
    out.push({ k: 'Time', v: workout.duration });
    return out;
  }
  const sets = workout.exercises.reduce((n, e) => n + (e.sets || 0), 0);
  return [
    { k: 'Duration', v: workout.duration },
    { k: 'Exercises', v: String(workout.exercises.length) },
    ...(sets ? [{ k: 'Sets', v: String(sets) }] : []),
  ];
}

function Splits({ route }: { route: NonNullable<NonNullable<CommunityPost['workout']>['route']> }) {
  const splits = computeKmSplits(route).slice(0, 9);
  const per = splits.map((s, i) => s.seconds - (i ? splits[i - 1].seconds : 0));
  const min = Math.min(...per);
  const max = Math.max(...per);
  const avg = per.reduce((a, b) => a + b, 0) / per.length;
  return (
    <div className="splits">
      <h4>
        Splits<span>avg {paceLabel(avg)} /km</span>
      </h4>
      {per.map((sec, i) => (
        <div key={i} className={`split${sec === min ? ' best' : ''}`}>
          <span className="k">{i + 1}</span>
          <span className="p">{paceLabel(sec)}</span>
          <i className="b" style={{ width: `${max > min ? 55 + (45 * (max - sec)) / (max - min) : 100}%` }} />
        </div>
      ))}
    </div>
  );
}

// One feed post: Strava-style title and stat row, a swipeable media area
// (photo, route map, km splits), then Instagram-style actions.
export function FeedPostCard({
  post,
  character,
  photoUrl,
  level,
  likedBy,
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
  const wt = workoutTypeById(post.workout_type ?? post.workout?.category);
  const isProgram = isProgramPost(post);
  const [slide, setSlide] = useState(0);
  const [pop, setPop] = useState(0);
  const route = post.workout?.route && post.workout.route.length > 1 ? post.workout.route : null;
  const hasSplits = !!route && computeKmSplits(route).length >= 2;
  const stats = statsFor(post.workout);
  const postedToday = Date.now() - new Date(post.created_at).getTime() < 24 * 3600 * 1000;

  const slides: ReactNode[] = [];
  if (post.image_url) slides.push(<img src={post.image_url} alt="" loading="lazy" draggable={false} />);
  if (route)
    slides.push(
      <RouteMap
        points={route}
        height={290}
        brand
        label={
          post.workout?.distanceMeters ? (
            <>
              {wt && <Icon name={wt.icon} />}
              {(post.workout.distanceMeters / 1000).toFixed(2)} km
            </>
          ) : undefined
        }
      />,
    );
  if (route && hasSplits) slides.push(<Splits route={route} />);

  function likeFromMedia() {
    if (!liked) onToggleLike();
    setPop((n) => n + 1);
  }

  return (
    <div className="feed-post">
      <div className="feed-post-head">
        <span className={`av-ring${postedToday ? ' on' : ''}`}>
          <UserAvatar className="feed-avatar" name={post.name} character={character} photoUrl={photoUrl} onClick={() => onOpenProfile(post.user_id)} />
        </span>
        <div className="feed-meta">
          <div className="feed-name" onClick={() => onOpenProfile(post.user_id)}>
            {post.name}
            {level ? <span className="feed-lv">LV {level}</span> : null}
          </div>
          <div className="feed-sub" style={wt ? { color: undefined } : undefined}>
            {wt && <Icon name={wt.icon} style={{ color: `var(${wt.colorVar})` }} />}
            <span>
              {[isProgram ? 'Shared a program' : wt?.label, timeAgo(post.created_at), post.location].filter(Boolean).join(' · ')}
            </span>
          </div>
        </div>
        {onDeletePost && post.user_id === myUserId && (
          <button
            className="feed-post-delete"
            title="Delete post"
            onClick={() => window.confirm('Delete this post? This removes it for everyone.') && onDeletePost()}
          >
            <Icon name="trash" style={{ width: 15, height: 15 }} />
          </button>
        )}
      </div>

      {post.workout && !isProgram && <div className="feed-post-title">{post.workout.name}</div>}
      {post.text && <div className="feed-text">{post.text}</div>}

      {stats.length > 0 && !isProgram && (
        <div className="feed-stats">
          {stats.map((st) => (
            <div className="feed-stat" key={st.k}>
              <div className="feed-stat-k">{st.k}</div>
              <div className="feed-stat-v">
                {st.v}
                {st.unit && <small>{st.unit}</small>}
              </div>
            </div>
          ))}
        </div>
      )}

      {slides.length > 0 && (
        <>
          <div className="feed-media" onDoubleClick={likeFromMedia}>
            <div
              className="feed-car"
              onScroll={(e) => {
                const el = e.currentTarget;
                setSlide(Math.round(el.scrollLeft / Math.max(1, el.clientWidth)));
              }}
            >
              {slides.map((node, i) => (
                <div className="feed-slide" key={i}>
                  {node}
                </div>
              ))}
            </div>
            {slides.length > 1 && (
              <span className="feed-count">
                {slide + 1}/{slides.length}
              </span>
            )}
            {pop > 0 && (
              <div className="feed-heart-pop" key={pop}>
                <Icon name="heart" />
              </div>
            )}
          </div>
          {slides.length > 1 && (
            <div className="feed-dots">
              {slides.map((_, i) => (
                <i key={i} className={i === slide ? 'on' : ''} />
              ))}
            </div>
          )}
        </>
      )}

      {post.workout && <FeedWorkoutCard workout={post.workout} userId={myUserId} asProgram={isProgram} />}
      {post.link && (
        <a className="feed-link-chip" href={post.link} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()}>
          <Icon name="link" style={{ width: 12, height: 12 }} />
          {post.link.replace(/^https?:\/\//, '')}
        </a>
      )}

      <div className="feed-actions">
        <button className={`feed-action-btn${liked ? ' liked' : ''}`} onClick={onToggleLike} aria-label="Like">
          <Icon name="heart" style={{ fill: liked ? 'currentColor' : 'none' }} />
        </button>
        <button className="feed-action-btn" onClick={onToggleComments} aria-label="Comments">
          <Icon name="comment" />
        </button>
      </div>

      {likeCount > 0 && (
        <div className="liked-by">
          {likedBy && likedBy.length > 0 && (
            <span className="like-stack">
              {likedBy.slice(0, 3).map((u) => (
                <UserAvatar key={u.id} className="like-av" name={u.name} character={u.character} photoUrl={u.photoUrl} />
              ))}
            </span>
          )}
          <span>
            {liked && likeCount === 1 ? (
              <>
                Liked by <b>you</b>
              </>
            ) : likedBy && likedBy.length > 0 ? (
              <>
                Liked by <b>{liked ? 'you' : likedBy.find((u) => u.id !== myUserId)?.name.split(' ')[0] ?? likedBy[0].name.split(' ')[0]}</b>
                {likeCount > 1 && (
                  <>
                    {' '}
                    and <b>{likeCount - 1} other{likeCount - 1 === 1 ? '' : 's'}</b>
                  </>
                )}
              </>
            ) : (
              <>
                <b>{likeCount}</b> like{likeCount === 1 ? '' : 's'}
              </>
            )}
          </span>
        </div>
      )}
      {!commentsOpen && comments.length > 0 && (
        <>
          <div className="cmt-preview" onClick={onToggleComments}>
            <b>{comments[0].name}</b> {comments[0].text}
          </div>
          {comments.length > 1 && (
            <button className="cmt-more" onClick={onToggleComments}>
              View all {comments.length} comments
            </button>
          )}
        </>
      )}
      {commentsOpen && comments.length > 0 && (
        <button className="cmt-more" onClick={onToggleComments}>
          Hide comments
        </button>
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
    </div>
  );
}
