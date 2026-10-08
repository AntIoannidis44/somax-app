import { Icon } from '../Icon';
import { useAppStore } from '../../store/useAppStore';
import { STEP_GOAL, STEP_GOAL_XP } from '../../lib/schedule';

// Real Apple Health steps count toward a daily challenge, not just the
// display ring in MetricsRow - hitting the goal is auto-detected and
// awards XP via syncHealthMetrics (see useAppStore.ts), same as any
// other goal, but it can't be tapped to fake-complete since it's driven
// entirely by real step data.
export function StepChallengeCard() {
  const health = useAppStore((s) => s.today.health);
  if (!health) return null;

  const pct = Math.max(0, Math.min(1, health.steps / STEP_GOAL));
  const done = health.steps >= STEP_GOAL;

  return (
    <div className="goal-row">
      <div className={`goal-check${done ? ' done' : ''}`} style={{ cursor: 'default' }}>
        <Icon name="check" />
      </div>
      <div className="goal-main">
        <div className={`goal-title${done ? ' done' : ''}`}>Hit {STEP_GOAL.toLocaleString()} steps</div>
        <div className="goal-meta">{health.steps.toLocaleString()} steps so far · via Apple Health</div>
        <div className="progress-track" style={{ height: 5, marginTop: 6 }}>
          <div className={`progress-fill${done ? ' success' : ''}`} style={{ width: `${Math.round(pct * 100)}%` }} />
        </div>
      </div>
      <div className="goal-xp">+{STEP_GOAL_XP} XP</div>
    </div>
  );
}
