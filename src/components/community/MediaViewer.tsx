import { useEffect, useRef, useState } from 'react';
import { Icon } from '../Icon';
import { signedChatImageUrl } from '../../lib/chatImage';

// Fullscreen photo viewer for a chat - opens on the tapped photo, swipes
// (a native horizontal scroll-snap strip, not a hand-rolled gesture) to
// every other photo in the same conversation. Shared by DMScreen and
// GroupChatScreen, same as every other chat message card.
export function MediaViewer({ paths, startIndex, onClose }: { paths: string[]; startIndex: number; onClose: () => void }) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [urls, setUrls] = useState<Record<string, string>>({});
  const [index, setIndex] = useState(startIndex);

  useEffect(() => {
    let cancelled = false;
    paths.forEach((p) => {
      signedChatImageUrl(p).then((url) => {
        if (!cancelled && url) setUrls((prev) => (prev[p] ? prev : { ...prev, [p]: url }));
      });
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paths]);

  // Jump straight to the tapped photo, no animated scroll - this is the
  // viewer opening, not a swipe.
  useEffect(() => {
    const el = scrollerRef.current;
    if (el) el.scrollLeft = startIndex * el.clientWidth;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function onScroll() {
    const el = scrollerRef.current;
    if (!el || !el.clientWidth) return;
    setIndex(Math.round(el.scrollLeft / el.clientWidth));
  }

  return (
    <div className="media-viewer" onClick={onClose}>
      <button className="media-viewer-close" onClick={onClose} aria-label="Close">
        <Icon name="x" />
      </button>
      {paths.length > 1 && (
        <div className="media-viewer-count">
          {index + 1} / {paths.length}
        </div>
      )}
      <div className="media-viewer-scroller" ref={scrollerRef} onScroll={onScroll} onClick={(e) => e.stopPropagation()}>
        {paths.map((p) => (
          <div className="media-viewer-slide" key={p}>
            {urls[p] ? <img src={urls[p]} alt="Shared photo" draggable={false} /> : <div className="chat-image-loading">Loading photo…</div>}
          </div>
        ))}
      </div>
    </div>
  );
}
