import { Icon } from '../Icon';
import { CHALLENGE_DEFS } from '../../data/challenges';
import { useAppStore } from '../../store/useAppStore';

export function QuestCard() {
  const challenges = useAppStore((s) => s.challenges);
  const joinChallenge = useAppStore((s) => s.joinChallenge);

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
        <div className="quest-eyebrow">Quests</div>
        <div className="quest-title">All quests complete</div>
        <div className="quest-sub">New season quests drop on Day 28.</div>
      </div>
    );
  }

  const { def, c } = q;
  const pct = Math.min(100, Math.round((c.progress / def.target) * 100));
  const coinReward = def.bonusXp + Math.round(def.target * def.xpPerUnit);

  return (
    <div className="quest">
      <div className="quest-eyebrow">{joined ? 'Active quest' : 'Suggested quest'}</div>
      <div className="quest-title">{def.name}</div>
      <div className="quest-chips">
        <span className="qchip">
          <Icon name="coin" /> {coinReward}
        </span>
        <span className="qchip">
          <Icon name="zap" /> +{def.bonusXp} XP
        </span>
        <span className="qchip">
          <Icon name="clock" /> {def.lengthDays} days
        </span>
      </div>
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
            Join quest
          </button>
        </>
      )}
    </div>
  );
}
