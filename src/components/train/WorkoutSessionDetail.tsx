import { useAppStore } from '../../store/useAppStore';
import { RouteMap } from './RouteMap';
import { computeKmSplits, formatPace } from '../../lib/routeSplits';

// Full screen, not a popup - a tapped session needs real room to scroll
// (stats, map, every km split) without being cramped against the top nav
// bar, same pattern as the post composer.
export function WorkoutSessionDetail() {
  const workout = useAppStore((s) => s.viewingSessionDetail);
  if (!workout) return null;

  const km = workout.distanceMeters ? workout.distanceMeters / 1000 : null;
  const durationMin = parseFloat(workout.duration);
  const avgPaceSec = km && km > 0 ? (durationMin * 60) / km : null;
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
