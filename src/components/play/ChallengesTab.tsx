import { CHALLENGE_DEFS } from '../../data/challenges';
import { useAppStore } from '../../store/useAppStore';

export function ChallengesTab() {
  const challenges = useAppStore((s) => s.challenges);
  const joinChallenge = useAppStore((s) => s.joinChallenge);
  const logPushups = useAppStore((s) => s.logPushups);

  return (
    <>
      {CHALLENGE_DEFS.map((def) => {
        const c = challenges.find((x) => x.id === def.id)!;
        const pct = Math.min(100, Math.round((c.progress / def.target) * 100));
        const isPushups = def.id === 'pushups';
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
                  {isPushups && !c.completed ? (
                    <button className="btn btn-sm btn-ghost" onClick={() => logPushups(def.id)}>
                      Log {def.logStep}
                    </button>
                  ) : (
                    <span className="ch-days">{def.lengthDays} days</span>
                  )}
                </div>
              </>
            ) : (
              <button className="btn btn-sm btn-primary" style={{ marginTop: 4 }} onClick={() => joinChallenge(def.id)}>
                Join challenge
              </button>
            )}
          </div>
        );
      })}
    </>
  );
}
