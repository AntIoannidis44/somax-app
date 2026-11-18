import { Icon } from '../Icon';
import { useAppStore } from '../../store/useAppStore';
import { healthAvailableOnPlatform } from '../../lib/health';
import { WATCH_SYNC_XP } from '../../lib/schedule';

// One-shot hand-off: the card's button asks WorkoutScreen to open its Apple
// Fitness picker straight away on mount (the picker and its verification
// rules live there - see attachWatchWorkoutToSession / checkWatchSync).
let pendingVerify = false;
export function takePendingWatchVerify(): boolean {
  const v = pendingVerify;
  pendingVerify = false;
  return v;
}

// Sits under a finished workout's "Completed · review" button on the Home
// and Train cards: a verify button until an Apple Fitness workout has been
// attached and paid, then a quiet "verified" line.
export function VerifyWatchButton({ wid, day }: { wid: string; day: number }) {
  const ws = useAppStore((s) => s.workoutState[day]?.[wid]);
  const openWorkout = useAppStore((s) => s.openWorkout);
  if (!ws?.completed || !healthAvailableOnPlatform()) return null;

  if (ws.watchSyncXpAwarded) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 8, fontSize: 12.5, color: 'var(--text-dim)' }}>
        <Icon name="watch" style={{ width: 14, height: 14 }} /> Verified with Apple Fitness · +{WATCH_SYNC_XP} XP
      </div>
    );
  }

  return (
    <button
      className="btn btn-ghost"
      style={{ marginTop: 8 }}
      onClick={() => {
        pendingVerify = true;
        openWorkout(wid, day);
      }}
    >
      <Icon name="watch" style={{ width: 15, height: 15 }} /> Verify with Apple Fitness · +{WATCH_SYNC_XP} XP
    </button>
  );
}
