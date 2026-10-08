import { useEffect, useRef, useState } from 'react';
import { Icon } from '../Icon';
import { TypeIconBadge } from '../TypeIconBadge';
import { useAppStore } from '../../store/useAppStore';
import { useUserId } from '../../lib/useSession';
import { clearConversation, deleteDM, fetchConversation, sendDM, subscribeDMs, type DirectMessage, type PostWorkout } from '../../lib/social';
import { saveWorkout } from '../../lib/customWorkouts';
import { decodeProgramMessage, type SharedProgram } from '../../lib/programShare';
import { decodeActivityMessage } from '../../lib/activityShare';
import { expandSets } from '../../lib/workoutSets';
import { encodeImageMessage, imagePathFromMessage, signedChatImageUrl, uploadChatImage } from '../../lib/chatImage';
import { RouteMap } from '../train/RouteMap';

// A photo in chat. The signed link is fetched when it first shows.
function ChatImage({ path }: { path: string }) {
  const [src, setSrc] = useState<string | null>(null);
  useEffect(() => {
    let cancelled = false;
    signedChatImageUrl(path).then((url) => {
      if (!cancelled) setSrc(url);
    });
    return () => {
      cancelled = true;
    };
  }, [path]);
  if (!src) return <div className="chat-image-loading">Loading photo…</div>;
  return <img className="chat-image" src={src} alt="Shared photo" />;
}

// A program sent in chat: shows the program inline, with Open to preview its
// sets and (for programs from someone else) Add to my programs.
function ProgramMessage({ program, userId }: { program: SharedProgram; userId: string | null }) {
  const showToast = useAppStore((s) => s.showToast);
  const [open, setOpen] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  async function addToMine() {
    if (!userId) return;
    setSaving(true);
    const id = await saveWorkout(userId, { name: program.name, duration: program.duration, exercises: program.exercises, category: program.category });
    setSaving(false);
    if (id) {
      setSaved(true);
      showToast('Added to your programs');
    } else {
      showToast('Could not add this program');
    }
  }

  return (
    <div className="program-msg">
      <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
        <TypeIconBadge category={program.category} size={24} />
        <div>
          <div className="program-msg-title">{program.name}</div>
          <div className="program-msg-sub">
            {program.duration} · {program.exercises.length} exercises
          </div>
        </div>
      </div>
      {open && (
        <div className="program-msg-body">
          {program.exercises.map((ex, i) => (
            <div className="overview-ex" key={i}>
              <div className="ex-name">{ex.name}</div>
              <div className="overview-sets">
                {expandSets(ex).map((set, k) => (
                  <div className="overview-set" key={k}>
                    <span className="overview-set-no">Set {k + 1}</span>
                    <span>
                      {set.reps}
                      {set.weight ? ` · ${set.weight}` : ''}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
      <div className="program-msg-actions">
        <button className="btn btn-ghost btn-sm" onClick={() => setOpen((o) => !o)}>
          {open ? 'Close' : 'Open'}
        </button>
        <button className="btn btn-primary btn-sm" disabled={saved || saving} onClick={addToMine}>
          {saved ? 'Added' : 'Add to my programs'}
        </button>
      </div>
    </div>
  );
}

// A completed session shared in chat - the real card (route map, distance,
// duration), not a plain-text summary. Tapping it opens the exact same
// full-screen session detail a feed post's card does.
function ActivityMessage({ activity, userId }: { activity: PostWorkout; userId: string | null }) {
  const showToast = useAppStore((s) => s.showToast);
  const openSessionDetail = useAppStore((s) => s.openSessionDetail);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  async function addToMine() {
    if (!userId) return;
    setSaving(true);
    const id = await saveWorkout(userId, { name: activity.name, duration: activity.duration, exercises: activity.exercises, category: activity.category });
    setSaving(false);
    if (id) {
      setSaved(true);
      showToast('Added to your programs');
    } else {
      showToast('Could not add this');
    }
  }

  const km = activity.distanceMeters ? activity.distanceMeters / 1000 : null;
  const hasRoute = activity.route && activity.route.length > 1;

  return (
    <div className="program-msg">
      {hasRoute && (
        <div className="activity-msg-map" onClick={() => openSessionDetail(activity)}>
          <RouteMap points={activity.route!} height={120} />
        </div>
      )}
      <div style={{ display: 'flex', alignItems: 'center', gap: 9, cursor: 'pointer' }} onClick={() => openSessionDetail(activity)}>
        <TypeIconBadge category={activity.category} size={24} />
        <div>
          <div className="program-msg-title">{activity.name}</div>
          <div className="program-msg-sub">
            {activity.duration}
            {km !== null ? ` · ${km.toFixed(2)} km` : ''}
          </div>
        </div>
      </div>
      <div className="program-msg-actions">
        <button className="btn btn-ghost btn-sm" onClick={() => openSessionDetail(activity)}>
          View
        </button>
        <button className="btn btn-primary btn-sm" disabled={saved || saving} onClick={addToMine}>
          {saved ? 'Added' : 'Add to my programs'}
        </button>
      </div>
    </div>
  );
}

export function DMScreen() {
  const viewingDM = useAppStore((s) => s.viewingDM)!;
  const userId = useUserId();
  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [draft, setDraft] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);
  const [uploading, setUploading] = useState(false);
  // Message whose delete option is showing (tap a bubble to reveal it).
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const showToast = useAppStore((s) => s.showToast);

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    function load() {
      fetchConversation(userId!, viewingDM.userId).then((rows) => {
        if (!cancelled) setMessages(rows);
      });
    }
    load();
    const unsubscribe = subscribeDMs(load);
    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [userId, viewingDM.userId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: 'end' });
  }, [messages.length]);

  function handleSend() {
    const text = draft.trim();
    if (!text || !userId) return;
    setDraft('');
    sendDM(userId, viewingDM.userId, text);
  }

  // Removes the message for both people straight away; the realtime refresh
  // then keeps both screens in step.
  async function handleDelete(id: string) {
    setSelectedId(null);
    setMessages((prev) => prev.filter((m) => m.id !== id));
    await deleteDM(id);
  }

  async function handleClear() {
    if (!userId) return;
    if (!window.confirm(`Clear the whole chat with ${viewingDM.name}? This removes it for both of you.`)) return;
    setMessages([]);
    const ok = await clearConversation(userId, viewingDM.userId);
    showToast(ok ? 'Chat cleared' : 'Could not clear the chat');
  }

  async function handlePhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || !userId) return;
    setUploading(true);
    try {
      const path = await uploadChatImage(userId, file);
      await sendDM(userId, viewingDM.userId, encodeImageMessage(path));
    } catch (err) {
      showToast(err instanceof Error ? `Photo not sent: ${err.message}` : 'Photo not sent');
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="dm-panel">
      <div className="dm-messages">
        {messages.length === 0 && (
          <div style={{ padding: '16px 4px', color: 'var(--text-faint)', fontSize: 13, textAlign: 'center' }}>
            No messages yet - say hi to {viewingDM.name}.
          </div>
        )}
        {messages.length > 0 && (
          <div className="dm-clear-row">
            <button className="link-btn" onClick={handleClear}>
              Clear chat
            </button>
          </div>
        )}
        {messages.map((m) => {
          const mine = m.sender_id === userId;
          const showDelete = selectedId === m.id;
          const deleteRow = showDelete ? (
            <div className={`dm-delete-row ${mine ? 'mine' : 'theirs'}`}>
              <button className="btn btn-danger-ghost btn-sm" onClick={() => handleDelete(m.id)}>
                Delete for both
              </button>
              <button className="link-btn" onClick={() => setSelectedId(null)}>
                Cancel
              </button>
            </div>
          ) : null;
          const imagePath = imagePathFromMessage(m.text);
          if (imagePath) {
            return (
              <div key={m.id} className={`dm-row ${mine ? 'mine' : 'theirs'}`}>
                <div className={`dm-bubble image ${mine ? 'mine' : 'theirs'}`} onClick={() => setSelectedId(showDelete ? null : m.id)}>
                  <ChatImage path={imagePath} />
                </div>
                {deleteRow}
              </div>
            );
          }
          const program = decodeProgramMessage(m.text);
          if (program) {
            return (
              <div key={m.id} className={`dm-row ${mine ? 'mine' : 'theirs'}`}>
                <div className={`dm-bubble program ${mine ? 'mine' : 'theirs'}`}>
                  <ProgramMessage program={program} userId={userId} />
                </div>
                {deleteRow}
              </div>
            );
          }
          const activity = decodeActivityMessage(m.text);
          if (activity) {
            return (
              <div key={m.id} className={`dm-row ${mine ? 'mine' : 'theirs'}`}>
                <div className={`dm-bubble program ${mine ? 'mine' : 'theirs'}`}>
                  <ActivityMessage activity={activity} userId={userId} />
                </div>
                {deleteRow}
              </div>
            );
          }
          return (
            <div key={m.id} className={`dm-row ${mine ? 'mine' : 'theirs'}`}>
              <div className={`dm-bubble ${mine ? 'mine' : 'theirs'}`} onClick={() => setSelectedId(showDelete ? null : m.id)}>
                {m.text}
              </div>
              {deleteRow}
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>
      <div className="dm-input-row">
        <label className={`dm-attach${uploading ? ' busy' : ''}`} aria-label="Send a photo">
          <Icon name="plus" />
          <input type="file" accept="image/*" onChange={handlePhoto} disabled={uploading} style={{ display: 'none' }} />
        </label>
        <input
          type="text"
          placeholder="Message"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
        />
        <button className="btn btn-primary btn-sm" onClick={handleSend} disabled={!draft.trim()}>
          <Icon name="chevron" />
        </button>
      </div>
    </div>
  );
}
