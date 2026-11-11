import { useEffect, useState } from 'react';
import { TypeIconBadge } from '../TypeIconBadge';
import { useAppStore } from '../../store/useAppStore';
import { useUserId } from '../../lib/useSession';
import { fetchConversation } from '../../lib/social';
import { fetchGroupMessages } from '../../lib/groups';
import { decodeProgramMessage } from '../../lib/programShare';
import { decodeActivityMessage } from '../../lib/activityShare';
import { decodeRecipeMessage } from '../../lib/recipeShare';
import { imagePathFromMessage, signedChatImageUrl } from '../../lib/chatImage';
import { timeAgo } from '../../lib/format';

type Filter = 'all' | 'media' | 'workouts' | 'meals';

interface MediaItem {
  kind: 'media';
  path: string;
  from: string;
  at: string;
}
interface WorkoutItem {
  kind: 'workouts';
  name: string;
  sub: string;
  from: string;
  at: string;
}
interface MealItem {
  kind: 'meals';
  name: string;
  sub: string;
  from: string;
  at: string;
}
type SharedItem = MediaItem | WorkoutItem | MealItem;

function MediaThumb({ path }: { path: string }) {
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
  return <div className="shared-media-tile">{src && <img src={src} alt="" />}</div>;
}

export function SharedContentScreen() {
  const info = useAppStore((s) => s.viewingSharedContent)!;
  const userId = useUserId();
  const [items, setItems] = useState<SharedItem[]>([]);
  const [filter, setFilter] = useState<Filter>('all');

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const rows =
        info.kind === 'dm'
          ? (await fetchConversation(userId!, info.id)).map((m) => ({ text: m.text, sender: m.sender_id === userId ? 'You' : info.name, at: m.created_at }))
          : (await fetchGroupMessages(info.id)).map((m) => ({ text: m.text, sender: m.sender_id === userId ? 'You' : m.sender_name, at: m.created_at }));
      if (cancelled) return;
      const out: SharedItem[] = [];
      for (const row of rows) {
        const imagePath = imagePathFromMessage(row.text);
        if (imagePath) {
          out.push({ kind: 'media', path: imagePath, from: row.sender, at: row.at });
          continue;
        }
        const recipe = decodeRecipeMessage(row.text);
        if (recipe) {
          out.push({ kind: 'meals', name: recipe.name, sub: `${recipe.kcal} kcal`, from: row.sender, at: row.at });
          continue;
        }
        const program = decodeProgramMessage(row.text);
        if (program) {
          out.push({ kind: 'workouts', name: program.name, sub: `${program.category} · ${program.duration}`, from: row.sender, at: row.at });
          continue;
        }
        const activity = decodeActivityMessage(row.text);
        if (activity) out.push({ kind: 'workouts', name: activity.name, sub: activity.duration, from: row.sender, at: row.at });
      }
      out.reverse(); // most recent first
      setItems(out);
    }
    if (userId) load();
    return () => {
      cancelled = true;
    };
  }, [info.kind, info.id, userId, info.name]);

  const shown = filter === 'all' ? items : items.filter((i) => i.kind === filter);
  const media = shown.filter((i): i is MediaItem => i.kind === 'media');
  const workouts = shown.filter((i): i is WorkoutItem => i.kind === 'workouts');
  const meals = shown.filter((i): i is MealItem => i.kind === 'meals');

  return (
    <div className="composer-screen">
      <div className="composer-screen-body">
        <div className="feed-filters">
          {(['all', 'media', 'workouts', 'meals'] as Filter[]).map((f) => (
            <button key={f} className={`type-chip${filter === f ? ' active' : ''}`} onClick={() => setFilter(f)}>
              {f === 'all' ? 'All' : f[0].toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {items.length === 0 && (
          <div className="card" style={{ padding: '16px 4px', color: 'var(--text-faint)', fontSize: 13 }}>
            Nothing shared in this chat yet.
          </div>
        )}

        {media.length > 0 && (
          <>
            <div className="section-label">Media</div>
            <div className="shared-media-grid">
              {media.map((m, i) => (
                <MediaThumb key={i} path={m.path} />
              ))}
            </div>
          </>
        )}

        {workouts.length > 0 && (
          <>
            <div className="section-label">Workouts</div>
            <div className="card">
              {workouts.map((w, i) => (
                <div className="shared-list-row" key={i}>
                  <TypeIconBadge category={null} fallbackIcon="dumbbell" size={28} />
                  <div className="shared-list-main">
                    <div className="shared-list-name">{w.name}</div>
                    <div className="shared-list-sub">{w.sub}</div>
                  </div>
                  <div className="shared-list-meta">
                    {w.from}
                    <br />
                    {timeAgo(w.at)}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {meals.length > 0 && (
          <>
            <div className="section-label">Meals</div>
            <div className="card">
              {meals.map((m, i) => (
                <div className="shared-list-row" key={i}>
                  <TypeIconBadge category={null} fallbackIcon="nutrition" size={28} />
                  <div className="shared-list-main">
                    <div className="shared-list-name">{m.name}</div>
                    <div className="shared-list-sub">{m.sub}</div>
                  </div>
                  <div className="shared-list-meta">
                    {m.from}
                    <br />
                    {timeAgo(m.at)}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
