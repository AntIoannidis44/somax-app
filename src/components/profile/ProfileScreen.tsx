import { Icon } from '../Icon';
import { StatBars } from './StatBars';
import { SettingsCard } from './SettingsCard';
import { FeatureFlags } from './FeatureFlags';
import { BetaTools } from './BetaTools';
import { CharacterThumbnail } from '../character/CharacterThumbnail';
import { useAppStore } from '../../store/useAppStore';
import { countUnlocked, nextUnlock, tierFor } from '../../lib/character';
import { first, initials } from '../../lib/format';

export function ProfileScreen() {
  const profile = useAppStore((s) => s.profile)!;
  const progress = useAppStore((s) => s.progress);
  const character = useAppStore((s) => s.character);
  const mode = useAppStore((s) => s.mode);
  const setMode = useAppStore((s) => s.setMode);
  const history = useAppStore((s) => s.history);
  const openCharacterStudio = useAppStore((s) => s.openCharacterStudio);
  const resetDemo = useAppStore((s) => s.resetDemo);

  const ctx = { level: progress.level, longestStreak: progress.longestStreak };
  const nu = nextUnlock(ctx);
  const cu = countUnlocked(ctx);
  const nuText = nu ? `Next unlock: ${nu.item.name} at Level ${nu.level}` : 'Every item unlocked';

  return (
    <>
      <div className="profile-head">
        <div className="avatar-circle" style={{ padding: 0, overflow: 'hidden' }}>
          {character ? <CharacterThumbnail cfg={character} mode="portrait" /> : initials(profile.name)}
        </div>
        <div>
          <div className="profile-name">{profile.name}</div>
          <div className="profile-sub">
            {profile.goal} · {profile.experience} · Level {progress.level}
          </div>
        </div>
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

      <div className="section-label">Display mode</div>
      <div className="mode-toggle">
        <button className={mode === 'classic' ? 'active' : ''} onClick={() => setMode('classic')}>
          Classic
        </button>
        <button className={mode === 'character' ? 'active' : ''} onClick={() => setMode('character')}>
          Character
        </button>
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

      <div className="section-label">Notifications</div>
      <SettingsCard />

      <div className="section-label">
        Feature flags
        <span style={{ fontWeight: 600, color: 'var(--text-faint)', textTransform: 'none', letterSpacing: 0 }}>beta rollout</span>
      </div>
      <FeatureFlags />

      <div className="section-label">Beta tools</div>
      <BetaTools />

      <div style={{ height: 10 }} />
      <button
        className="btn btn-danger-ghost"
        onClick={() => {
          if (window.confirm('Reset all demo progress on this device? This cannot be undone.')) {
            resetDemo();
          }
        }}
      >
        Reset demo data
      </button>
      <div style={{ height: 20 }} />
    </>
  );
}
