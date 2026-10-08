import { useEffect, useRef, useState } from 'react';
import { Icon } from '../Icon';
import { StatBars } from './StatBars';
import { SettingsCard } from './SettingsCard';
import { FeatureFlags } from './FeatureFlags';
import { GoalsSummary } from '../goals/GoalsSummary';
import { fetchPostsByUser, type CommunityPost } from '../../lib/social';
import { workoutTypeById } from '../../data/workoutTypes';
import { CharacterThumbnail } from '../character/CharacterThumbnail';
import { useAppStore } from '../../store/useAppStore';
import { supabase } from '../../lib/supabase';
import { useUserId } from '../../lib/useSession';
import { uploadProfilePhoto, removeProfilePhoto } from '../../lib/profilePhoto';
import { countUnlocked, nextUnlock, tierFor } from '../../lib/character';
import { first, initials } from '../../lib/format';

export function ProfileScreen() {
  const profile = useAppStore((s) => s.profile)!;
  const progress = useAppStore((s) => s.progress);
  const character = useAppStore((s) => s.character);
  const history = useAppStore((s) => s.history);
  const openCharacterStudio = useAppStore((s) => s.openCharacterStudio);
  const openGoals = useAppStore((s) => s.openGoals);
  const resetDemo = useAppStore((s) => s.resetDemo);
  const prestige = useAppStore((s) => s.prestige);
  const setProfilePhoto = useAppStore((s) => s.setProfilePhoto);
  const settings = useAppStore((s) => s.settings);
  const toggleSetting = useAppStore((s) => s.toggleSetting);
  const showToast = useAppStore((s) => s.showToast);
  const userId = useUserId();
  const friendCount = useAppStore((s) => s.progress.friendCount);
  const [myPosts, setMyPosts] = useState<CommunityPost[]>([]);
  useEffect(() => {
    if (userId) fetchPostsByUser(userId).then(setMyPosts);
  }, [userId]);
  // Most-tagged workout types across your own posts (same signal a
  // friend's profile uses for "Favourite workouts").
  const typeCounts = new Map<string, number>();
  for (const p of myPosts) if (p.workout_type && workoutTypeById(p.workout_type)) typeCounts.set(p.workout_type, (typeCounts.get(p.workout_type) ?? 0) + 1);
  const favourites = [...typeCounts.entries()].sort((x, y) => y[1] - x[1]).slice(0, 4);

  const photoInputRef = useRef<HTMLInputElement>(null);
  const [photoBusy, setPhotoBusy] = useState(false);

  async function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || !userId) return;
    setPhotoBusy(true);
    try {
      const result = await uploadProfilePhoto(userId, file);
      if (result.ok) {
        setProfilePhoto(result.url);
        showToast('Profile photo updated');
      } else if (result.reason === 'not-a-person') {
        showToast("Couldn't verify that's a photo of you - try a clear, front-facing shot");
      } else {
        showToast('Could not upload that photo');
      }
    } catch (err) {
      // A throw anywhere in the chain (resize, base64 read, network) must
      // never leave this hanging silently with no toast and no way to
      // retry - that's exactly what the stuck-on-the-old-avatar report was.
      // Showing the real message (not a generic one) since this has failed
      // silently twice already with no way to see why.
      const msg = err instanceof Error ? err.message : String(err);
      console.error('[ProfileScreen] photo upload threw:', err);
      showToast(`Upload error: ${msg}`);
    } finally {
      setPhotoBusy(false);
    }
  }

  async function handleRemovePhoto() {
    if (!userId) return;
    await removeProfilePhoto(userId);
    setProfilePhoto(null);
    showToast('Profile photo removed');
  }

  const [editing, setEditing] = useState(false);
  function closeEdit() {
    setEditing(false);
  }

  const ctx = { level: progress.level, longestStreak: progress.longestStreak, prestige: progress.prestige };
  const nu = nextUnlock(ctx);
  const cu = countUnlocked(ctx);
  const tier = tierFor(progress.level);
  const nuText = nu ? `Next unlock: ${nu.item.name} at Level ${nu.level}` : 'Every item unlocked';

  if (editing) {
    return (
      <>
        <div className="edit-head">
          <button className="level-chip" onClick={closeEdit} aria-label="Back">
            <Icon name="chevron" style={{ transform: 'rotate(180deg)' }} />
          </button>
          <h2>Edit profile</h2>
          <button className="link-btn" style={{ fontSize: 15 }} onClick={closeEdit}>
            Done
          </button>
        </div>
        <div className="edit-photo">
          <div className="avatar-circle" style={{ padding: 0, overflow: 'hidden' }}>
            {profile.photoUrl ? (
              <img src={profile.photoUrl} alt={profile.name} className="fit-img" draggable={false} />
            ) : character ? (
              <CharacterThumbnail cfg={character} mode="portrait" />
            ) : (
              initials(profile.name)
            )}
          </div>
          <div style={{ display: 'flex', gap: 16 }}>
            <button className="link-btn" style={{ fontSize: 14 }} disabled={photoBusy} onClick={() => photoInputRef.current?.click()}>
              Change photo
            </button>
            {profile.photoUrl && (
              <button className="link-btn" style={{ fontSize: 14, color: 'var(--danger)' }} onClick={handleRemovePhoto}>
                Remove
              </button>
            )}
          </div>
          <input ref={photoInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handlePhotoChange} />
        </div>

        <div className="section-label">Training</div>
        <div className="card">
          <button
            className="prefrow"
            onClick={() => {
              closeEdit();
              openGoals();
            }}
          >
            <span className="set-ic">
              <Icon name="zap" />
            </span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="setting-title" style={{ fontWeight: 700, fontSize: 14.5 }}>
                Goals &amp; schedule
              </div>
              <div className="setting-sub" style={{ fontSize: 12.5 }}>
                Your goals and {profile.availability || '—'} training days a week
              </div>
            </div>
            <Icon name="chevron" style={{ width: 16, height: 16, color: 'var(--text-faint)' }} />
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="profile-head">
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <div className="avatar-circle" style={{ padding: 0, overflow: 'hidden' }}>
            {profile.photoUrl ? (
              <img src={profile.photoUrl} alt={profile.name} className="fit-img" draggable={false} />
            ) : character ? (
              <CharacterThumbnail cfg={character} mode="portrait" />
            ) : (
              initials(profile.name)
            )}
          </div>
          <button
            className="avatar-photo-badge"
            disabled={photoBusy}
            onClick={() => photoInputRef.current?.click()}
            title="Change profile photo"
          >
            <Icon name="camera" style={{ width: 13, height: 13 }} />
          </button>
          <input ref={photoInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handlePhotoChange} />
        </div>
        <div className="pf-stats">
          <div>
            <b>{myPosts.length}</b>
            <span>Posts</span>
          </div>
          <div>
            <b>{friendCount ?? 0}</b>
            <span>Friends</span>
          </div>
          <div>
            <b>{progress.currentStreak}d</b>
            <span>Streak</span>
          </div>
        </div>
      </div>
      <div className="profile-name" style={{ marginTop: 14 }}>
        {profile.name}
        <span className="tierpill" style={{ ['--c1' as string]: tier.c1, ['--c2' as string]: tier.c2 }}>
          LV {progress.level} · {tier.name.toUpperCase()}
        </span>
      </div>
      <div className="profile-sub">
        {profile.goal.length ? profile.goal.join(', ') : 'No goal set'} · {profile.experience}
      </div>
      <div className="pf-btns">
        <button className="btn btn-ghost" onClick={() => setEditing(true)}>
          Edit profile
        </button>
        <button className="btn btn-ghost" onClick={openCharacterStudio}>
          Character studio
        </button>
      </div>

      <div className="section-label">Character</div>
      <div className="char-card" style={{ ['--t1' as string]: tier.c1, ['--t2' as string]: tier.c2 }} onClick={openCharacterStudio}>
        <div className="char-card-figure">{character && <CharacterThumbnail cfg={character} mode="full" />}</div>
        <div className="char-card-body">
          <div className="char-tier">
            {tierFor(progress.level).name} tier · Lv {progress.level}
          </div>
          <div className="char-title">{first(profile.name)}</div>
          <div className="char-unlocks">
            {cu.done} of {cu.total} wardrobe items unlocked
            <br />
            {nuText}
          </div>
          <div className="char-card-cta">
            Open studio <Icon name="chevron" style={{ width: 13, height: 13 }} />
          </div>
        </div>
      </div>

      <div className="section-label">
        Goals &amp; schedule
        <button className="link-btn" onClick={openGoals}>
          Open
        </button>
      </div>
      <GoalsSummary />

      <div className="section-label">Highlights</div>
      <div className="pv-achievements">
        <div className="pv-achievement">
          <div className="pv-achievement-icon">
            <Icon name="coin" style={{ width: 21, height: 21 }} />
          </div>
          <div className="pv-achievement-num">{progress.totalXP.toLocaleString()}</div>
          <div className="pv-achievement-label">Total XP</div>
        </div>
        <div className="pv-achievement">
          <div className="pv-achievement-icon">
            <Icon name="trophy" style={{ width: 21, height: 21 }} />
          </div>
          <div className="pv-achievement-num">{progress.monthlyXP.toLocaleString()}</div>
          <div className="pv-achievement-label">XP this month</div>
        </div>
        <div className="pv-achievement">
          <div className="pv-achievement-icon">
            <Icon name="flame" style={{ width: 21, height: 21 }} />
          </div>
          <div className="pv-achievement-num">{progress.currentStreak}</div>
          <div className="pv-achievement-label">Day streak</div>
        </div>
      </div>


      <div className="section-label">Attributes</div>
      <div className="card">
        <StatBars />
      </div>

      {favourites.length > 0 && (
        <>
          <div className="section-label">Favourite workouts</div>
          <div className="fav-chips">
            {favourites.map(([typeId, count]) => {
              const wt = workoutTypeById(typeId)!;
              return (
                <span key={typeId}>
                  <i style={{ background: `var(${wt.colorVar})` }}>
                    <Icon name={wt.icon} style={{ width: 15, height: 15 }} />
                  </i>
                  {wt.label}
                  <small>×{count}</small>
                </span>
              );
            })}
          </div>
        </>
      )}

      <div className="section-label">Recent activity</div>
      <div className="card" style={{ paddingTop: 2, paddingBottom: 2 }}>
        {history.length === 0 ? (
          <div style={{ padding: '16px 4px', color: 'var(--text-faint)', fontSize: 13 }}>
            No activity yet — complete a goal on Home to get started.
          </div>
        ) : (
          history.slice(0, 10).map((h, i) => (
            <div className="history-row" key={i}>
              <div className="history-icon">
                <Icon name="zap" />
              </div>
              <div className="history-main">
                <div className="history-title">{h.label}</div>
                <div className="history-time">Day {h.day + 1}</div>
              </div>
              <div className="history-xp">+{h.xp}</div>
            </div>
          ))
        )}
      </div>

      <SettingsCard />

      <div className="section-label">Privacy</div>
      <div className="card" style={{ marginBottom: 18 }}>
        <div className="setting-row">
          <span className="set-ic">
            <Icon name="lock" />
          </span>
          <div>
            <div className="setting-title">Private profile</div>
            <div className="setting-sub">
              {settings.privateProfile
                ? 'Only accepted friends can open your full profile. Everyone still sees your name in the feed and league.'
                : 'Anyone on SOMAXX can open your full profile.'}
            </div>
          </div>
          <button
            className={`switch${settings.privateProfile ? ' on' : ''}`}
            onClick={() => toggleSetting('privateProfile')}
          />
        </div>
      </div>

      <div className="section-label">Evolve</div>
      <div className="card" style={{ marginBottom: 18 }}>
        <div className="setting-row">
          <span className="set-ic">
            <Icon name="trophy" />
          </span>
          <div>
            <div className="setting-title">
              {progress.prestige ? `Evolved ${progress.prestige}x` : 'Not evolved yet'}
            </div>
            <div className="setting-sub">
              {progress.level >= 55
                ? 'You have reached the level cap. Evolve to reset your level and unlock premium skins and colours.'
                : `Reach level 55 to evolve (you are on level ${progress.level}).`}
            </div>
          </div>
          <button
            className="btn btn-sm btn-primary"
            disabled={progress.level < 55}
            onClick={() => {
              if (window.confirm('Evolve now? Your level and XP reset to 1. Your unlocks, achievements and skins stay.')) prestige();
            }}
          >
            Evolve
          </button>
        </div>
      </div>

      <div className="section-label">
        Feature flags
        <span className="sl-note">Beta rollout</span>
      </div>
      <FeatureFlags />

      <div className="section-label">Account</div>
      <button
        className="btn btn-ghost signout"
        style={{ width: '100%', marginBottom: 10 }}
        onClick={async () => {
          // Clear local state on sign-out too - otherwise a different
          // account signing in on this device, before its own cloud row
          // exists, would seed the cloud with whatever's left over here.
          await supabase.auth.signOut();
          resetDemo();
        }}
      >
        Sign out
      </button>
      <div style={{ height: 20 }} />
    </>
  );
}
