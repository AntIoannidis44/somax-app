import { useEffect, useState } from 'react';
import { useAppStore } from '../../store/useAppStore';

export function LevelUpBurst() {
  const levelUp = useAppStore((s) => s.levelUp);
  const clearLevelUp = useAppStore((s) => s.clearLevelUp);
  const [visible, setVisible] = useState(false);
  const [level, setLevel] = useState(0);

  useEffect(() => {
    if (!levelUp) return;
    setLevel(levelUp.level);
    setVisible(true);
    const hideTimer = setTimeout(() => setVisible(false), 1500);
    const clearTimer = setTimeout(() => clearLevelUp(), 1800);
    return () => {
      clearTimeout(hideTimer);
      clearTimeout(clearTimer);
    };
  }, [levelUp, clearLevelUp]);

  return (
    <div className={`levelup-burst${visible ? ' show' : ''}`}>
      <div className="levelup-card">
        <div className="lu-label">Level Up</div>
        <div className="lu-num">{level}</div>
      </div>
    </div>
  );
}
