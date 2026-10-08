import { Icon } from '../Icon';
import { CHALLENGE_DEFS, MAX_ACTIVE_CHALLENGES, activeChallengeCount, withAllChallenges } from '../../data/challenges';
import { useAppStore } from '../../store/useAppStore';
import type { IconName } from '../../data/icons';

// Badge per challenge, reusing the attribute colour palette.
const LOOK: Record<string, { icon: IconName; colorVar: string }> = {
  consistency: { icon: 'calendar', colorVar: '--stat-discipline' },
  pushups: { icon: 'dumbbell', colorVar: '--stat-strength' },
  squats: { icon: 'fitness', colorVar: '--stat-vitality' },
  core: { icon: 'zap', colorVar: '--stat-agility' },
  cardio: { icon: 'run', colorVar: '--stat-endurance' },
  streak7: { icon: 'flame', colorVar: '--stat-recovery' },
};

export function ChallengesTab() {
  const challenges = withAllChallenges(useAppStore((s) => s.challenges));
  const joinChallenge = useAppStore((s) => s.joinChallenge);
  const leaveChallenge = useAppStore((s) => s.leaveChallenge);
  const logChallenge = useAppStore((s) => s.logChallenge);
  const active = activeChallengeCount(challenges);
  const atCap = active >= MAX_ACTIVE_CHALLENGES;

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
      {CHALLENGE_DEFS.map((def) => {
        const c = challenges.find((x) => x.id === def.id)!;
        const pct = Math.min(100, Math.round((c.progress / def.target) * 100));
        const look = LOOK[def.id] ?? { icon: 'trophy', colorVar: '--accent' };
        const unit = `${def.unit}${def.target > 1 ? 's' : ''}`;
        const coins = def.bonusXp + Math.round(def.target * def.xpPerUnit);
        return (
          <div className={`chal${c.completed ? ' done' : ''}`} key={def.id}>
            <div className="chal-h">
              <span className="type-icon-badge" style={{ width: 42, height: 42, background: `var(${look.colorVar})` }}>
                <Icon name={look.icon} style={{ width: 20, height: 20 }} />
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="t">{def.name}</div>
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
            <div className="chal-f">
              <span className="chal-meta">
                {c.joined ? (
                  <>
                    <b>
                      {c.progress} / {def.target}
                    </b>{' '}
                    {unit}
                  </>
                ) : (
                  `${def.lengthDays} days · +${def.bonusXp} XP · ${coins} coins`
                )}
              </span>
              <span className="chal-actions">
                {!c.joined && (
                  <button className="btn btn-sm btn-primary" disabled={atCap} onClick={() => joinChallenge(def.id)}>
                    {atCap ? 'Slots full' : 'Join'}
                  </button>
                )}
                {c.joined && !c.completed && def.logStep && (
                  <button className="btn btn-sm btn-soft" onClick={() => logChallenge(def.id)}>
                    Log {def.logStep}
                  </button>
                )}
                {c.joined && !c.completed && !def.logStep && (
                  <span className="verified">
                    <Icon name="shield" /> {def.id === 'cardio' ? 'Apple Health' : 'Counts automatically'}
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
