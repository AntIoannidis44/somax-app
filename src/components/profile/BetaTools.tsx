import { useAppStore } from '../../store/useAppStore';

export function BetaTools() {
  const advanceDay = useAppStore((s) => s.advanceDay);

  return (
    <div className="card">
      <div className="simbar">
        <div>
          <div className="setting-title">Simulate next day</div>
          <div className="setting-sub">Advances the program &amp; resets today’s goals</div>
        </div>
        <button className="btn btn-sm btn-ghost" onClick={advanceDay}>
          Advance +1
        </button>
      </div>
    </div>
  );
}
