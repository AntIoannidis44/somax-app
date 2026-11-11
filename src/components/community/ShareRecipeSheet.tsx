import { useEffect, useState } from 'react';
import { Clipboard } from '@capacitor/clipboard';
import { Icon } from '../Icon';
import { Modal } from '../layout/Modal';
import { UserAvatar } from './UserAvatar';
import { useAppStore } from '../../store/useAppStore';
import { useUserId } from '../../lib/useSession';
import { fetchFriends, sendDM, incrementPostShares, type PublicProfile } from '../../lib/social';
import { encodeRecipeMessage } from '../../lib/recipeShare';
import { shareRecipeToFeed, type RecipeToShare } from '../../lib/recipePosts';
import { uploadRecipeImage } from '../../lib/recipes';
import { createRecipeShareLink } from '../../lib/shareLinks';
import { shareMealToLibrary } from '../../lib/library';
import { ShareToLibraryForm } from '../library/ShareToLibraryForm';

// Share a recipe two ways: post it to the Nutrition feed, or send it to a
// friend (arrives in Messages as a card with Save to my favourites). Mirrors
// ShareProgramSheet's menu/post/friends flow - no "copy link" step, matching
// the two-option design reviewed and approved in the artifact prototype.
export function ShareRecipeSheet({
  recipe,
  onClose,
  initialStep = 'menu',
  sourcePostId,
}: {
  recipe: RecipeToShare;
  onClose: () => void;
  initialStep?: 'menu' | 'post' | 'friends' | 'library';
  sourcePostId?: string;
}) {
  const userId = useUserId();
  const myName = useAppStore((s) => s.profile?.name ?? '');
  const showToast = useAppStore((s) => s.showToast);
  const [step, setStep] = useState<'menu' | 'post' | 'friends' | 'library'>(initialStep);
  const [visibility, setVisibility] = useState<'public' | 'friends'>('public');
  const [caption, setCaption] = useState(`Shared ${recipe.name}`);
  const [friends, setFriends] = useState<PublicProfile[] | null>(null);
  const [sent, setSent] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState(false);
  // Extra photos beyond recipe.imageUrl - mainly for a meal shared straight
  // from the nutrition log, which starts with no photo at all.
  const [extraImages, setExtraImages] = useState<string[]>([]);
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    if (step === 'friends' && userId && friends === null) fetchFriends(userId).then(setFriends);
  }, [step, userId, friends]);

  async function post() {
    if (!userId) return;
    setBusy(true);
    await shareRecipeToFeed(userId, myName, recipe, caption, visibility, extraImages);
    if (sourcePostId) incrementPostShares(sourcePostId);
    setBusy(false);
    showToast(visibility === 'public' ? 'Posted to the Nutrition feed' : 'Posted for your friends');
    onClose();
  }

  async function send(friend: PublicProfile) {
    if (!userId) return;
    await sendDM(userId, friend.user_id, encodeRecipeMessage(recipe));
    if (sourcePostId) incrementPostShares(sourcePostId);
    setSent((prev) => new Set(prev).add(friend.user_id));
    showToast(`Sent to ${friend.name.split(' ')[0]}`);
  }

  async function copyLink() {
    if (!userId) return;
    const url = await createRecipeShareLink(userId, recipe);
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

  async function handleAddPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || !userId) return;
    setUploadingImage(true);
    const url = await uploadRecipeImage(userId, file);
    setUploadingImage(false);
    if (url) setExtraImages((prev) => [...prev, url]);
    else showToast('Could not add that photo');
  }

  const header = (
    <div className="share-prog">
      {recipe.imageUrl ? (
        <img src={recipe.imageUrl} alt="" style={{ width: 42, height: 42, borderRadius: 13, objectFit: 'cover', flexShrink: 0 }} />
      ) : (
        <Icon name="nutrition" style={{ width: 42, height: 42, color: 'var(--accent)' }} />
      )}
      <div style={{ minWidth: 0 }}>
        <div className="t">{recipe.name}</div>
        <div className="s">
          {recipe.servings} serving{recipe.servings === 1 ? '' : 's'} · {recipe.kcal} kcal
        </div>
      </div>
    </div>
  );

  return (
    <Modal open onClose={onClose} title={step === 'menu' ? 'Share recipe' : step === 'post' ? 'Post to feed' : step === 'library' ? 'Add to the Library' : 'Send to a friend'}>
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
              <Icon name="nutrition" />
            </span>
            <div>
              <div className="t">Post to Community</div>
              <div className="s">Shows in the Nutrition feed for friends to like &amp; comment</div>
            </div>
            <Icon name="chevron" className="tick" />
          </button>
          <button className="sheet-opt" onClick={() => setStep('friends')}>
            <span className="share-ic" style={{ background: 'var(--success)' }}>
              <Icon name="comment" />
            </span>
            <div>
              <div className="t">Send to a friend</div>
              <div className="s">Arrives in Messages with the full recipe card</div>
            </div>
            <Icon name="chevron" className="tick" />
          </button>
          <button className="sheet-opt" onClick={() => setStep('library')}>
            <span className="share-ic" style={{ background: 'var(--stat-strength)' }}>
              <Icon name="layers" />
            </span>
            <div>
              <div className="t">Add to the Meal Library</div>
              <div className="s">Anyone can find it by goal, meal and diet</div>
            </div>
            <Icon name="chevron" className="tick" />
          </button>
          <button className="sheet-opt" onClick={copyLink}>
            <span className="share-ic" style={{ background: 'var(--stat-recovery)' }}>
              <Icon name="link" />
            </span>
            <div>
              <div className="t">Copy share link</div>
              <div className="s">Opens the recipe in the Somaxx app</div>
            </div>
          </button>
        </div>
      )}
      {step === 'post' && (
        <>
          <div className="sheet-sub">Photos</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
            {recipe.imageUrl && (
              <img src={recipe.imageUrl} alt="" style={{ width: 64, height: 64, borderRadius: 14, objectFit: 'cover' }} />
            )}
            {extraImages.map((url, i) => (
              <div key={url} style={{ position: 'relative', width: 64, height: 64 }}>
                <img src={url} alt="" style={{ width: 64, height: 64, borderRadius: 14, objectFit: 'cover' }} />
                <button
                  onClick={() => setExtraImages((prev) => prev.filter((_, idx) => idx !== i))}
                  aria-label="Remove photo"
                  style={{
                    position: 'absolute', top: -6, right: -6, width: 20, height: 20, borderRadius: '50%',
                    background: 'var(--surface)', border: '1px solid var(--line)', display: 'grid', placeItems: 'center', padding: 0,
                  }}
                >
                  <Icon name="x" style={{ width: 11, height: 11 }} />
                </button>
              </div>
            ))}
            <label
              style={{
                width: 64, height: 64, borderRadius: 14, border: '1.5px dashed var(--line)', display: 'grid', placeItems: 'center',
                cursor: 'pointer', opacity: uploadingImage ? 0.5 : 1, color: 'var(--text-faint)',
              }}
            >
              <Icon name="plus" style={{ width: 20, height: 20 }} />
              <input type="file" accept="image/*" onChange={handleAddPhoto} disabled={uploadingImage} style={{ display: 'none' }} />
            </label>
          </div>
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
      {step === 'library' && (
        <ShareToLibraryForm
          kind="meal"
          onSubmit={(meta, mealType) =>
            shareMealToLibrary(
              {
                name: recipe.name,
                imageUrl: recipe.imageUrl,
                servings: recipe.servings,
                kcal: recipe.kcal,
                proteinG: recipe.proteinG,
                carbsG: recipe.carbsG,
                fatG: recipe.fatG,
                ingredients: recipe.ingredients,
                steps: recipe.steps,
              },
              mealType,
              meta,
            )
          }
          onDone={onClose}
        />
      )}
      {step === 'friends' && (
        <div className="share-friends">
          {friends === null && <div className="empty-hint">Loading friends…</div>}
          {friends?.length === 0 && <div className="empty-hint">Add some friends first, then you can send them recipes.</div>}
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
