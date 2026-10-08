import { useEffect, useState } from 'react';
import { Icon } from '../Icon';
import { useAppStore } from '../../store/useAppStore';
import { HydrationBar } from './HydrationBar';
import { WatchSyncGoalRow } from './WatchSyncGoalRow';
import { LogFeelGoalRow } from './LogFeelGoalRow';

export function GoalsList() {
  const goals = useAppStore((s) => s.today.goals);
  const toggleGoal = useAppStore((s) => s.toggleGoal);
  const [poppedId, setPoppedId] = useState<string | null>(null);

  useEffect(() => {
    if (!poppedId) return;
    const timer = setTimeout(() => setPoppedId(null), 480);
    return () => clearTimeout(timer);
  }, [poppedId]);

  return (
    <>
      {goals.map((g) => {
        // Hydration is drag-to-fill (HydrationBar), not tap-to-complete -
        // it self-awards once the real dragged amount hits the target,
        // so it can't be faked with a single tap like the others.
        if (g.id === 'hydration') return <HydrationBar key={g.id} />;
        if (g.id === 'watch_workout') return <WatchSyncGoalRow key={g.id} />;
        if (g.id === 'logfeel') return <LogFeelGoalRow key={g.id} />;
        return (
          <div className="goal-row" key={g.id}>
            <button
              className={`goal-check${g.done ? ' done' : ''}${poppedId === g.id ? ' pop' : ''}`}
              onClick={() => {
                if (g.done) return;
                setPoppedId(g.id);
                toggleGoal(g.id);
              }}
            >
              <Icon name="check" />
            </button>
            <div className="goal-main">
              <div className={`goal-title${g.done ? ' done' : ''}`}>{g.label}</div>
              <div className="goal-meta">{g.meta}</div>
            </div>
            <div className="goal-xp">+{g.xp} XP</div>
          </div>
        );
      })}
    </>
  );
}
