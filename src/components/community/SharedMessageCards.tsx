import { useEffect, useState } from 'react';
import { Icon } from '../Icon';
import { TypeIconBadge } from '../TypeIconBadge';
import { useAppStore } from '../../store/useAppStore';
import { saveWorkout } from '../../lib/customWorkouts';
import type { SharedProgram } from '../../lib/programShare';
import type { PostWorkout } from '../../lib/social';
import type { SharedRecipe } from '../../lib/recipeShare';
import { saveUserRecipe } from '../../lib/recipes';
import { expandSets } from '../../lib/workoutSets';
import { signedChatImageUrl } from '../../lib/chatImage';
import { formatTime } from '../../lib/format';
import { RouteMap } from '../train/RouteMap';

// Rich inline message cards shared by DMScreen and GroupChatScreen - a
// program/recipe/activity/photo shared in a group should look identical to
// one shared 1:1, so this is the one place that renders them.

// Time + read-receipt ticks, WhatsApp-style - a single tick once the
// message exists, a second (blue) tick once the recipient has actually
// opened the conversation. `read` is undefined for a group message, since
// group_messages has no read-tracking column (no single "read" state makes
// sense across several recipients) - that just shows the plain sent tick.
export function MessageMeta({ at, mine, read }: { at: string; mine: boolean; read?: boolean }) {
  return (
    <div className={`dm-meta ${mine ? 'mine' : 'theirs'}`}>
      <span className="dm-meta-time">{formatTime(at)}</span>
      {mine && <Icon name={read ? 'checkDouble' : 'check'} className={`dm-tick${read ? ' read' : ''}`} />}
    </div>
  );
}

// A photo in chat. The signed link is fetched when it first shows, and
// swapping the placeholder for the real <img> changes this bubble's height
// after the initial scroll-to-bottom already ran - onLoad re-triggers it so
// a photo loading in doesn't leave the view stranded partway up the chat.
export function ChatImage({ path, onLoad }: { path: string; onLoad?: () => void }) {
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
  return <img className="chat-image" src={src} alt="Shared photo" onLoad={onLoad} />;
}

// A program sent in chat: shows the program inline, with Open to preview its
// sets and (for programs from someone else) Add to my programs.
export function ProgramMessage({ program, userId }: { program: SharedProgram; userId: string | null }) {
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

// A recipe sent in chat: shows the recipe inline, with Open to reveal
// ingredients/steps and Save to my favourites for a recipe from someone
// else. Mirrors ProgramMessage's layout/actions exactly.
export function RecipeMessage({ recipe, userId }: { recipe: SharedRecipe; userId: string | null }) {
  const showToast = useAppStore((s) => s.showToast);
  const [open, setOpen] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  async function addToMine() {
    if (!userId) return;
    setSaving(true);
    const result = await saveUserRecipe(userId, {
      name: recipe.name,
      imageUrl: recipe.imageUrl,
      servings: recipe.servings,
      kcal: recipe.kcal,
      proteinG: recipe.proteinG,
      carbsG: recipe.carbsG,
      fatG: recipe.fatG,
      ingredients: recipe.ingredients,
      steps: recipe.steps,
      sourceLabel: recipe.sourceLabel,
      isFavorite: true,
    });
    setSaving(false);
    if (result) {
      setSaved(true);
      showToast('Saved to My Favourites');
    } else {
      showToast('Could not save this recipe');
    }
  }

  return (
    <div className="program-msg">
      <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
        {recipe.imageUrl ? (
          <img src={recipe.imageUrl} alt="" style={{ width: 24, height: 24, borderRadius: 7, objectFit: 'cover' }} />
        ) : (
          <TypeIconBadge category={null} fallbackIcon="nutrition" size={24} />
        )}
        <div>
          <div className="program-msg-title">{recipe.name}</div>
          <div className="program-msg-sub">
            {recipe.servings} serving{recipe.servings === 1 ? '' : 's'} · {recipe.kcal} kcal
          </div>
        </div>
      </div>
      {open && (
        <div className="program-msg-body">
          <div className="fp-ex">
            {recipe.ingredients.map((ing, i) => (
              <div key={i}>
                <span>{ing.name}</span>
                <span>{ing.amount}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      <div className="program-msg-actions">
        <button className="btn btn-ghost btn-sm" onClick={() => setOpen((o) => !o)}>
          {open ? 'Close' : 'Open'}
        </button>
        <button className="btn btn-primary btn-sm" disabled={saved || saving} onClick={addToMine}>
          {saved ? 'Saved' : 'Save to my favourites'}
        </button>
      </div>
    </div>
  );
}

// A completed session shared in chat - the real card (route map, distance,
// duration), not a plain-text summary. Tapping it opens the exact same
// full-screen session detail a feed post's card does.
export function ActivityMessage({ activity, userId }: { activity: PostWorkout; userId: string | null }) {
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
