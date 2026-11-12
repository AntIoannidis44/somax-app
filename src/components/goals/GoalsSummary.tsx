import { Icon } from '../Icon';
import { useAppStore } from '../../store/useAppStore';
import { useGoals } from '../../lib/useGoals';
import { GoalCard, GoalEmptyCTA } from './GoalCard';
import { fitnessGoalView, weightGoalView } from './goalView';

// Profile's Goals & schedule section: active goals (the same ring-card
// deck as Home's GoalsKPI - see GoalCard.tsx) plus the training schedule,
// each opening the full Goals & schedule screen.
export function GoalsSummary() {
  const profile = useAppStore((s) => s.profile)!;
  const openGoals = useAppStore((s) => s.openGoals);
  const { weightGoal, latestWeight, fitnessGoals, loaded } = useGoals();
  const views = [
    ...(weightGoal && latestWeight != null ? [weightGoalView(weightGoal, latestWeight)] : []),
    ...fitnessGoals.map(fitnessGoalView),
  ];

  return (
    <>
      {loaded && views.length === 0 && (
        <GoalEmptyCTA onClick={() => openGoals()} title="Set a goal" subtitle="Weight, a time to beat, distance or how often you train" />
      )}
      {views.length > 0 && (
        <div className="goal-deck">
          {views.slice(0, 3).map((v) => (
            <GoalCard key={v.key} view={v} onClick={() => openGoals()} />
          ))}
        </div>
      )}
      <div className="card goal-list" style={{ marginTop: 10 }}>
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
    </>
  );
}
