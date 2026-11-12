import { Icon } from '../Icon';
import { Arena } from './Arena';
import { MetricsRow } from './MetricsRow';
import { QuestCard } from './QuestCard';
import { WorkoutCTA } from './WorkoutCTA';
import { GoalsList } from './GoalsList';
import { GoalsKPI } from './GoalsKPI';
import { StepChallengeCard } from './StepChallengeCard';
import { LevelPath } from './LevelPath';
import { UnlocksRail } from './UnlocksRail';
import { useAppStore } from '../../store/useAppStore';
import { dailyCapForLevel } from '../../lib/xp';
import { STEP_GOAL } from '../../lib/schedule';
import { healthAvailableOnPlatform } from '../../lib/health';

export function HomeScreen() {
  const xpEarnedToday = useAppStore((s) => s.today.xpEarnedToday);
  const level = useAppStore((s) => s.progress.level);
  const openGoals = useAppStore((s) => s.openGoals);
  const go = useAppStore((s) => s.go);
  const goals = useAppStore((s) => s.today.goals);
  const health = useAppStore((s) => s.today.health);
  // StepChallengeCard renders as its own checklist row (same goal-row/
  // goal-check markup as every item in GoalsList) whenever HealthKit is
  // available on this platform, whether or not health data has loaded yet -
  // it just shows "no step data yet" rather than disappearing. It isn't
  // part of `today.goals`, so the header's count has to add it in by hand
  // or it silently undercounts the checklist the user is actually looking
  // at (5 real goals shown as "/5" when a 6th row - steps - is right there).
  const stepChallengeShown = healthAvailableOnPlatform();
  const stepChallengeDone = !!health && health.steps >= STEP_GOAL;
  const totalCount = goals.length + (stepChallengeShown ? 1 : 0);
  const doneCount = goals.filter((g) => g.done).length + (stepChallengeShown && stepChallengeDone ? 1 : 0);
  const dailyCap = dailyCapForLevel(level);

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
      <div className="section-label">Today's checklist</div>
      <div className="card checklist">
        <div className="checklist-path">
          <div className="cp-head">
            <span className="cp-xp">
              {xpEarnedToday}
              <small> / {dailyCap} XP today</small>
            </span>
            <span className="cp-count">{doneCount}/{totalCount} done</span>
          </div>
          <div className="cp-track-row">
            <div className="cp-track" />
            <div
              className="cp-fill"
              style={{ width: `${totalCount > 1 ? (Math.min(doneCount, totalCount - 1) / (totalCount - 1)) * 100 : doneCount > 0 ? 100 : 0}%` }}
            />
            {Array.from({ length: totalCount }, (_, i) => {
              const done = i < doneCount;
              const next = i === doneCount;
              return (
                <div className={`cp-node${done ? ' done' : ''}${next ? ' next' : ''}`} key={i}>
                  {done && <Icon name="check" />}
                </div>
              );
            })}
          </div>
        </div>
        {doneCount === 0 && (
          <div className="checklist-hint">
            <Icon name="info" /> Tap a glowing icon below to mark it done
          </div>
        )}
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
      <div className="section-label">Unlocks</div>
      <UnlocksRail />
      <div style={{ height: 8 }} />
    </>
  );
}
