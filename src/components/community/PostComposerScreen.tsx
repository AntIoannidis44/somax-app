import { useEffect, useRef, useState } from 'react';
import { Icon } from '../Icon';
import { RouteMap } from '../train/RouteMap';
import { useAppStore } from '../../store/useAppStore';
import { useUserId } from '../../lib/useSession';
import { uploadFeedImage } from '../../lib/feedImage';
import { createPost, type PostWorkout } from '../../lib/social';
import { useTodayPostableWorkouts } from '../../lib/todayWorkoutOptions';
import { searchLocations, type LocationSuggestion } from '../../lib/locationSearch';
import { WORKOUT_TYPES, workoutTypeById } from '../../data/workoutTypes';

// Instagram's own "new post" screen is the model here, not a cramped inline
// card on the feed itself - a dedicated, full-screen space to build the
// post: photo, caption, location, link, and (if relevant) the real workout/
// route data behind it.
export function PostComposerScreen() {
  const seed = useAppStore((s) => s.viewingComposer);
  const closeComposer = useAppStore((s) => s.closeComposer);
  const profile = useAppStore((s) => s.profile);
  const showToast = useAppStore((s) => s.showToast);
  const privateProfile = useAppStore((s) => s.settings.privateProfile);
  const userId = useUserId();
  const { gymOption, watchOptions, resolveWatchWorkout } = useTodayPostableWorkouts();

  const [caption, setCaption] = useState(seed?.defaultCaption ?? '');
  const [visibility, setVisibility] = useState<'public' | 'friends'>(privateProfile ? 'friends' : 'public');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [useRouteAsCover, setUseRouteAsCover] = useState(true);
  const [location, setLocation] = useState('');
  const [locationQuery, setLocationQuery] = useState('');
  const [locationSearchOpen, setLocationSearchOpen] = useState(false);
  const [locationResults, setLocationResults] = useState<LocationSuggestion[]>([]);
  const [locationDebug, setLocationDebug] = useState('');
  const [link, setLink] = useState('');
  const [workout, setWorkout] = useState<PostWorkout | null>(seed?.workout ?? null);
  const [workoutType, setWorkoutType] = useState<string | null>(seed?.defaultType ?? seed?.workout?.category ?? null);
  const [workoutPickerOpen, setWorkoutPickerOpen] = useState(false);
  const [posting, setPosting] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!locationSearchOpen || !locationQuery.trim()) {
      setLocationResults([]);
      return;
    }
    let cancelled = false;
    // TEMPORARY - an inline status line, not a toast: a toast is
    // position:absolute against the full device frame and can end up
    // rendered behind the iOS keyboard while this field is focused,
    // which would make it look like nothing happens even if it fired.
    setLocationDebug('searching…');
    const t = setTimeout(() => {
      // A native call that never resolves (a hung completer delegate, a
      // dropped bridge message) must not leave the field stuck on
      // "searching…" forever with no way out - this has already happened
      // twice for two different native-side reasons.
      const timeout = new Promise<never>((_, reject) => setTimeout(() => reject(new Error('timed out')), 5000));
      Promise.race([searchLocations(locationQuery), timeout])
        .then((results) => {
          if (cancelled) return;
          setLocationResults(results);
          setLocationDebug(`${results.length} result${results.length === 1 ? '' : 's'}`);
        })
        .catch((err) => {
          if (cancelled) return;
          setLocationDebug(`error: ${err?.message ?? String(err)}`);
        });
    }, 250);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [locationQuery, locationSearchOpen]);

  if (!seed) return null;

  function handleImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }

  function handleRemoveImage() {
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImageFile(null);
    setImagePreview(null);
  }

  async function handlePickWatch(w: Parameters<typeof resolveWatchWorkout>[0]) {
    const resolved = await resolveWatchWorkout(w);
    setWorkout(resolved);
    setWorkoutType(resolved.category);
    setWorkoutPickerOpen(false);
  }

  function handlePickGym() {
    if (!gymOption) return;
    setWorkout(gymOption);
    setWorkoutType(gymOption.category);
    setWorkoutPickerOpen(false);
  }

  const routePreview = workout?.route && workout.route.length > 1 ? workout.route : null;
  const showRouteAsCover = !imagePreview && routePreview && useRouteAsCover;

  async function handlePost() {
    if (!userId || !profile || posting) return;
    const text = caption.trim();
    if (!text && !imageFile && !workout) {
      showToast('Add a caption, photo, or workout first');
      return;
    }
    setPosting(true);
    let imageUrl: string | null = null;
    if (imageFile) {
      imageUrl = await uploadFeedImage(userId, imageFile);
      if (!imageUrl) {
        showToast('Could not upload that photo');
        setPosting(false);
        return;
      }
    }
    await createPost(
      userId,
      profile.name,
      text || (workout ? `Just finished ${workout.name}` : ''),
      workoutType,
      imageUrl,
      workout,
      location.trim() || null,
      link.trim() || null,
      visibility,
    );
    setPosting(false);
    showToast('Posted to the feed');
    closeComposer();
  }

  return (
    <div className="composer-screen">
      <div className="composer-screen-body">
      <div className="composer-visibility">
        <button className={`composer-visibility-opt${visibility === 'public' ? ' active' : ''}`} onClick={() => setVisibility('public')}>
          <Icon name="community" style={{ width: 14, height: 14 }} />
          Community
        </button>
        <button className={`composer-visibility-opt${visibility === 'friends' ? ' active' : ''}`} onClick={() => setVisibility('friends')}>
          <Icon name="lock" style={{ width: 14, height: 14 }} />
          Friends only
        </button>
      </div>

      <textarea
        className="composer-caption"
        placeholder="Write a caption…"
        value={caption}
        onChange={(e) => setCaption(e.target.value)}
        rows={3}
      />

      {/* Instagram order: a confirmed location shows as a tag right under
          the caption, above the photo - not buried in a generic fields
          list below everything else. */}
      {location ? (
        <div className="composer-location-tag">
          <Icon name="pin" style={{ width: 13, height: 13 }} />
          <span>{location}</span>
          <button className="composer-remove-btn" onClick={() => setLocation('')}>
            <Icon name="x" style={{ width: 12, height: 12 }} />
          </button>
        </div>
      ) : locationSearchOpen ? (
        <div className="composer-field-wrap">
          <div className="composer-field">
            <Icon name="pin" style={{ width: 16, height: 16 }} />
            <input
              autoFocus
              type="text"
              placeholder="Search for a place or suburb…"
              value={locationQuery}
              onChange={(e) => setLocationQuery(e.target.value)}
            />
            <button
              className="composer-field-clear"
              onClick={() => {
                setLocationSearchOpen(false);
                setLocationQuery('');
                setLocationResults([]);
              }}
            >
              <Icon name="x" style={{ width: 12, height: 12 }} />
            </button>
          </div>
          {/* TEMPORARY debug line - remove once confirmed working */}
          {locationDebug && <div style={{ fontSize: 11, color: 'var(--text-faint)', padding: '4px 2px' }}>debug: {locationDebug}</div>}
          {locationResults.length > 0 && (
            <div className="day-picker composer-location-results">
              {locationResults.map((r, i) => (
                <div
                  key={`${r.title}-${i}`}
                  className="day-picker-opt"
                  onClick={() => {
                    setLocation(r.subtitle ? `${r.title}, ${r.subtitle}` : r.title);
                    setLocationSearchOpen(false);
                    setLocationQuery('');
                    setLocationResults([]);
                  }}
                >
                  <Icon name="pin" style={{ width: 13, height: 13 }} />
                  <div>
                    <div style={{ fontWeight: 700 }}>{r.title}</div>
                    {r.subtitle && <div style={{ fontSize: 11.5, color: 'var(--text-faint)' }}>{r.subtitle}</div>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <button className="composer-attach-btn" onClick={() => setLocationSearchOpen(true)}>
          <Icon name="pin" style={{ width: 15, height: 15 }} />
          Add location
        </button>
      )}

      <div style={{ height: 14 }} />

      <div className="composer-photo-area">
        {imagePreview ? (
          <img src={imagePreview} alt="" />
        ) : showRouteAsCover ? (
          <RouteMap points={routePreview!} height={260} />
        ) : (
          <div className="composer-photo-empty" onClick={() => imageInputRef.current?.click()}>
            <Icon name="camera" style={{ width: 26, height: 26 }} />
            <span>Add a photo</span>
          </div>
        )}
        <input ref={imageInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageSelect} />
        <div className="composer-photo-tools">
          <button className="composer-photo-btn" onClick={() => imageInputRef.current?.click()}>
            <Icon name="camera" style={{ width: 15, height: 15 }} />
            {imagePreview ? 'Change photo' : 'Choose photo'}
          </button>
          {imagePreview && (
            <button className="composer-photo-btn" onClick={handleRemoveImage}>
              <Icon name="x" style={{ width: 14, height: 14 }} />
              Remove
            </button>
          )}
          {routePreview && !imagePreview && (
            <button className={`composer-photo-btn${useRouteAsCover ? ' active' : ''}`} onClick={() => setUseRouteAsCover((v) => !v)}>
              <Icon name="pin" style={{ width: 14, height: 14 }} />
              {useRouteAsCover ? 'Using route as cover' : 'Use route as cover'}
            </button>
          )}
        </div>
      </div>

      <div className="composer-field">
        <Icon name="link" style={{ width: 16, height: 16 }} />
        <input type="text" placeholder="Add a link" value={link} onChange={(e) => setLink(e.target.value)} />
      </div>
      <div className="composer-section-label">Fitness data</div>
      {workout ? (
        <div className="composer-workout-chip">
          <Icon name={workoutTypeById(workout.category)?.icon ?? 'dumbbell'} style={{ width: 14, height: 14 }} />
          <span>{workout.name}</span>
          {!seed.locked && (
            <button className="composer-remove-btn" onClick={() => setWorkout(null)}>
              <Icon name="x" style={{ width: 12, height: 12 }} />
            </button>
          )}
        </div>
      ) : (
        <button className="composer-attach-btn" onClick={() => setWorkoutPickerOpen((v) => !v)}>
          <Icon name="dumbbell" style={{ width: 15, height: 15 }} />
          Attach today's workout or activity
        </button>
      )}
      {workoutPickerOpen && !workout && (
        <div className="day-picker" style={{ marginTop: 2 }}>
          {gymOption && (
            <>
              <div className="day-picker-group-label">Today's workout</div>
              <div className="day-picker-opt" onClick={handlePickGym}>
                <Icon name={workoutTypeById(gymOption.category)?.icon ?? 'dumbbell'} style={{ width: 14, height: 14 }} />
                {gymOption.name}
              </div>
            </>
          )}
          {watchOptions.length > 0 && (
            <>
              <div className="day-picker-group-label">Synced from Apple Fitness</div>
              {watchOptions.map((w) => (
                <div className="day-picker-opt" key={w.uuid} onClick={() => handlePickWatch(w)}>
                  <Icon name="zap" style={{ width: 14, height: 14 }} />
                  {w.activityName} · {Math.round(w.durationMinutes)} min
                </div>
              ))}
            </>
          )}
          {!gymOption && watchOptions.length === 0 && (
            <div className="day-picker-opt" style={{ color: 'var(--text-faint)', cursor: 'default' }}>
              Nothing from today yet - finish a workout or sync your Watch first
            </div>
          )}
        </div>
      )}

      <div className="composer-section-label">Tag</div>
      <div className="type-tabs" style={{ marginBottom: 4 }}>
        {WORKOUT_TYPES.map((w) => (
          <button
            key={w.id}
            className={`type-chip sm${workoutType === w.id ? ' active' : ''}`}
            onClick={() => setWorkoutType(workoutType === w.id ? null : w.id)}
          >
            <Icon name={w.icon} style={{ width: 13, height: 13 }} />
            {w.label}
          </button>
        ))}
      </div>
      </div>

      <div className="composer-post-bar">
        <button className="btn btn-primary" disabled={posting} onClick={handlePost}>
          {posting ? 'Posting…' : 'Post'}
        </button>
      </div>
    </div>
  );
}
