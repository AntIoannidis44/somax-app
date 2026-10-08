import { useRef, useState } from 'react';
import { Icon } from '../Icon';
import { ChipGroup } from '../onboarding/ChipGroup';
import { GOALS } from '../onboarding/steps/Goal';
import { DAYS } from '../onboarding/steps/Experience';
import { StatBars } from './StatBars';
import { SettingsCard } from './SettingsCard';
import { FeatureFlags } from './FeatureFlags';
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
  const toggleProfileGoal = useAppStore((s) => s.toggleProfileGoal);
  const setProfileAvailability = useAppStore((s) => s.setProfileAvailability);
  const setProfilePhoto = useAppStore((s) => s.setProfilePhoto);
  const reviseWeekPlan = useAppStore((s) => s.reviseWeekPlan);
  const settings = useAppStore((s) => s.settings);
  const toggleSetting = useAppStore((s) => s.toggleSetting);
  const showToast = useAppStore((s) => s.showToast);
  const userId = useUserId();

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

  const [prefsOpen, setPrefsOpen] = useState(false);
  const [prefsSnapshot, setPrefsSnapshot] = useState<{ goal: string[]; availability: string; focus: string } | null>(null);

  function togglePrefs() {
    if (!prefsOpen) setPrefsSnapshot({ goal: [...profile.goal], availability: profile.availability, focus: profile.focus });
    setPrefsOpen((v) => !v);
  }
  const prefsChanged =
    !!prefsSnapshot &&
    (profile.availability !== prefsSnapshot.availability ||
      profile.focus !== prefsSnapshot.focus ||
      profile.goal.length !== prefsSnapshot.goal.length ||
      profile.goal.some((g) => !prefsSnapshot.goal.includes(g)));

  function handleRevise() {
    reviseWeekPlan();
    setPrefsSnapshot({ goal: [...profile.goal], availability: profile.availability, focus: profile.focus });
  }

  const ctx = { level: progress.level, longestStreak: progress.longestStreak, prestige: progress.prestige };
  const nu = nextUnlock(ctx);
  const cu = countUnlocked(ctx);
  const nuText = nu ? `Next unlock: ${nu.item.name} at Level ${nu.level}` : 'Every item unlocked';

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
        <div>
          <div className="profile-name">{profile.name}</div>
          <div className="profile-sub">
            {profile.goal.length ? profile.goal.join(', ') : 'No goal set'} · {profile.experience} · Level {progress.level}
          </div>
          {profile.photoUrl && (
            <button className="link-btn" style={{ marginTop: 4 }} onClick={handleRemovePhoto}>
              Remove photo
            </button>
          )}
        </div>
      </div>

      <div className="pv-achievements" style={{ marginTop: 18 }}>
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

      <div className="section-label">Goals</div>
      <div className="card">
        <button
          onClick={openGoals}
          style={{
            display: 'flex',
            width: '100%',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 12,
            background: 'none',
            border: 'none',
            padding: 0,
            font: 'inherit',
            color: 'inherit',
            cursor: 'pointer',
            textAlign: 'left',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 11,
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                background: 'linear-gradient(152deg, var(--hero-1), var(--hero-2))',
              }}
            >
              <Icon name="zap" style={{ width: 16, height: 16 }} />
            </div>
            <div>
              <div className="setting-title">Weight &amp; performance</div>
              <div className="setting-sub">A target weight, a 5K time, total distance, training frequency - verified automatically</div>
            </div>
          </div>
          <Icon name="chevron" style={{ flexShrink: 0 }} />
        </button>
      </div>

      <div className="section-label">Character</div>
      <div className="char-card" onClick={openCharacterStudio}>
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

      <div className="section-label">Training preferences</div>
      <div className="card">
        <button
          onClick={togglePrefs}
          style={{
            display: 'flex',
            width: '100%',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'none',
            border: 'none',
            padding: 0,
            font: 'inherit',
            color: 'inherit',
            cursor: 'pointer',
            textAlign: 'left',
          }}
        >
          <div>
            <div className="setting-title">Goals &amp; schedule</div>
            <div className="setting-sub">
              {profile.goal.length ? profile.goal.join(', ') : 'No goal set'} · {profile.availability || '—'} days/week
            </div>
          </div>
          <Icon name="chevron" style={{ transform: prefsOpen ? 'rotate(-90deg)' : 'rotate(90deg)', transition: 'transform 200ms ease', flexShrink: 0 }} />
        </button>
        {prefsOpen && (
          <div style={{ marginTop: 18 }}>
            <div className="setting-title" style={{ marginBottom: 10 }}>
              Goals
            </div>
            <ChipGroup options={GOALS} value={profile.goal} onSelect={toggleProfileGoal} />
            <div className="setting-title" style={{ margin: '18px 0 10px' }}>
              Days per week
            </div>
            <ChipGroup options={DAYS} value={profile.availability} onSelect={setProfileAvailability} />
            {prefsChanged && (
              <button className="btn btn-primary" style={{ marginTop: 18, width: '100%' }} onClick={handleRevise}>
                Revise this week's program
              </button>
            )}
          </div>
        )}
      </div>

      <div className="section-label">Attributes</div>
      <div className="card">
        <StatBars />
      </div>

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
        <span style={{ fontWeight: 600, color: 'var(--text-faint)', textTransform: 'none', letterSpacing: 0 }}>beta rollout</span>
      </div>
      <FeatureFlags />

      <div className="section-label">Account</div>
      <button
        className="btn btn-ghost"
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
