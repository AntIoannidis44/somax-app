import { Icon } from '../Icon';
import { useAppStore } from '../../store/useAppStore';
import { useGoals } from '../../lib/useGoals';
import { GoalRow } from '../goals/GoalRow';
import { fitnessGoalView, weightGoalView } from '../goals/goalView';

// Home's goals bar: each long-term goal with days left, progress and XP.
// Tap through to the Goals & schedule screen to add, log or abandon.
export function GoalsKPI() {
  const openGoals = useAppStore((s) => s.openGoals);
  const { weightGoal, latestWeight, fitnessGoals, loaded } = useGoals();
  if (!loaded) return null;

  const views = [
    ...(weightGoal && latestWeight != null ? [weightGoalView(weightGoal, latestWeight)] : []),
    ...fitnessGoals.map(fitnessGoalView),
  ];

  return (
    <div className="card goal-list">
      {views.length === 0 ? (
        <button className="kpi-row" onClick={() => openGoals()}>
          <span className="type-icon-badge" style={{ width: 36, height: 36, background: 'linear-gradient(152deg, var(--hero-1), var(--hero-2))' }}>
            <Icon name="plus" style={{ width: 17, height: 17 }} />
          </span>
          <div className="main">
            <div className="t" style={{ fontWeight: 700 }}>Set your first goal</div>
            <div className="ks">
              <span>A weight target, a 5k time, or how often you train</span>
            </div>
          </div>
        </button>
      ) : (
        views.map((v) => <GoalRow key={v.key} view={v} onClick={() => openGoals()} />)
      )}
    </div>
  );
}
