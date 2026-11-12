import { useAppStore } from '../../store/useAppStore';
import { useGoals } from '../../lib/useGoals';
import { fitnessGoalView, weightGoalView } from '../goals/goalView';
import { GoalCard, GoalEmptyCTA } from '../goals/GoalCard';

// Home's goals bar: the shared ring-card deck (goals/GoalCard.tsx), also
// used by Profile's Goals & schedule section (goals/GoalsSummary.tsx) so
// both actually show the same UI.
export function GoalsKPI() {
  const openGoals = useAppStore((s) => s.openGoals);
  const { weightGoal, latestWeight, fitnessGoals, loaded } = useGoals();
  if (!loaded) return null;

  const views = [
    ...(weightGoal && latestWeight != null ? [weightGoalView(weightGoal, latestWeight)] : []),
    ...fitnessGoals.map(fitnessGoalView),
  ];

  if (views.length === 0) {
    return <GoalEmptyCTA onClick={() => openGoals()} title="Set your first goal" subtitle="A weight target, a 5k time, or how often you train" />;
  }

  return (
    <div className="goal-deck">
      {views.map((v) => (
        <GoalCard key={v.key} view={v} onClick={() => openGoals()} />
      ))}
    </div>
  );
}
