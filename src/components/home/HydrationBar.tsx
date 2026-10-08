import { useRef, useState } from 'react';
import { Icon } from '../Icon';
import { useAppStore } from '../../store/useAppStore';
import { HYDRATION_TARGET_ML } from '../../lib/schedule';

const STEP_ML = 250;

function formatLiters(ml: number): string {
  return (ml / 1000).toFixed(2).replace(/0$/, '').replace(/\.$/, '');
}

export function HydrationBar() {
  const hydrationMl = useAppStore((s) => s.today.hydrationMl ?? 0);
  const goal = useAppStore((s) => s.today.goals.find((g) => g.id === 'hydration'));
  const setHydration = useAppStore((s) => s.setHydration);
  const trackRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);

  if (!goal) return null;
  const done = goal.done;

  const pct = Math.max(0, Math.min(1, hydrationMl / HYDRATION_TARGET_ML));

  function valueFromPointer(clientX: number): number {
    const track = trackRef.current;
    if (!track) return hydrationMl;
    const rect = track.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    return Math.round((ratio * HYDRATION_TARGET_ML) / STEP_ML) * STEP_ML;
  }

  function handlePointerDown(e: React.PointerEvent<HTMLDivElement>) {
    if (done) return;
    setDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
    setHydration(valueFromPointer(e.clientX));
  }
  function handlePointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!dragging) return;
    setHydration(valueFromPointer(e.clientX));
  }
  function handlePointerUp() {
    setDragging(false);
  }

  return (
    <div className="goal-row">
      <div className={`goal-check${done ? ' done' : ''}`} style={{ cursor: 'default' }}>
        <Icon name="check" />
      </div>
      <div className="goal-main">
        <div className={`goal-title${done ? ' done' : ''}`}>{goal.label}</div>
        <div
          ref={trackRef}
          className={`hydration-track${done ? ' locked' : ''}`}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
        >
          <div className="hydration-fill" style={{ width: `${pct * 100}%` }}>
            <div className="hydration-wave" />
          </div>
          {!done && <div className="hydration-handle" style={{ left: `${pct * 100}%` }} />}
        </div>
        <div className="goal-meta">
          {formatLiters(hydrationMl)}L / {formatLiters(HYDRATION_TARGET_ML)}L
        </div>
      </div>
      <div className="goal-xp">+{goal.xp} XP</div>
    </div>
  );
}
