import { TypeIconBadge } from '../TypeIconBadge';
import { useAppStore } from '../../store/useAppStore';
import { RouteMap } from './RouteMap';
import { computeKmSplits, formatPace } from '../../lib/routeSplits';
import { categoryForActivityName } from '../../data/workoutTypes';

// Full screen, not a popup - a tapped session needs real room to scroll
// (stats, map, every km split) without being cramped against the top nav
// bar, same pattern as the post composer.
export function WorkoutSessionDetail() {
  const workout = useAppStore((s) => s.viewingSessionDetail);
  if (!workout) return null;

  const km = workout.distanceMeters ? workout.distanceMeters / 1000 : null;
  const durationMin = parseFloat(workout.duration);
  // A merged multi-activity share (e.g. a Watch sync bundling "Walk + Walk +
  // Workout" into one send) has no single real pace - averaging total
  // distance over total time across activities that aren't all
  // distance-based is actively misleading, not just imprecise. Only show
  // pace for what's genuinely a single tracked activity.
  const isMerged = workout.exercises.length > 1;
  const avgPaceSec = !isMerged && km && km > 0 ? (durationMin * 60) / km : null;
  const splits = workout.route && workout.route.length > 1 ? computeKmSplits(workout.route) : [];

  return (
    <div className="composer-screen">
      <div className="composer-screen-body">
        <div className="session-stats">
          <div className="session-stat">
            <div className="session-stat-num">{workout.duration}</div>
            <div className="session-stat-label">Duration</div>
          </div>
          {km !== null && (
            <div className="session-stat">
              <div className="session-stat-num">{km.toFixed(2)} km</div>
              <div className="session-stat-label">Distance</div>
            </div>
          )}
          {avgPaceSec !== null && (
            <div className="session-stat">
              <div className="session-stat-num">{formatPace(avgPaceSec)}</div>
              <div className="session-stat-label">Avg pace</div>
            </div>
          )}
        </div>

        {isMerged && (
          <>
            <div className="section-label">Activities in this session</div>
            <div className="card">
              {workout.exercises.map((ex, i) => (
                <div className="goal-row" key={i}>
                  <TypeIconBadge category={categoryForActivityName(ex.name)} size={30} />
                  <div className="goal-main" style={{ marginLeft: 10 }}>
                    <div className="goal-title">{ex.name}</div>
                  </div>
                  <div className="goal-xp">{ex.reps}</div>
                </div>
              ))}
            </div>
          </>
        )}

        {workout.route && workout.route.length > 1 && (
          <>
            <div className="section-label">Route</div>
            <div style={{ marginBottom: 18 }}>
              <RouteMap points={workout.route} height={220} />
            </div>
          </>
        )}

        {splits.length > 0 && (
          <>
            <div className="section-label">Kilometre splits</div>
            <div className="card">
              {splits.map((s, i) => {
                const prevSeconds = i === 0 ? 0 : splits[i - 1].seconds;
                const splitSeconds = s.seconds - prevSeconds;
                return (
                  <div className="goal-row" key={s.km}>
                    <div className="goal-main">
                      <div className="goal-title">Km {s.km}</div>
                    </div>
                    <div className="goal-xp">{formatPace(splitSeconds)}</div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
