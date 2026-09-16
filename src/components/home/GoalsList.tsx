import { useEffect, useState } from 'react';
import { Icon } from '../Icon';
import { useAppStore } from '../../store/useAppStore';

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
      {goals.map((g) => (
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
      ))}
    </>
  );
}
