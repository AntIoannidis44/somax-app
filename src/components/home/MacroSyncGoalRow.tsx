import { useEffect, useState } from 'react';
import { Icon } from '../Icon';
import { useAppStore } from '../../store/useAppStore';
import { useUserId } from '../../lib/useSession';
import { fetchDayEntries, isoToday } from '../macros/macros';

// Renders the 'macros' goal exactly like WatchSyncGoalRow renders
// 'watch_workout': a read-only status row with no tap target at all - the
// check only ever reflects syncMacroGoal's real food-log-driven state
// (useAppStore.ts), never a manual toggle. Previously this fell through
// to GoalsList's generic tap-to-complete row, which meant anyone could
// just tap it to fake-complete it regardless of what was actually logged.
export function MacroSyncGoalRow() {
  const goal = useAppStore((s) => s.today.goals.find((g) => g.id === 'macros'));
  const openMacros = useAppStore((s) => s.openMacros);
  const userId = useUserId();
  const [mealsLogged, setMealsLogged] = useState<number | null>(null);

  useEffect(() => {
    if (!userId) return;
    fetchDayEntries(userId, isoToday()).then((entries) => {
      setMealsLogged(new Set(entries.map((e) => e.meal)).size);
    });
  }, [userId, goal?.done]);

  if (!goal) return null;
  const done = goal.done;

  return (
    <div className="goal-row">
      <div className={`goal-check${done ? ' done' : ''}`} style={{ cursor: 'default' }}>
        <Icon name={done ? 'check' : 'nutrition'} />
      </div>
      <div className="goal-main">
        <div className={`goal-title${done ? ' done' : ''}`}>{goal.label}</div>
        <div className="goal-meta">
          {done ? 'All 4 meals logged' : mealsLogged === null ? goal.meta : `${mealsLogged} of 4 meals logged`}
        </div>
        {!done && (
          <button className="link-btn" style={{ marginTop: 6, fontSize: 12 }} onClick={() => openMacros()}>
            Log your meals in Nutrition &rarr;
          </button>
        )}
      </div>
      <div className="goal-xp">+{goal.xp} XP</div>
    </div>
  );
}
