import { Icon } from '../Icon';
import { useAppStore } from '../../store/useAppStore';
import { healthAvailableOnPlatform, openHealthAppSettings } from '../../lib/health';
import { formatTime } from '../../lib/format';

// Renders the 'watch_workout' goal on a day set to "sync from Watch" -
// every real activity logged today is listed so the user can toggle on
// whichever one(s) count (there can be more than one, e.g. two separate
// indoor walks), rather than the app guessing or locking to a single
// pick. XP awards once on the first selection; the list stays open and
// keeps refreshing afterwards so more picks can be added later.
export function WatchSyncGoalRow() {
  const goal = useAppStore((s) => s.today.goals.find((g) => g.id === 'watch_workout'));
  const available = useAppStore((s) => s.today.availableWatchWorkouts);
  const selected = useAppStore((s) => s.today.selectedWatchWorkouts);
  const toggleWatchWorkoutSelection = useAppStore((s) => s.toggleWatchWorkoutSelection);
  if (!goal) return null;
  const done = goal.done;
  const native = healthAvailableOnPlatform();
  const selectedSet = new Set((selected ?? []).map((w) => w.startDate));

  return (
    <div className="goal-row" style={{ flexWrap: 'wrap' }}>
      <div className={`goal-check${done ? ' done' : ''}`} style={{ cursor: 'default' }}>
        <Icon name={done ? 'check' : 'watch'} />
      </div>
      <div className="goal-main">
        <div className={`goal-title${done ? ' done' : ''}`}>
          {selected && selected.length > 0
            ? `${selected.length} ${selected.length === 1 ? 'activity' : 'activities'} synced`
            : goal.label}
        </div>
        <div className="goal-meta">
          {!native
            ? 'Apple Health sync is only available in the iOS app'
            : selected && selected.length > 0
              ? `${Math.round(selected.reduce((sum, w) => sum + w.durationMinutes, 0))} min · ${Math.round(selected.reduce((sum, w) => sum + w.kcal, 0))} kcal total`
              : available && available.length > 0
                ? 'Tap any activity below to count it'
                : goal.meta}
        </div>
        {available && available.length > 0 && (
          <div className="day-picker" style={{ marginTop: 8 }}>
            {available.map((w, i) => (
              <div
                key={i}
                className={`day-picker-opt${selectedSet.has(w.startDate) ? ' current' : ''}`}
                onClick={() => toggleWatchWorkoutSelection(w)}
              >
                {selectedSet.has(w.startDate) ? '✓ ' : ''}
                {w.activityName} · {formatTime(w.startDate)} · {Math.round(w.durationMinutes)} min
              </div>
            ))}
          </div>
        )}
        {native && !done && (!available || available.length === 0) && (
          // Not logging a workout looks identical, from here, to Health
          // access being denied for this app - HealthKit never reveals
          // which one it actually is (see openAppSettings' comment) - so
          // rather than a dead end, point straight at the one place that
          // can actually confirm it.
          <button
            className="link-btn"
            style={{ marginTop: 6, fontSize: 12 }}
            onClick={() => openHealthAppSettings()}
          >
            Not seeing a workout that happened? Check Health access →
          </button>
        )}
      </div>
      <div className="goal-xp">+{goal.xp} XP</div>
    </div>
  );
}
