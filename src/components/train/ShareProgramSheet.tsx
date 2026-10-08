import { useEffect, useState } from 'react';
import { Clipboard } from '@capacitor/clipboard';
import { Icon } from '../Icon';
import { Modal } from '../layout/Modal';
import { TypeIconBadge } from '../TypeIconBadge';
import { UserAvatar } from '../community/UserAvatar';
import { useAppStore } from '../../store/useAppStore';
import { useUserId } from '../../lib/useSession';
import { fetchFriends, sendDM, type PublicProfile } from '../../lib/social';
import { encodeProgramMessage } from '../../lib/programShare';
import { createShareLink } from '../../lib/shareLinks';
import { shareProgramToFeed, type ProgramToShare } from '../../lib/programPosts';

// Share a program three ways: post it to the feed (shows as a program card
// others can add), send it to a friend (arrives in Messages as a card that
// opens in the app with Add to my programs), or copy a link.
export function ShareProgramSheet({ program, onClose, initialStep = 'menu' }: { program: ProgramToShare; onClose: () => void; initialStep?: 'menu' | 'post' | 'friends' }) {
  const userId = useUserId();
  const myName = useAppStore((s) => s.profile?.name ?? '');
  const showToast = useAppStore((s) => s.showToast);
  const [step, setStep] = useState<'menu' | 'post' | 'friends'>(initialStep);
  const [visibility, setVisibility] = useState<'public' | 'friends'>('public');
  const [caption, setCaption] = useState(`Sharing my ${program.name} program`);
  const [friends, setFriends] = useState<PublicProfile[] | null>(null);
  const [sent, setSent] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (step === 'friends' && userId && friends === null) fetchFriends(userId).then(setFriends);
  }, [step, userId, friends]);

  async function post() {
    if (!userId) return;
    setBusy(true);
    await shareProgramToFeed(userId, myName, program, caption, visibility);
    setBusy(false);
    showToast(visibility === 'public' ? 'Posted to the community feed' : 'Posted for your friends');
    onClose();
  }

  async function send(friend: PublicProfile) {
    if (!userId) return;
    await sendDM(userId, friend.user_id, encodeProgramMessage(program));
    setSent((prev) => new Set(prev).add(friend.user_id));
    showToast(`Sent to ${friend.name.split(' ')[0]}`);
  }

  async function copyLink() {
    if (!userId) return;
    const url = await createShareLink(userId, program);
    if (!url) {
      showToast('Could not create the link');
      return;
    }
    try {
      await Clipboard.write({ string: url });
      showToast('Link copied');
    } catch {
      showToast(url);
    }
  }

  const header = (
    <div className="share-prog">
      <TypeIconBadge category={program.category} size={42} />
      <div style={{ minWidth: 0 }}>
        <div className="t">{program.name}</div>
        <div className="s">
          {program.exercises.length} exercise{program.exercises.length === 1 ? '' : 's'} · {program.duration}
        </div>
      </div>
    </div>
  );

  return (
    <Modal open onClose={onClose} title={step === 'menu' ? 'Share program' : step === 'post' ? 'Post to feed' : 'Send to a friend'}>
      {step !== 'menu' && (
        <button className="link-btn" style={{ margin: '0 0 12px' }} onClick={() => setStep('menu')}>
          <Icon name="chevron" style={{ width: 12, height: 12, transform: 'rotate(180deg)' }} /> Back
        </button>
      )}
      {header}
      {step === 'menu' && (
        <div className="share-opts">
          <button className="sheet-opt" onClick={() => setStep('post')}>
            <span className="share-ic" style={{ background: 'linear-gradient(140deg, var(--hero-1), var(--hero-2))' }}>
              <Icon name="community" />
            </span>
            <div>
              <div className="t">Post to feed</div>
              <div className="s">Shows as a program anyone can add</div>
            </div>
            <Icon name="chevron" className="tick" />
          </button>
          <button className="sheet-opt" onClick={() => setStep('friends')}>
            <span className="share-ic" style={{ background: 'var(--stat-endurance)' }}>
              <Icon name="comment" />
            </span>
            <div>
              <div className="t">Send to a friend</div>
              <div className="s">Arrives in Messages with Add to my programs</div>
            </div>
            <Icon name="chevron" className="tick" />
          </button>
          <button className="sheet-opt" onClick={copyLink}>
            <span className="share-ic" style={{ background: 'var(--stat-recovery)' }}>
              <Icon name="link" />
            </span>
            <div>
              <div className="t">Copy share link</div>
              <div className="s">Opens the program in the Somaxx app</div>
            </div>
          </button>
        </div>
      )}
      {step === 'post' && (
        <>
          <div className="sheet-sub">Who can see it</div>
          <div className="composer-visibility" style={{ marginBottom: 0 }}>
            <button className={`composer-visibility-opt${visibility === 'public' ? ' active' : ''}`} onClick={() => setVisibility('public')}>
              <Icon name="community" style={{ width: 14, height: 14 }} />
              Community
            </button>
            <button className={`composer-visibility-opt${visibility === 'friends' ? ' active' : ''}`} onClick={() => setVisibility('friends')}>
              <Icon name="lock" style={{ width: 14, height: 14 }} />
              Friends
            </button>
          </div>
          <div className="sheet-sub">Caption</div>
          <textarea className="share-caption" rows={3} value={caption} onChange={(e) => setCaption(e.target.value)} />
          <button className="btn btn-primary" style={{ marginTop: 14 }} disabled={busy} onClick={post}>
            {busy ? 'Posting…' : visibility === 'public' ? 'Post to community' : 'Post for friends'}
          </button>
        </>
      )}
      {step === 'friends' && (
        <div className="share-friends">
          {friends === null && <div className="empty-hint">Loading friends…</div>}
          {friends?.length === 0 && <div className="empty-hint">Add some friends first, then you can send them programs.</div>}
          {friends?.map((f) => (
            <div className="friend-row" key={f.user_id}>
              <UserAvatar className="league-avatar" name={f.name} character={f.character} photoUrl={f.photo_url} />
              <div className="league-name" style={{ flex: 1, minWidth: 0 }}>
                {f.name}
              </div>
              {sent.has(f.user_id) ? (
                <span className="donepill">
                  <Icon name="check" /> Sent
                </span>
              ) : (
                <button className="btn btn-sm btn-primary" onClick={() => send(f)}>
                  Send
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </Modal>
  );
}
