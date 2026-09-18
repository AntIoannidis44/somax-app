import { useEffect, useRef, useState } from 'react';
import { Icon } from '../Icon';
import { useAppStore } from '../../store/useAppStore';
import { useUserId } from '../../lib/useSession';
import { fetchConversation, sendDM, subscribeDMs, type DirectMessage } from '../../lib/social';

export function DMScreen() {
  const viewingDM = useAppStore((s) => s.viewingDM)!;
  const userId = useUserId();
  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [draft, setDraft] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

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

  return (
    <div className="dm-panel">
      <div className="dm-messages">
        {messages.length === 0 && (
          <div style={{ padding: '16px 4px', color: 'var(--text-faint)', fontSize: 13, textAlign: 'center' }}>
            No messages yet - say hi to {viewingDM.name}.
          </div>
        )}
        {messages.map((m) => (
          <div key={m.id} className={`dm-bubble ${m.sender_id === userId ? 'mine' : 'theirs'}`}>
            {m.text}
          </div>
        ))}
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
