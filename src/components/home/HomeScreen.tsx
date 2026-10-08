import { Arena } from './Arena';
import { MetricsRow } from './MetricsRow';
import { QuestCard } from './QuestCard';
import { WorkoutCTA } from './WorkoutCTA';
import { GoalsList } from './GoalsList';
import { GoalsKPI } from './GoalsKPI';
import { StepChallengeCard } from './StepChallengeCard';
import { LevelPath } from './LevelPath';
import { useAppStore } from '../../store/useAppStore';
import { DAILY_CAP } from '../../lib/xp';

export function HomeScreen() {
  const xpEarnedToday = useAppStore((s) => s.today.xpEarnedToday);
  const openGoals = useAppStore((s) => s.openGoals);
  const go = useAppStore((s) => s.go);
  const goals = useAppStore((s) => s.today.goals);
  const doneCount = goals.filter((g) => g.done).length;
  const capPct = Math.min(100, Math.round((xpEarnedToday / DAILY_CAP) * 100));

  return (
    <>
      <Arena />
      <MetricsRow />
      <div className="section-label">
        Today
        <button className="link-btn" onClick={() => go('train')}>
          Plan
        </button>
      </div>
      <WorkoutCTA />
      <div className="section-label">
        Quest
        <button className="link-btn" onClick={() => go('play')}>
          All quests
        </button>
      </div>
      <QuestCard />
      <div className="section-label">
        Today's checklist
        <span className="mono" style={{ fontWeight: 500, color: 'var(--text-faint)' }}>
          {doneCount}/{goals.length} done · {xpEarnedToday}/{DAILY_CAP} XP
        </span>
      </div>
      <div className="card checklist">
        <div className="progress-track checklist-cap">
          <div className={`progress-fill${capPct >= 100 ? ' success' : ''}`} style={{ width: `${capPct}%` }} />
        </div>
        <StepChallengeCard />
        <GoalsList />
      </div>
      <div className="section-label">
        Goals
        <button className="link-btn" onClick={() => openGoals()}>
          All goals
        </button>
      </div>
      <GoalsKPI />
      <div className="section-label">Level path</div>
      <LevelPath />
      <div style={{ height: 8 }} />
    </>
  );
}
