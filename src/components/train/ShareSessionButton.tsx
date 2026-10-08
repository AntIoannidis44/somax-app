import { useState } from 'react';
import { Icon } from '../Icon';
import { useAppStore } from '../../store/useAppStore';
import { useUserId } from '../../lib/useSession';
import { fetchFriends, sendDM, type PostWorkout, type PublicProfile } from '../../lib/social';
import { encodeActivityMessage } from '../../lib/activityShare';

// Sends the actual completed session to a chosen friend via DM, as the same
// rich card the feed/share-link flows use - not a plain-text summary, which
// used to just dump a line of text into the chat instead of a real card.
// `resolveActivity` is a function (not the object itself) because the Watch
// case needs an async route lookup, done lazily on send rather than on
// every render.
export function ShareSessionButton({ resolveActivity }: { resolveActivity: () => Promise<PostWorkout> }) {
  const userId = useUserId();
  const showToast = useAppStore((s) => s.showToast);
  const [open, setOpen] = useState(false);
  const [friends, setFriends] = useState<PublicProfile[] | null>(null);
  const [sendingId, setSendingId] = useState<string | null>(null);

  async function handleOpen() {
    const next = !open;
    setOpen(next);
    if (next && !friends && userId) {
      const list = await fetchFriends(userId);
      setFriends(list);
    }
  }

  async function handleSend(friend: PublicProfile) {
    if (!userId) return;
    setSendingId(friend.user_id);
    const activity = await resolveActivity();
    await sendDM(userId, friend.user_id, encodeActivityMessage(activity));
    setSendingId(null);
    setOpen(false);
    showToast(`Shared with ${friend.name}`);
  }

  return (
    <div>
      <button className="btn btn-ghost" onClick={handleOpen}>
        <Icon name="link" style={{ width: 15, height: 15 }} /> Share with a friend
      </button>
      {open && (
        <div className="day-picker" style={{ marginTop: 8 }}>
          {friends === null ? (
            <div className="empty-hint">Loading friends…</div>
          ) : friends.length === 0 ? (
            <div className="empty-hint">Add friends in Community first.</div>
          ) : (
            friends.map((f) => (
              <div key={f.user_id} className="day-picker-opt" onClick={() => handleSend(f)}>
                {sendingId === f.user_id ? 'Sending…' : `${f.name} · Lv ${f.level}`}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
