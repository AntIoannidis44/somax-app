import { useState } from 'react';
import { Icon } from '../Icon';
import { useAppStore } from '../../store/useAppStore';
import { DIETS, GOALS, LEVELS, MEAL_TYPES, SPORTS, type LibraryLevel, type LibraryShareMeta } from '../../lib/library';

// The "Add to the Library" step inside ShareProgramSheet / ShareRecipeSheet:
// tag it (level, sport or meal type, goals) and choose whether it's credited
// to you by name or shared anonymously.
export function ShareToLibraryForm({
  kind,
  onSubmit,
  onDone,
}: {
  kind: 'program' | 'meal';
  // mealType is only passed for meals.
  onSubmit: (meta: LibraryShareMeta, mealType: string) => Promise<boolean>;
  onDone: () => void;
}) {
  const profileName = useAppStore((s) => s.profile?.name ?? '');
  const showToast = useAppStore((s) => s.showToast);
  const [level, setLevel] = useState<LibraryLevel>('beginner');
  const [sport, setSport] = useState(kind === 'program' ? 'strength-training' : '');
  const [mealType, setMealType] = useState('dinner');
  const [goals, setGoals] = useState<string[]>([]);
  const [diets, setDiets] = useState<string[]>([]);
  const [description, setDescription] = useState('');
  const [daysPerWeek, setDaysPerWeek] = useState<number | null>(null);
  const [whoItsFor, setWhoItsFor] = useState('');
  const [anonymous, setAnonymous] = useState(false);
  const [creditName, setCreditName] = useState(profileName);
  const [busy, setBusy] = useState(false);

  function toggle(list: string[], id: string, set: (v: string[]) => void) {
    set(list.includes(id) ? list.filter((x) => x !== id) : [...list, id]);
  }

  async function submit() {
    if (goals.length === 0) {
      showToast('Pick at least one goal');
      return;
    }
    setBusy(true);
    const ok = await onSubmit(
      {
        level,
        sport: kind === 'program' ? sport : null,
        goals,
        tags: kind === 'meal' ? diets : [],
        description,
        daysPerWeek: kind === 'program' ? daysPerWeek : null,
        whoItsFor,
        creditName: anonymous ? null : creditName.trim() || profileName || null,
      },
      mealType,
    );
    setBusy(false);
    if (ok) {
      showToast(anonymous ? 'Added to the Library anonymously' : 'Added to the Library');
      onDone();
    } else showToast('Could not add it to the Library');
  }

  const chip = (active: boolean) => `type-chip sm${active ? ' active' : ''}`;

  // Own wrapper: .modal-sheet is a height-capped flex column, and loose
  // children get squashed flat instead of scrolling.
  return (
    <div className="lib-share-form">
      <div className="sheet-sub">Level</div>
      <div className="feed-filters lib-chips" style={{ margin: '0 0 4px', padding: '2px 0', flexWrap: 'wrap' }}>
        {LEVELS.map((l) => (
          <button key={l.id} className={chip(level === l.id)} onClick={() => setLevel(l.id)}>
            {l.label}
          </button>
        ))}
      </div>
      <div className="sheet-sub">{kind === 'program' ? 'Sport' : 'Meal'}</div>
      <div className="feed-filters lib-chips" style={{ margin: '0 0 4px', padding: '2px 0', flexWrap: 'wrap' }}>
        {(kind === 'program' ? SPORTS : MEAL_TYPES).map((s) => (
          <button
            key={s.id}
            className={chip(kind === 'program' ? sport === s.id : mealType === s.id)}
            onClick={() => (kind === 'program' ? setSport(s.id) : setMealType(s.id))}
          >
            {s.label}
          </button>
        ))}
      </div>
      <div className="sheet-sub">Goals</div>
      <div className="feed-filters lib-chips" style={{ margin: '0 0 4px', padding: '2px 0', flexWrap: 'wrap' }}>
        {GOALS.map((g) => (
          <button key={g.id} className={chip(goals.includes(g.id))} onClick={() => toggle(goals, g.id, setGoals)}>
            {g.label}
          </button>
        ))}
      </div>
      {kind === 'meal' && (
        <>
          <div className="sheet-sub">Diet</div>
          <div className="feed-filters lib-chips" style={{ margin: '0 0 4px', padding: '2px 0', flexWrap: 'wrap' }}>
            {DIETS.map((d) => (
              <button key={d.id} className={chip(diets.includes(d.id))} onClick={() => toggle(diets, d.id, setDiets)}>
                {d.label}
              </button>
            ))}
          </div>
        </>
      )}
      {kind === 'program' && (
        <>
          <div className="sheet-sub">How many days a week do you run it?</div>
          <div className="feed-filters lib-chips" style={{ margin: '0 0 4px', padding: '2px 0', flexWrap: 'wrap' }}>
            {[1, 2, 3, 4, 5, 6].map((d) => (
              <button key={d} className={chip(daysPerWeek === d)} onClick={() => setDaysPerWeek(daysPerWeek === d ? null : d)}>
                {d}x
              </button>
            ))}
          </div>
        </>
      )}
      <div className="sheet-sub">Who it's for (optional)</div>
      <textarea
        className="share-caption"
        rows={2}
        value={whoItsFor}
        placeholder={kind === 'program' ? 'e.g. Intermediate lifters with a busy week who can get to the gym 2-3 times' : 'e.g. Quick high-protein lunch for meal prep'}
        onChange={(e) => setWhoItsFor(e.target.value)}
      />
      <div className="sheet-sub">Description (optional)</div>
      <textarea
        className="share-caption"
        rows={2}
        value={description}
        placeholder={kind === 'program' ? 'How to run it, progression, tips…' : 'Why you love it, tips…'}
        onChange={(e) => setDescription(e.target.value)}
      />
      <div className="sheet-sub">Shared by</div>
      <div className="composer-visibility" style={{ marginBottom: 0 }}>
        <button className={`composer-visibility-opt${!anonymous ? ' active' : ''}`} onClick={() => setAnonymous(false)}>
          <Icon name="profile" style={{ width: 14, height: 14 }} />
          My name
        </button>
        <button className={`composer-visibility-opt${anonymous ? ' active' : ''}`} onClick={() => setAnonymous(true)}>
          <Icon name="lock" style={{ width: 14, height: 14 }} />
          Anonymous
        </button>
      </div>
      {!anonymous && (
        <input className="lib-name-input" value={creditName} onChange={(e) => setCreditName(e.target.value)} placeholder="Name to show" aria-label="Name to show" />
      )}
      <div className="lib-card-credit" style={{ marginTop: 6 }}>
        Shows as: {anonymous ? 'Shared anonymously' : `Shared by ${creditName.trim() || profileName}`}
      </div>
      <button className="btn btn-primary" style={{ marginTop: 14 }} disabled={busy} onClick={submit}>
        {busy ? 'Adding…' : 'Add to the Library'}
      </button>
    </div>
  );
}
