import { Icon } from '../Icon';
import { daysLeft, type GoalView } from './goalView';

// Compact goal line (Home goals bar, Profile's Goals & schedule section):
// badge, title, days left, progress and the XP it pays.
export function GoalRow({ view, onClick, showXp = true }: { view: GoalView; onClick: () => void; showXp?: boolean }) {
  const left = daysLeft(view.due);
  return (
    <button className="kpi-row" onClick={onClick}>
      <span className="type-icon-badge" style={{ width: 36, height: 36, background: `var(${view.colorVar})` }}>
        <Icon name={view.icon} style={{ width: 17, height: 17 }} />
      </span>
      <div className="main">
        <div className="kt">
          <span className="t">{view.title}</span>
          <span className={`due${left <= 14 ? ' soon' : ''}`}>{left}d left</span>
        </div>
        {view.pct != null && (
          <div className="pbar">
            <i style={{ width: `${view.pct}%` }} />
          </div>
        )}
        <div className="ks">
          <span>{view.meta}</span>
          {showXp && (
            <span className="kxp">
              <Icon name="zap" />
              {view.xpShort} XP
            </span>
          )}
        </div>
      </div>
    </button>
  );
}
