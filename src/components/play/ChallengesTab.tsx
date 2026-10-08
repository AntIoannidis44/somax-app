import { CHALLENGE_DEFS, MAX_ACTIVE_CHALLENGES, activeChallengeCount, withAllChallenges } from '../../data/challenges';
import { useAppStore } from '../../store/useAppStore';

export function ChallengesTab() {
  const challenges = withAllChallenges(useAppStore((s) => s.challenges));
  const joinChallenge = useAppStore((s) => s.joinChallenge);
  const leaveChallenge = useAppStore((s) => s.leaveChallenge);
  const logChallenge = useAppStore((s) => s.logChallenge);
  const active = activeChallengeCount(challenges);
  const atCap = active >= MAX_ACTIVE_CHALLENGES;

  return (
    <>
      <div className="banner">
        <span>
          {active} of {MAX_ACTIVE_CHALLENGES} challenge slots in use
          {atCap ? ' - leave or finish one to join another' : ''}
        </span>
      </div>
      {CHALLENGE_DEFS.map((def) => {
        const c = challenges.find((x) => x.id === def.id)!;
        const pct = Math.min(100, Math.round((c.progress / def.target) * 100));
        return (
          <div className="challenge-card card" key={def.id}>
            <div className="ch-head">
              <div>
                <div className="ch-title">{def.name}</div>
                <div className="ch-desc">{def.desc}</div>
              </div>
              <div className={`ch-badge${c.completed ? ' joined' : c.joined ? ' live' : ''}`}>
                {c.completed ? 'Done' : c.joined ? 'Joined' : 'Open'}
              </div>
            </div>
            {c.joined ? (
              <>
                <div className="progress-track" style={{ marginBottom: 8 }}>
                  <div className={`progress-fill${c.completed ? ' success' : ''}`} style={{ width: `${pct}%` }} />
                </div>
                <div className="ch-foot">
                  <span className="ch-days">
                    {c.progress} / {def.target} {def.unit}
                    {def.target > 1 ? 's' : ''}
                  </span>
                  <span style={{ display: 'flex', gap: 6 }}>
                    {def.logStep && !c.completed && (
                      <button className="btn btn-sm btn-ghost" onClick={() => logChallenge(def.id)}>
                        Log {def.logStep}
                      </button>
                    )}
                    {!c.completed && (
                      <button className="btn btn-sm btn-ghost" onClick={() => leaveChallenge(def.id)}>
                        Leave
                      </button>
                    )}
                  </span>
                </div>
              </>
            ) : (
              <>
                <div className="ch-days" style={{ marginBottom: 8 }}>{def.lengthDays} days</div>
                <button
                  className="btn btn-sm btn-primary"
                  disabled={atCap}
                  onClick={() => joinChallenge(def.id)}
                >
                  {atCap ? 'Slots full' : 'Join challenge'}
                </button>
              </>
            )}
          </div>
        );
      })}
    </>
  );
}
