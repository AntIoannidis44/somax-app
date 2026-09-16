import { Icon } from '../Icon';
import { FEED_SEED } from '../../data/feed';
import { useAppStore } from '../../store/useAppStore';
import { initials } from '../../lib/format';

export function CommunityScreen() {
  const cheered = useAppStore((s) => s.cheered);
  const cheerFeedItem = useAppStore((s) => s.cheerFeedItem);

  return (
    <>
      <div className="banner">
        <Icon name="info" />
        <span>Friend requests and DMs ship after the core loop is validated. For now, here’s what your league is up to.</span>
      </div>
      <div className="card">
        {FEED_SEED.map((f, i) => {
          const isCheered = !!cheered[i];
          return (
            <div className="feed-item" key={i}>
              <div className="feed-avatar">{initials(f.who)}</div>
              <div className="feed-body">
                <div className="feed-text">
                  <b>{f.who}</b> <span dangerouslySetInnerHTML={{ __html: f.text }} />
                </div>
                <div className="feed-time">{f.time}</div>
                <button className={`cheer-btn${isCheered ? ' cheered' : ''}`} onClick={() => cheerFeedItem(i)}>
                  <Icon name="heart" /> {isCheered ? 'Cheered' : 'Cheer'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
