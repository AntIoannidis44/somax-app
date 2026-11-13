import { Fragment, useEffect, useMemo, useRef, useState } from 'react';
import { Icon } from '../Icon';
import { useAppStore } from '../../store/useAppStore';
import { useUserId } from '../../lib/useSession';
import { formatDateLabel } from '../../lib/format';
import {
  deleteGroupMessage,
  fetchGroup,
  fetchGroupMessages,
  sendGroupMessage,
  subscribeGroupMessages,
  type GroupMessage,
} from '../../lib/groups';
import { decodeProgramMessage } from '../../lib/programShare';
import { decodeActivityMessage } from '../../lib/activityShare';
import { decodeRecipeMessage } from '../../lib/recipeShare';
import { encodeImageMessage, imagePathFromMessage, uploadChatImage } from '../../lib/chatImage';
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

export function GroupChatScreen() {
  const viewingGroup = useAppStore((s) => s.viewingGroup)!;
  const openGroup = useAppStore((s) => s.openGroup);
  const profile = useAppStore((s) => s.profile);
  const showToast = useAppStore((s) => s.showToast);
  const userId = useUserId();
  const [messages, setMessages] = useState<GroupMessage[]>([]);
  const [draft, setDraft] = useState('');
  const [uploading, setUploading] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  // Every photo in this conversation, in message order - lets the viewer
  // swipe through all of them, not just the one that was tapped.
  const imagePaths = useMemo(() => messages.map((m) => imagePathFromMessage(m.text)).filter((p): p is string => !!p), [messages]);
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);
  const [inputFocused, setInputFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  // The wallpaper button lives in the top device header now, not a second
  // header row in this screen - wallpaperPickerOpen is global so it can
  // reach this modal from there.
  const wallpaperPickerOpen = useAppStore((s) => s.wallpaperPickerOpen);
  const closeWallpaperPicker = useAppStore((s) => s.closeWallpaperPicker);

  const wallpaperKey = `somaxx-wallpaper:group:${viewingGroup.groupId}`;
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
    let cancelled = false;
    function load() {
      fetchGroupMessages(viewingGroup.groupId).then((rows) => {
        if (!cancelled) setMessages(rows);
      });
    }
    load();
    // Fetched fresh (not from viewingGroup) so a photo/name change made from
    // the Chat Info screen shows immediately in the device header, which
    // only reads viewingGroup's own photoUrl - refreshing it here is what
    // makes that header stay in sync regardless of how this screen was
    // navigated to.
    fetchGroup(viewingGroup.groupId).then((g) => {
      if (!cancelled && g) openGroup(viewingGroup.groupId, g.name, g.photo_url);
    });
    const unsubscribe = subscribeGroupMessages(load);
    return () => {
      cancelled = true;
      unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewingGroup.groupId]);

  function scrollToBottom() {
    bottomRef.current?.scrollIntoView({ block: 'end' });
  }

  useEffect(() => {
    scrollToBottom();
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

  async function handlePhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || !userId || !profile) return;
    setUploading(true);
    try {
      const path = await uploadChatImage(userId, file);
      await sendGroupMessage(viewingGroup.groupId, userId, profile.name, encodeImageMessage(path));
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
            No messages yet - say hi to the group.
          </div>
        )}
        {messages.map((m, i) => {
          const mine = m.sender_id === userId;
          const showDelete = selectedId === m.id;
          const senderLine = !mine && <div className="group-sender">{m.sender_name}</div>;
          const dateLabel = formatDateLabel(m.created_at);
          const dateSep =
            (i === 0 || formatDateLabel(messages[i - 1].created_at) !== dateLabel) ? <div className="date-sep">{dateLabel}</div> : null;
          const deleteRow = showDelete && (
            <div className="dm-delete-row mine">
              <button className="btn btn-danger-ghost btn-sm" onClick={() => handleDelete(m.id)}>
                Delete
              </button>
              <button className="link-btn" onClick={() => setSelectedId(null)}>
                Cancel
              </button>
            </div>
          );

          const imagePath = imagePathFromMessage(m.text);
          if (imagePath) {
            return (
              <Fragment key={m.id}>
                {dateSep}
                <div className={`dm-row ${mine ? 'mine' : 'theirs'}`}>
                  {senderLine}
                  <div className={`dm-bubble image ${mine ? 'mine' : 'theirs'}`} onClick={() => mine && setSelectedId(showDelete ? null : m.id)}>
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        setViewerIndex(imagePaths.indexOf(imagePath));
                      }}
                    >
                      <ChatImage path={imagePath} onLoad={scrollToBottom} />
                    </div>
                    <MessageMeta at={m.created_at} mine={mine} />
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
                  {senderLine}
                  <div className={`dm-bubble program ${mine ? 'mine' : 'theirs'}`}>
                    <ProgramMessage program={program} userId={userId} />
                    <MessageMeta at={m.created_at} mine={mine} />
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
                  {senderLine}
                  <div className={`dm-bubble program ${mine ? 'mine' : 'theirs'}`}>
                    <RecipeMessage recipe={recipe} userId={userId} />
                    <MessageMeta at={m.created_at} mine={mine} />
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
                  {senderLine}
                  <div className={`dm-bubble program ${mine ? 'mine' : 'theirs'}`}>
                    <ActivityMessage activity={activity} userId={userId} />
                    <MessageMeta at={m.created_at} mine={mine} />
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
                {senderLine}
                <div className={`dm-bubble ${mine ? 'mine' : 'theirs'}`} onClick={() => mine && setSelectedId(showDelete ? null : m.id)}>
                  <span className="dm-text">{m.text}</span>
                  <MessageMeta at={m.created_at} mine={mine} />
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
