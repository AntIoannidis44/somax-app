import { useAppStore } from '../../store/useAppStore';
import type { Stats } from '../../types';

const STAT_DEFS: { k: keyof Stats; label: string; c: string }[] = [
  { k: 'strength', label: 'Strength', c: 'var(--stat-strength)' },
  { k: 'endurance', label: 'Endurance', c: 'var(--stat-endurance)' },
  { k: 'agility', label: 'Agility', c: 'var(--stat-agility)' },
  { k: 'vitality', label: 'Vitality', c: 'var(--stat-vitality)' },
  { k: 'recovery', label: 'Recovery', c: 'var(--stat-recovery)' },
  { k: 'discipline', label: 'Discipline', c: 'var(--stat-discipline)' },
];

export function StatBars() {
  const stats = useAppStore((s) => s.progress.stats);

  return (
    <div className="stat-list">
      {STAT_DEFS.map((d) => (
        <div className="stat-row" key={d.k}>
          <span className="stat-dot" style={{ background: d.c }} />
          <span className="stat-label">{d.label}</span>
          <div className="stat-track">
            <div className="stat-fill" style={{ width: `${stats[d.k]}%`, background: d.c }} />
          </div>
          <span className="stat-val">{stats[d.k]}</span>
        </div>
      ))}
    </div>
  );
}
