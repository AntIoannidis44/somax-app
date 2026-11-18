import { useState } from 'react';
import { Icon } from '../Icon';
import { challengeCoins } from '../../lib/coins';
import { manualLogAllowed, verifySpecFor } from '../../lib/verifiedChallenges';
import { CHALLENGE_DEFS, MAX_ACTIVE_CHALLENGES, activeChallengeCount, withAllChallenges } from '../../data/challenges';
import { SPORTS } from '../../lib/library';
import { useAppStore } from '../../store/useAppStore';
import type { ChallengeDef } from '../../types';
import type { IconName } from '../../data/icons';

// Badge per challenge, reusing the attribute colour palette. Only the
// original handful get a bespoke icon - with 150+ challenges now in the
// library (see data/challenges_generated.ts), everything else falls back
// to its sport's own icon/colour (SPORT_LOOK below), the same way the
// Program Library already represents a sport.
const LOOK: Record<string, { icon: IconName; colorVar: string }> = {
  consistency: { icon: 'calendar', colorVar: '--stat-discipline' },
  pushups: { icon: 'dumbbell', colorVar: '--stat-strength' },
  squats: { icon: 'fitness', colorVar: '--stat-vitality' },
  core: { icon: 'zap', colorVar: '--stat-agility' },
  cardio: { icon: 'run', colorVar: '--stat-endurance' },
  macrotrack: { icon: 'nutrition', colorVar: '--stat-vitality' },
  streak7: { icon: 'flame', colorVar: '--stat-recovery' },
};

const SPORT_LOOK: Record<string, { icon: IconName; colorVar: string }> = Object.fromEntries(
  SPORTS.map((s) => [s.id, { icon: s.icon, colorVar: s.colorVar }]),
);

const DIFFICULTIES: { id: ChallengeDef['difficulty']; label: string; icon: IconName; colorVar: string }[] = [
  { id: 'beginner', label: 'Beginner', icon: 'steps', colorVar: '--stat-recovery' },
  { id: 'intermediate', label: 'Intermediate', icon: 'zap', colorVar: '--stat-endurance' },
  { id: 'advanced', label: 'Advanced', icon: 'flame', colorVar: '--stat-strength' },
];

// Same look as the Program Library's own filter rows (feed-filters lib-chips
// + type-chip), so Challenges reads as the same kind of browsable catalogue
// instead of a one-off list.
function Chips({ options, value, onChange }: { options: { id: string; label: string }[]; value: string; onChange: (id: string) => void }) {
  return (
    <div className="feed-filters lib-chips">
      <button className={`type-chip${value === 'all' ? ' active' : ''}`} onClick={() => onChange('all')}>
        All
      </button>
      {options.map((o) => (
        <button key={o.id} className={`type-chip${value === o.id ? ' active' : ''}`} onClick={() => onChange(o.id)}>
          {o.label}
        </button>
      ))}
    </div>
  );
}

function SportWheel({ value, onChange }: { value: string; onChange: (id: string) => void }) {
  return (
    <div className="feed-filters lib-chips">
      <button className={`type-chip${value === 'all' ? ' active' : ''}`} onClick={() => onChange('all')}>
        All sports
      </button>
      {SPORTS.map((o) => (
        <button key={o.id} className={`type-chip${value === o.id ? ' active' : ''}`} onClick={() => onChange(o.id)}>
          <Icon name={o.icon} style={{ width: 14, height: 14, color: value === o.id ? undefined : `var(${o.colorVar})` }} />
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function ChallengesTab() {
  const challenges = withAllChallenges(useAppStore((s) => s.challenges));
  const joinChallenge = useAppStore((s) => s.joinChallenge);
  // Which card's "how coins work" note is open (info icon by the title).
  const [infoOpen, setInfoOpen] = useState<string | null>(null);
  const leaveChallenge = useAppStore((s) => s.leaveChallenge);
  const logChallenge = useAppStore((s) => s.logChallenge);
  const active = activeChallengeCount(challenges);
  const atCap = active >= MAX_ACTIVE_CHALLENGES;

  const [query, setQuery] = useState('');
  const [sport, setSport] = useState('all');
  const [difficulty, setDifficulty] = useState('all');

  const stateFor = (id: string) => challenges.find((x) => x.id === id)!;

  const q = query.trim().toLowerCase();
  const filtered = CHALLENGE_DEFS.filter(
    (def) =>
      (sport === 'all' || def.sport === sport) &&
      (difficulty === 'all' || def.difficulty === difficulty) &&
      (!q || def.name.toLowerCase().includes(q) || def.desc.toLowerCase().includes(q)),
  );
  // In-progress challenges first (you're mid-way through these, don't make
  // them scroll to find their own next tap), then everything else, done
  // ones last - join/difficulty/sport order within each group stays as
  // authored rather than being re-sorted again on top of that.
  const ordered = [...filtered].sort((a, b) => {
    const rank = (def: ChallengeDef) => {
      const c = stateFor(def.id);
      if (c.joined && !c.completed) return 0;
      if (!c.joined) return 1;
      return 2;
    };
    return rank(a) - rank(b);
  });

  return (
    <>
      <div className="slots">
        <div className="slot-pips">
          {Array.from({ length: MAX_ACTIVE_CHALLENGES }, (_, i) => (
            <i key={i} className={i < active ? 'on' : ''} />
          ))}
        </div>
        <span>
          {active} of {MAX_ACTIVE_CHALLENGES} challenge slots in use{atCap ? ' · finish or leave one to join another' : ''}
        </span>
      </div>

      <div className="lib-search-row">
        <div className="lib-search">
          <Icon name="search" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search challenges" />
        </div>
      </div>
      <SportWheel value={sport} onChange={setSport} />
      <div className="lib-filter-label">Difficulty</div>
      <Chips options={DIFFICULTIES} value={difficulty} onChange={setDifficulty} />

      {ordered.length === 0 && (
        <div className="macro-search-hint">No challenges match - try a different sport or difficulty.</div>
      )}

      {ordered.map((def) => {
        const c = stateFor(def.id);
        const pct = Math.min(100, Math.round((c.progress / def.target) * 100));
        const look = LOOK[def.id] ?? SPORT_LOOK[def.sport] ?? { icon: 'trophy', colorVar: '--accent' };
        const diff = DIFFICULTIES.find((d) => d.id === def.difficulty);
        const unit = `${def.unit}${def.target > 1 ? 's' : ''}`;
        const coins = challengeCoins(def);
        const spec = verifySpecFor(def);
        const canLog = !!def.logStep && (!spec || manualLogAllowed(spec));
        return (
          <div className={`chal${c.completed ? ' done' : ''}`} key={def.id}>
            <div className="chal-h">
              <span className="type-icon-badge" style={{ width: 42, height: 42, background: `var(${look.colorVar})` }}>
                <Icon name={look.icon} style={{ width: 20, height: 20 }} />
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="t">
                  {def.name}
                  {coins > 0 && (
                    <button
                      className="chal-info"
                      aria-label="How coins work for this challenge"
                      onClick={() => setInfoOpen(infoOpen === def.id ? null : def.id)}
                    >
                      <Icon name="info" />
                    </button>
                  )}
                </div>
                <div className="s">{def.desc}</div>
              </div>
              {c.completed && (
                <span className="donepill">
                  <Icon name="check" /> Done
                </span>
              )}
            </div>
            {c.joined && (
              <div className="pbar big" style={{ marginTop: 14 }}>
                <i style={{ width: `${pct}%` }} />
              </div>
            )}
            {coins > 0 && infoOpen === def.id && (
              <div className="chal-coin-rule">
                {spec && (spec.metric === 'stepDays' || spec.metric === 'stepStreak')
                  ? `Steps count automatically from Apple Health. Finish it to earn the XP and ${coins} coins.`
                  : `Logging a workout counts toward this challenge and earns the XP. To also earn the ${coins} coins, the workouts need to be verified with Apple Health - recorded on your Apple Watch.`}
              </div>
            )}
            <div className="chal-f">
              <span className="chal-meta">
                {c.joined ? (
                  <>
                    <b>
                      {c.progress} / {def.target}
                    </b>{' '}
                    {unit}
                    {spec && coins > 0 && <> · {c.verifiedProgress ?? 0} verified</>}
                  </>
                ) : (
                  <>
                    {def.lengthDays} days · +{def.bonusXp} XP{coins > 0 ? ` · ${coins} coins` : ''}
                    {diff && (
                      <>
                        {' '}
                        <span style={{ whiteSpace: 'nowrap' }}>
                          · <Icon name={diff.icon} style={{ width: 11, height: 11, color: `var(${diff.colorVar})` }} /> {diff.label}
                        </span>
                      </>
                    )}
                  </>
                )}
              </span>
              <span className="chal-actions">
                {!c.joined && (
                  <button className="btn btn-sm btn-primary" disabled={atCap} onClick={() => joinChallenge(def.id)}>
                    {atCap ? 'Slots full' : 'Join'}
                  </button>
                )}
                {c.joined && !c.completed && canLog && (
                  <button className="btn btn-sm btn-soft" onClick={() => logChallenge(def.id)}>
                    Log {def.logStep}
                  </button>
                )}
                {c.joined && !c.completed && !canLog && (
                  <span className="verified">
                    <Icon name="shield" /> {spec ? 'Apple Health' : 'Counts automatically'}
                  </span>
                )}
                {c.joined && !c.completed && (
                  <button className="chal-leave" onClick={() => leaveChallenge(def.id)}>
                    Leave
                  </button>
                )}
              </span>
            </div>
          </div>
        );
      })}
    </>
  );
}
