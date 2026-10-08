import { Icon } from '../Icon';
import { useAppStore } from '../../store/useAppStore';
import { HYDRATION_TARGET_ML } from '../../lib/schedule';

const STEP_ML = 250;

function formatLiters(ml: number): string {
  return (ml / 1000).toFixed(2).replace(/0$/, '').replace(/\.$/, '');
}

// Water as tappable 250 ml glasses. Tapping the last filled glass empties
// it, so a mis-tap is easy to undo. It self-awards once the target is
// reached, then locks.
export function HydrationBar() {
  const hydrationMl = useAppStore((s) => s.today.hydrationMl ?? 0);
  const goal = useAppStore((s) => s.today.goals.find((g) => g.id === 'hydration'));
  const setHydration = useAppStore((s) => s.setHydration);

  if (!goal) return null;
  const done = goal.done;
  const glasses = Math.round(HYDRATION_TARGET_ML / STEP_ML);
  const filled = Math.min(glasses, Math.round(hydrationMl / STEP_ML));

  function tap(i: number) {
    if (done) return;
    const next = i + 1 === filled ? i : i + 1;
    setHydration(next * STEP_ML);
  }

  return (
    <div className="goal-row">
      <div className={`goal-check${done ? ' done' : ''}`} style={{ cursor: 'default' }}>
        <Icon name="check" />
      </div>
      <div className="goal-main">
        <div className={`goal-title${done ? ' done' : ''}`}>{goal.label}</div>
        <div className="goal-meta">
          {formatLiters(hydrationMl)} L of {formatLiters(HYDRATION_TARGET_ML)} L{done ? '' : ' · tap a glass'}
        </div>
        <div className={`water-cells${done ? ' locked' : ''}`}>
          {Array.from({ length: glasses }, (_, i) => (
            <button key={i} className={i < filled ? 'on' : ''} onClick={() => tap(i)} aria-label={`${(i + 1) * STEP_ML} ml`} />
          ))}
        </div>
      </div>
      <div className="goal-xp">+{goal.xp} XP</div>
    </div>
  );
}
