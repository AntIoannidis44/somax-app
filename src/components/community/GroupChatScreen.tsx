import { useEffect, useRef, useState } from 'react';
import { Icon } from '../Icon';
import { useAppStore } from '../../store/useAppStore';
import { useUserId } from '../../lib/useSession';
import {
  deleteGroupMessage,
  fetchGroupMemberIds,
  fetchGroupMessages,
  leaveGroup,
  sendGroupMessage,
  subscribeGroupMessages,
  type GroupMessage,
} from '../../lib/groups';

export function GroupChatScreen() {
  const viewingGroup = useAppStore((s) => s.viewingGroup)!;
  const closeGroup = useAppStore((s) => s.closeGroup);
  const profile = useAppStore((s) => s.profile);
  const showToast = useAppStore((s) => s.showToast);
  const userId = useUserId();
  const [messages, setMessages] = useState<GroupMessage[]>([]);
  const [memberCount, setMemberCount] = useState<number | null>(null);
  const [draft, setDraft] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    function load() {
      fetchGroupMessages(viewingGroup.groupId).then((rows) => {
        if (!cancelled) setMessages(rows);
      });
    }
    load();
    fetchGroupMemberIds(viewingGroup.groupId).then((ids) => {
      if (!cancelled) setMemberCount(ids.length);
    });
    const unsubscribe = subscribeGroupMessages(load);
    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [viewingGroup.groupId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: 'end' });
  }, [messages.length]);

  function handleSend() {
    const text = draft.trim();
    if (!text || !userId || !profile) return;
    setDraft('');
    sendGroupMessage(viewingGroup.groupId, userId, profile.name, text);
  }

  async function handleDelete(id: string) {
    setSelectedId(null);
    setMessages((prev) => prev.filter((m) => m.id !== id));
    await deleteGroupMessage(id);
  }

  async function handleLeave() {
    if (!userId) return;
    if (!window.confirm(`Leave ${viewingGroup.name}? You'll need a new invite to rejoin.`)) return;
    await leaveGroup(viewingGroup.groupId, userId);
    showToast('Left the group');
    closeGroup();
  }

  return (
    <div className="dm-panel">
      <div className="group-sub-row">
        <span>{memberCount != null ? `${memberCount} member${memberCount === 1 ? '' : 's'}` : ''}</span>
        <button className="link-btn" onClick={handleLeave}>
          Leave group
        </button>
      </div>
      <div className="dm-messages">
        {messages.length === 0 && (
          <div style={{ padding: '16px 4px', color: 'var(--text-faint)', fontSize: 13, textAlign: 'center' }}>
            No messages yet - say hi to the group.
          </div>
        )}
        {messages.map((m) => {
          const mine = m.sender_id === userId;
          const showDelete = selectedId === m.id;
          return (
            <div key={m.id} className={`dm-row ${mine ? 'mine' : 'theirs'}`}>
              {!mine && <div className="group-sender">{m.sender_name}</div>}
              <div className={`dm-bubble ${mine ? 'mine' : 'theirs'}`} onClick={() => mine && setSelectedId(showDelete ? null : m.id)}>
                {m.text}
              </div>
              {showDelete && (
                <div className="dm-delete-row mine">
                  <button className="btn btn-danger-ghost btn-sm" onClick={() => handleDelete(m.id)}>
                    Delete
                  </button>
                  <button className="link-btn" onClick={() => setSelectedId(null)}>
                    Cancel
                  </button>
                </div>
              )}
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>
      <div className="dm-input-row">
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
