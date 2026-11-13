import { Fragment, useEffect, useMemo, useRef, useState } from 'react';
import { Icon } from '../Icon';
import { useAppStore } from '../../store/useAppStore';
import { useUserId } from '../../lib/useSession';
import { clearConversation, deleteDM, fetchConversation, markConversationRead, sendDM, subscribeDMs, type DirectMessage } from '../../lib/social';
import { decodeProgramMessage } from '../../lib/programShare';
import { decodeActivityMessage } from '../../lib/activityShare';
import { decodeRecipeMessage } from '../../lib/recipeShare';
import { encodeImageMessage, imagePathFromMessage, uploadChatImage } from '../../lib/chatImage';
import { setBadgeCount } from '../../lib/badge';
import { formatDateLabel } from '../../lib/format';
import { ChatImage, ProgramMessage, RecipeMessage, ActivityMessage, MessageMeta } from './SharedMessageCards';
import { MediaViewer } from './MediaViewer';
import {
  WallpaperPicker,
  getWallpaper,
  getWallpaperPhoto,
  resizeWallpaperPhoto,
  setWallpaper,
  setWallpaperPhoto,
  useSwipeToDismissKeyboard,
  useVoiceDictation,
  type WallpaperKey,
} from './ChatChrome';

export function DMScreen() {
  const viewingDM = useAppStore((s) => s.viewingDM)!;
  const userId = useUserId();
  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [draft, setDraft] = useState('');
  const [inputFocused, setInputFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const [uploading, setUploading] = useState(false);
  // Message whose delete option is showing (tap a bubble to reveal it).
  const [selectedId, setSelectedId] = useState<string | null>(null);
  // Every photo in this conversation, in message order - lets the viewer
  // swipe through all of them, not just the one that was tapped.
  const imagePaths = useMemo(() => messages.map((m) => imagePathFromMessage(m.text)).filter((p): p is string => !!p), [messages]);
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);
  const showToast = useAppStore((s) => s.showToast);
  const clearUnreadFrom = useAppStore((s) => s.clearUnreadFrom);
  // The wallpaper button lives in the top device header now, not a second
  // header row in this screen - wallpaperPickerOpen is global so it can
  // reach this modal from there.
  const wallpaperPickerOpen = useAppStore((s) => s.wallpaperPickerOpen);
  const closeWallpaperPicker = useAppStore((s) => s.closeWallpaperPicker);

  const wallpaperKey = `somaxx-wallpaper:dm:${viewingDM.userId}`;
  const [wallpaper, setWallpaperState] = useState<WallpaperKey>(() => getWallpaper(wallpaperKey));
  const [wallpaperPhoto, setWallpaperPhotoState] = useState<string | null>(() => getWallpaperPhoto(wallpaperKey));
  const swipeToDismiss = useSwipeToDismissKeyboard();
  const { listening, toggle: toggleDictation, available: voiceAvailable } = useVoiceDictation(draft, setDraft);
  function pickWallpaper(key: WallpaperKey) {
    setWallpaperState(key);
    setWallpaper(wallpaperKey, key);
  }
  async function pickWallpaperPhoto(file: File) {
    const dataUrl = await resizeWallpaperPhoto(file);
    setWallpaperPhoto(wallpaperKey, dataUrl);
    setWallpaperPhotoState(dataUrl);
    pickWallpaper('photo');
  }

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

  // Opening this conversation is what "reading" it means - clears both the
  // per-friend badge in Community and this sender's share of the app icon
  // badge, without waiting for a server round trip to reflect it locally.
  useEffect(() => {
    if (!userId) return;
    markConversationRead(userId, viewingDM.userId);
    clearUnreadFrom(viewingDM.userId);
    const remaining = Object.entries(useAppStore.getState().unreadDM)
      .filter(([id]) => id !== viewingDM.userId)
      .reduce((sum, [, n]) => sum + n, 0);
    setBadgeCount(remaining);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, viewingDM.userId]);

  function scrollToBottom() {
    bottomRef.current?.scrollIntoView({ block: 'end' });
  }

  useEffect(() => {
    scrollToBottom();
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
      <div
        className="dm-messages"
        data-wallpaper={wallpaper}
        style={
          wallpaper === 'photo' && wallpaperPhoto
            ? { backgroundImage: `linear-gradient(var(--chat-wallpaper-scrim), var(--chat-wallpaper-scrim)), url(${wallpaperPhoto})`, backgroundSize: 'cover', backgroundPosition: 'center' }
            : undefined
        }
        {...swipeToDismiss}
      >
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
        {messages.map((m, i) => {
          const mine = m.sender_id === userId;
          const showDelete = selectedId === m.id;
          const dateLabel = formatDateLabel(m.created_at);
          const dateSep =
            (i === 0 || formatDateLabel(messages[i - 1].created_at) !== dateLabel) ? <div className="date-sep">{dateLabel}</div> : null;
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
              <Fragment key={m.id}>
                {dateSep}
                <div className={`dm-row ${mine ? 'mine' : 'theirs'}`}>
                  <div className={`dm-bubble image ${mine ? 'mine' : 'theirs'}`} onClick={() => setSelectedId(showDelete ? null : m.id)}>
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        setViewerIndex(imagePaths.indexOf(imagePath));
                      }}
                    >
                      <ChatImage path={imagePath} onLoad={scrollToBottom} />
                    </div>
                    <MessageMeta at={m.created_at} mine={mine} read={mine ? m.read : undefined} />
                  </div>
                  {deleteRow}
                </div>
              </Fragment>
            );
          }
          const program = decodeProgramMessage(m.text);
          if (program) {
            return (
              <Fragment key={m.id}>
                {dateSep}
                <div className={`dm-row ${mine ? 'mine' : 'theirs'}`}>
                  <div className={`dm-bubble program ${mine ? 'mine' : 'theirs'}`}>
                    <ProgramMessage program={program} userId={userId} />
                    <MessageMeta at={m.created_at} mine={mine} read={mine ? m.read : undefined} />
                  </div>
                  {deleteRow}
                </div>
              </Fragment>
            );
          }
          const recipe = decodeRecipeMessage(m.text);
          if (recipe) {
            return (
              <Fragment key={m.id}>
                {dateSep}
                <div className={`dm-row ${mine ? 'mine' : 'theirs'}`}>
                  <div className={`dm-bubble program ${mine ? 'mine' : 'theirs'}`}>
                    <RecipeMessage recipe={recipe} userId={userId} />
                    <MessageMeta at={m.created_at} mine={mine} read={mine ? m.read : undefined} />
                  </div>
                  {deleteRow}
                </div>
              </Fragment>
            );
          }
          const activity = decodeActivityMessage(m.text);
          if (activity) {
            return (
              <Fragment key={m.id}>
                {dateSep}
                <div className={`dm-row ${mine ? 'mine' : 'theirs'}`}>
                  <div className={`dm-bubble program ${mine ? 'mine' : 'theirs'}`}>
                    <ActivityMessage activity={activity} userId={userId} />
                    <MessageMeta at={m.created_at} mine={mine} read={mine ? m.read : undefined} />
                  </div>
                  {deleteRow}
                </div>
              </Fragment>
            );
          }
          return (
            <Fragment key={m.id}>
              {dateSep}
              <div className={`dm-row ${mine ? 'mine' : 'theirs'}`}>
                <div className={`dm-bubble ${mine ? 'mine' : 'theirs'}`} onClick={() => setSelectedId(showDelete ? null : m.id)}>
                  <span className="dm-text">{m.text}</span>
                  <MessageMeta at={m.created_at} mine={mine} read={mine ? m.read : undefined} />
                </div>
                {deleteRow}
              </div>
            </Fragment>
          );
        })}
        <div ref={bottomRef} />
      </div>
      <div className="dm-input-row">
        <label className={`dm-attach${uploading ? ' busy' : ''}`} aria-label="Send a photo">
          <Icon name="plus" />
          <input type="file" accept="image/*" onChange={handlePhoto} disabled={uploading} style={{ display: 'none' }} />
        </label>
        <div className="dm-input-pill">
          <input
            ref={inputRef}
            type="text"
            placeholder="Message"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            onFocus={() => setInputFocused(true)}
            onBlur={() => setInputFocused(false)}
          />
        </div>
        {inputFocused && (
          <button className="dm-kb-dismiss" onClick={() => inputRef.current?.blur()} aria-label="Minimise keyboard">
            <Icon name="chevron" />
          </button>
        )}
        {draft.trim() || !voiceAvailable ? (
          <button className="dm-send-circle" onClick={handleSend} disabled={!draft.trim()} aria-label="Send">
            <Icon name="chevron" />
          </button>
        ) : (
          <button
            className={`dm-mic-circle${listening ? ' listening' : ''}`}
            onClick={toggleDictation}
            aria-label={listening ? 'Stop dictation' : 'Dictate message'}
          >
            <Icon name="mic" />
          </button>
        )}
      </div>
      <WallpaperPicker
        open={wallpaperPickerOpen}
        value={wallpaper}
        photoDataUrl={wallpaperPhoto}
        onClose={closeWallpaperPicker}
        onPick={pickWallpaper}
        onPickPhoto={pickWallpaperPhoto}
      />
      {viewerIndex !== null && <MediaViewer paths={imagePaths} startIndex={viewerIndex} onClose={() => setViewerIndex(null)} />}
    </div>
  );
}
