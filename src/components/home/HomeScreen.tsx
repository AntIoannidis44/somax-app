import { Arena } from './Arena';
import { MetricsRow } from './MetricsRow';
import { QuestCard } from './QuestCard';
import { WorkoutCTA } from './WorkoutCTA';
import { GoalsList } from './GoalsList';
import { LevelPath } from './LevelPath';
import { useAppStore } from '../../store/useAppStore';
import { DAILY_CAP } from '../../lib/xp';

export function HomeScreen() {
  const xpEarnedToday = useAppStore((s) => s.today.xpEarnedToday);
  const capPct = Math.min(100, Math.round((xpEarnedToday / DAILY_CAP) * 100));

  return (
    <>
      <Arena />
      <MetricsRow />
      <div className="section-label">Quest</div>
      <QuestCard />
      <div className="section-label">Today</div>
      <WorkoutCTA />
      <div className="section-label">
        Daily goals
        <span className="mono" style={{ fontWeight: 600, color: 'var(--text-faint)', textTransform: 'none', letterSpacing: 0 }}>
          {xpEarnedToday} / {DAILY_CAP} XP
        </span>
      </div>
      <div className="card" style={{ padding: '6px 12px 4px', marginBottom: 6 }}>
        <div className="progress-track" style={{ margin: '10px 0' }}>
          <div className={`progress-fill${capPct >= 100 ? ' success' : ''}`} style={{ width: `${capPct}%` }} />
        </div>
      </div>
      <div className="card" style={{ paddingTop: 2, paddingBottom: 2 }}>
        <GoalsList />
      </div>
      <div className="section-label">Level path</div>
      <LevelPath />
      <div style={{ height: 8 }} />
    </>
  );
}
