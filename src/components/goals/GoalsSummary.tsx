import { Icon } from '../Icon';
import { useAppStore } from '../../store/useAppStore';
import { useGoals } from '../../lib/useGoals';
import { GoalRow } from './GoalRow';
import { fitnessGoalView, weightGoalView } from './goalView';

// Profile's Goals & schedule section: active goals plus the training
// schedule, each opening the full Goals & schedule screen.
export function GoalsSummary() {
  const profile = useAppStore((s) => s.profile)!;
  const openGoals = useAppStore((s) => s.openGoals);
  const { weightGoal, latestWeight, fitnessGoals, loaded } = useGoals();
  const views = [
    ...(weightGoal && latestWeight != null ? [weightGoalView(weightGoal, latestWeight)] : []),
    ...fitnessGoals.map(fitnessGoalView),
  ];

  return (
    <div className="card goal-list">
      {loaded && views.length === 0 && (
        <button className="kpi-row" onClick={() => openGoals()}>
          <span className="type-icon-badge" style={{ width: 36, height: 36, background: 'linear-gradient(152deg, var(--hero-1), var(--hero-2))' }}>
            <Icon name="plus" style={{ width: 17, height: 17 }} />
          </span>
          <div className="main">
            <div className="t" style={{ fontWeight: 700 }}>Set a goal</div>
            <div className="ks">
              <span>Weight, a time to beat, distance or how often you train</span>
            </div>
          </div>
        </button>
      )}
      {views.slice(0, 3).map((v) => (
        <GoalRow key={v.key} view={v} onClick={() => openGoals()} showXp={false} />
      ))}
      <button className="kpi-row" onClick={() => openGoals()}>
        <span className="set-ic">
          <Icon name="calendar" />
        </span>
        <div className="main">
          <div className="t" style={{ fontWeight: 700 }}>Training schedule</div>
          <div className="ks" style={{ marginTop: 2 }}>
            <span>
              {profile.availability || '—'} days a week{profile.goal.length ? ` · ${profile.goal.join(', ')}` : ''}
            </span>
          </div>
        </div>
        <Icon name="chevron" style={{ width: 16, height: 16, color: 'var(--text-faint)' }} />
      </button>
    </div>
  );
}
