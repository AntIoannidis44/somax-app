import { Icon } from '../Icon';
import { daysLeft, type GoalView } from './goalView';

// The bold ring-card treatment for a goal - built for Home's goals deck,
// now also Profile's Goals & schedule section, so both actually show the
// same UI instead of Profile keeping the older flat .kpi-row look.
export function GoalCard({ view, onClick }: { view: GoalView; onClick: () => void }) {
  const left = daysLeft(view.due);
  const urgent = left <= 3;
  const soon = left <= 14;
  return (
    <button className="goal-card" style={{ ['--gc' as string]: `var(${view.colorVar})` }} onClick={onClick}>
      <div className={`goal-card-ring${view.pct == null ? ' indeterminate' : ''}`} style={view.pct != null ? { ['--p' as string]: `${view.pct}%` } : undefined}>
        <span className="goal-card-ring-inner">
          <Icon name={view.icon} />
        </span>
      </div>
      <div className="goal-card-main">
        <div className="goal-card-title">{view.title}</div>
        <div className="goal-card-meta">{view.meta}</div>
      </div>
      <div className={`goal-card-due${urgent ? ' urgent' : soon ? ' soon' : ''}`}>
        <span className="n">{left}</span>
        <span className="u">{left === 1 ? 'day' : 'days'}</span>
      </div>
    </button>
  );
}

// The same gradient CTA as Home's "no goals yet" state.
export function GoalEmptyCTA({ onClick, title, subtitle }: { onClick: () => void; title: string; subtitle: string }) {
  return (
    <button className="goal-cta" onClick={onClick}>
      <span className="goal-cta-icon">
        <Icon name="plus" />
      </span>
      <div>
        <div className="goal-cta-t">{title}</div>
        <div className="goal-cta-s">{subtitle}</div>
      </div>
    </button>
  );
}
