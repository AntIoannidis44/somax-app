import { useState } from 'react';
import { Icon } from '../Icon';
import { challengeCoins } from '../../lib/coins';
import { verifySpecFor } from '../../lib/verifiedChallenges';
import { CHALLENGE_DEFS, withAllChallenges } from '../../data/challenges';
import { useAppStore } from '../../store/useAppStore';

export function QuestCard() {
  const challenges = withAllChallenges(useAppStore((s) => s.challenges));
  const joinChallenge = useAppStore((s) => s.joinChallenge);
  const [coinInfo, setCoinInfo] = useState(false);

  function findQuest() {
    for (const def of CHALLENGE_DEFS) {
      const c = challenges.find((x) => x.id === def.id)!;
      if (c.joined && !c.completed) return { def, c, joined: true };
    }
    for (const def of CHALLENGE_DEFS) {
      const c = challenges.find((x) => x.id === def.id)!;
      if (!c.joined) return { def, c, joined: false };
    }
    return null;
  }
  const q = findQuest();
  const joined = q?.joined ?? false;

  if (!q) {
    return (
      <div className="quest">
        <div className="quest-eyebrow">Challenges</div>
        <div className="quest-title">All challenges complete</div>
        <div className="quest-sub">Browse more challenges in Play.</div>
      </div>
    );
  }

  const { def, c } = q;
  const pct = Math.min(100, Math.round((c.progress / def.target) * 100));
  const coinReward = challengeCoins(def);

  return (
    <div className="quest">
      <div className="quest-eyebrow">{joined ? 'Active challenge' : 'Suggested challenge'}</div>
      <div className="quest-title">{def.name}</div>
      <div className="quest-chips">
        {coinReward > 0 && (
          <button className="qchip qchip-btn" aria-label="How coins work for this challenge" onClick={() => setCoinInfo((v) => !v)}>
            <Icon name="coin" /> {coinReward} <Icon name="info" />
          </button>
        )}
        <span className="qchip">
          <Icon name="zap" /> +{def.bonusXp} XP
        </span>
        <span className="qchip">
          <Icon name="clock" /> {def.lengthDays} days
        </span>
      </div>
      {coinReward > 0 && coinInfo && (
        <div className="quest-sub">
          {(() => {
            const m = verifySpecFor(def)?.metric;
            return m === 'stepDays' || m === 'stepStreak'
              ? `Steps count automatically from Apple Health. Finish it to earn the XP and ${coinReward} coins.`
              : `Logging a workout counts toward this challenge and earns the XP. To also earn the ${coinReward} coins, the workouts need to be verified with Apple Health - recorded on your Apple Watch.`;
          })()}
        </div>
      )}
      {joined ? (
        <>
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${pct}%` }} />
          </div>
          <div className="quest-foot">
            <span>
              {c.progress} / {def.target} {def.unit}
              {def.target > 1 ? 's' : ''}
            </span>
            <span>{pct}%</span>
          </div>
        </>
      ) : (
        <>
          <div className="quest-sub">{def.desc}</div>
          <button className="btn btn-sm quest-btn" onClick={() => joinChallenge(def.id)}>
            Join challenge
          </button>
        </>
      )}
    </div>
  );
}
