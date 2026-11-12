import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { Icon } from '../Icon';
import { TypeIconBadge } from '../TypeIconBadge';
import { useAppStore } from '../../store/useAppStore';
import { useUserId } from '../../lib/useSession';
import { exerciseMeta } from '../../data/workouts';
import { saveWorkout } from '../../lib/customWorkouts';
import { saveUserRecipe } from '../../lib/recipes';
import type { IconName } from '../../data/icons';
import { PlansTab } from './PlansTab';
import { rankForYou } from '../../lib/plans/weekBuilder';
import {
  DAYS_FILTERS,
  LIFESTYLES,
  matchesDays,
  DIETS,
  GOALS,
  LEVELS,
  MEAL_TYPES,
  SPORTS,
  creditLine,
  labelFor,
  loadCurated,
  loadRemote,
  mergeLibrary,
  myLibraryItemIds,
  removeMyLibraryItem,
  fetchSaveCounts,
  requiredAttribution,
  usesYards,
  recordLibrarySave,
  type LibraryItem,
  type LibraryKind,
  type LibraryMeal,
  type LibraryProgram,
  type LibrarySource,
} from '../../lib/library';

type GroupBy = 'popular' | 'level' | 'sport' | 'goal';

const GROUP_PREVIEW = 8;
const SHOW_ALL_UNDER = 20;
type SourceFilter = 'all' | LibrarySource;

const SOURCE_FILTERS: { id: SourceFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'somax', label: 'By Somax' },
  { id: 'community', label: 'Community' },
  { id: 'credited', label: 'Credited' },
];

function Chips({ options, value, onChange }: { options: { id: string; label: string }[]; value: string; onChange: (id: string) => void }) {
  return (
    <div className="feed-filters lib-chips">
      <button className={`type-chip${value === 'all' ? ' active' : ''}`} onClick={() => onChange('all')}>
        All
      </button>
      {options.map((o) => (
        <button key={o.id} className={`type-chip${value === o.id ? ' active' : ''}`} onClick={() => onChange(o.id)}>
          {o.label}
        </button>
      ))}
    </div>
  );
}

// Always-visible scrolling sport (or meal-type) row - same look as the
// community feed's sport filter and the program editor's category picker.
function SportWheel({ options, value, onChange, allLabel }: { options: { id: string; label: string; icon: IconName; colorVar: string }[]; value: string; onChange: (id: string) => void; allLabel: string }) {
  return (
    <div className="feed-filters lib-chips">
      <button className={`type-chip${value === 'all' ? ' active' : ''}`} onClick={() => onChange('all')}>
        {allLabel}
      </button>
      {options.map((o) => (
        <button key={o.id} className={`type-chip${value === o.id ? ' active' : ''}`} onClick={() => onChange(o.id)}>
          <Icon name={o.icon} style={{ width: 14, height: 14, color: value === o.id ? undefined : `var(${o.colorVar})` }} />
          {o.label}
        </button>
      ))}
    </div>
  );
}

const LEVEL_WHEEL: { id: string; label: string; icon: IconName; colorVar: string }[] = [
  { id: 'beginner', label: 'Beginner', icon: 'steps', colorVar: '--stat-recovery' },
  { id: 'intermediate', label: 'Intermediate', icon: 'zap', colorVar: '--stat-endurance' },
  { id: 'advanced', label: 'Advanced', icon: 'flame', colorVar: '--stat-strength' },
];

const GOAL_ICONS: Record<string, { icon: IconName; colorVar: string }> = {
  strength: { icon: 'dumbbell', colorVar: '--stat-strength' },
  muscle: { icon: 'zap', colorVar: '--stat-strength' },
  'fat-loss': { icon: 'flame', colorVar: '--stat-vitality' },
  endurance: { icon: 'heart', colorVar: '--stat-endurance' },
  mobility: { icon: 'pilates', colorVar: '--stat-recovery' },
  'general-fitness': { icon: 'fitness', colorVar: '--stat-agility' },
  'sport-performance': { icon: 'trophy', colorVar: '--stat-discipline' },
};
const GOAL_WHEEL = GOALS.map((g) => ({ ...g, ...(GOAL_ICONS[g.id] ?? { icon: 'zap' as IconName, colorVar: '--text-faint' }) }));

function LevelPill({ level }: { level: string }) {
  return <span className={`lib-level lib-level-${level}`}>{labelFor(LEVELS, level)}</span>;
}

function SavesBadge({ count }: { count: number }) {
  if (!count) return null;
  return (
    <span className="lib-saves" aria-label={`${count} ${count === 1 ? 'person has' : 'people have'} saved this`}>
      <Icon name="community" />
      {count >= 1000 ? `${(count / 1000).toFixed(1).replace(/\.0$/, '')}k` : count}
    </span>
  );
}

function ItemCard({ item, saves, onOpen, fit }: { item: LibraryItem; saves: number; onOpen: () => void; fit?: number }) {
  const meta =
    item.kind === 'program'
      ? [item.content.daysPerWeek ? `${item.content.daysPerWeek}x/week` : null, item.duration, `${item.content.exercises.length} exercises`, item.content.series && item.content.day ? `Day ${item.content.day}${item.content.daysInSeries ? ` of ${item.content.daysInSeries}` : ''}` : null]
      : [labelFor(MEAL_TYPES, item.category), `${item.content.kcal} kcal`, `${item.content.proteinG}g protein`];
  return (
    <button type="button" className="lib-card" onClick={onOpen}>
      {item.kind === 'program' ? (
        <TypeIconBadge category={item.category} size={40} />
      ) : (
        <div className="lib-meal-badge">
          <Icon name="nutrition" />
        </div>
      )}
      <div className="lib-card-main">
        <div className="lib-card-top">
          <div className="lib-card-name">{item.name}</div>
          {fit !== undefined && <span className="lib-fit">{fit}%</span>}
          <SavesBadge count={saves} />
        </div>
        <div className="lib-card-credit">{creditLine(item)}</div>
        <div className="lib-card-meta">
          <LevelPill level={item.level} />
          {meta.filter(Boolean).map((m, i) => (
            <span key={i}>{m}</span>
          ))}
        </div>
      </div>
      <Icon name="chevron" className="lib-card-chev" />
    </button>
  );
}

function ProgramDetail({ item, mine, saves, onSaved, onClose, onRemoved, pickFor }: { item: LibraryProgram; mine: boolean; saves: number; onSaved: () => void; onClose: () => void; onRemoved: () => void; pickFor?: { label: string; onPick: (program: LibraryProgram) => void } }) {
  const userId = useUserId();
  const showToast = useAppStore((s) => s.showToast);
  const [busy, setBusy] = useState(false);

  async function add() {
    if (!userId) return;
    setBusy(true);
    const id = await saveWorkout(userId, { name: item.name, duration: item.duration ?? '', exercises: item.content.exercises, category: item.category });
    if (id && (await recordLibrarySave(item.id, 'program'))) onSaved();
    setBusy(false);
    showToast(id ? 'Added to your programs' : 'Could not add this program');
    if (id) onClose();
  }

  async function remove() {
    if (!window.confirm('Remove this program from the Library? Anyone who already added it keeps their copy.')) return;
    if (await removeMyLibraryItem(item.id)) {
      showToast('Removed from the Library');
      onRemoved();
    } else showToast('Could not remove it');
  }

  return (
    <DetailShell title="Program" onClose={onClose}>
      <div className="lib-detail-head">
        <TypeIconBadge category={item.category} size={52} />
        <div style={{ minWidth: 0 }}>
          <h1>{item.name}</h1>
          <div className="lib-card-credit">{creditLine(item)}</div>
          {saves > 0 && <div className="lib-saved-by"><Icon name="community" /> Saved by {saves} {saves === 1 ? 'person' : 'people'}</div>}
        </div>
      </div>
      <DetailTags item={item} />
      {item.description && <p className="lib-desc">{item.description}</p>}
      {item.content.whoItsFor && (
        <div className="lib-know">
          <div className="lib-know-h"><Icon name="profile" /> Who it's for</div>
          <p>{item.content.whoItsFor}</p>
          {item.content.lifestyle?.length ? (
            <div className="lib-tags" style={{ margin: '8px 0 0' }}>
              {item.content.lifestyle.map((l) => <span key={l}>{labelFor(LIFESTYLES, l)}</span>)}
            </div>
          ) : null}
        </div>
      )}
      {item.content.howToRun?.length ? (
        <div className="lib-know">
          <div className="lib-know-h"><Icon name="calendar" /> How to run it</div>
          <ul>{item.content.howToRun.map((h, i) => <li key={i}>{h}</li>)}</ul>
        </div>
      ) : null}
      {item.source_url && (
        <a className="lib-source" href={item.source_url} target="_blank" rel="noreferrer">
          <Icon name="link" /> Original source
        </a>
      )}
      {usesYards(item) && (
        <div className="lib-attrib">Distances are in yards, as published (1 yd ≈ 0.91 m). In a 25 m pool, swim the same number of lengths.</div>
      )}
      {requiredAttribution(item) && <div className="lib-attrib">{requiredAttribution(item)}</div>}
      <div className="recipe-stat-row">
        <div className="recipe-stat"><b>{item.content.exercises.length}</b><span>exercises</span></div>
        <div className="recipe-stat"><b>{item.duration ?? '-'}</b><span>time</span></div>
        {item.content.daysPerWeek ? <div className="recipe-stat"><b>{item.content.daysPerWeek}x</b><span>per week</span></div> : null}
      </div>
      <div className="section-label">Exercises</div>
      <div className="card">
        {item.content.exercises.map((ex, i) => {
          const prev = item.content.exercises[i - 1];
          const next = item.content.exercises[i + 1];
          const inGroup = !!ex.group && (prev?.group === ex.group || next?.group === ex.group);
          return (
            <div className={`lib-ex-row${inGroup ? ' grouped' : ''}`} key={i}>
              {inGroup && prev?.group !== ex.group && <div className="lib-superset">Superset {ex.group}</div>}
              <div className="lib-ex-name">{ex.name}</div>
              <div className="lib-ex-meta">
                {ex.distance || !ex.reps ? exerciseMeta(ex) : `${ex.sets} × ${ex.reps}${/^\d+(-\d+)?$/.test(ex.reps) ? ' reps' : ''}`}
                {ex.weight ? ` · ${ex.weight}` : ''}
              </div>
            </div>
          );
        })}
      </div>
      {pickFor && (
        <button className="btn btn-primary" onClick={() => pickFor.onPick(item)}>
          <Icon name="calendar" style={{ width: 15, height: 15 }} /> Use for {pickFor.label}
        </button>
      )}
      <button className={`btn ${pickFor ? 'btn-ghost' : 'btn-primary'}`} disabled={busy} onClick={add}>
        <Icon name="plus" style={{ width: 15, height: 15 }} /> {busy ? 'Adding…' : 'Add to my programs'}
      </button>
      {mine && (
        <button className="btn btn-ghost" style={{ marginTop: 8, color: 'var(--danger)' }} onClick={remove}>
          <Icon name="trash" style={{ width: 15, height: 15 }} /> Remove from Library
        </button>
      )}
    </DetailShell>
  );
}

function MealDetail({ item, mine, saves, onSaved, onClose, onRemoved, logTo }: { item: LibraryMeal; mine: boolean; saves: number; onSaved: () => void; onClose: () => void; onRemoved: () => void; logTo?: { label: string; onLog: (meal: LibraryMeal) => void } }) {
  const userId = useUserId();
  const showToast = useAppStore((s) => s.showToast);
  const [busy, setBusy] = useState(false);
  const c = item.content;

  async function save() {
    if (!userId) return;
    setBusy(true);
    const saved = await saveUserRecipe(userId, {
      name: item.name,
      imageUrl: c.imageUrl ?? null,
      servings: c.servings,
      kcal: c.kcal,
      proteinG: c.proteinG,
      carbsG: c.carbsG,
      fatG: c.fatG,
      ingredients: c.ingredients,
      steps: c.steps,
      sourceLabel: creditLine(item),
      sourceUrl: item.source_url,
    });
    if (saved && (await recordLibrarySave(item.id, 'meal'))) onSaved();
    setBusy(false);
    showToast(saved ? 'Saved to My Recipes' : 'Could not save this recipe');
    if (saved) onClose();
  }

  async function remove() {
    if (!window.confirm('Remove this recipe from the Library?')) return;
    if (await removeMyLibraryItem(item.id)) {
      showToast('Removed from the Library');
      onRemoved();
    } else showToast('Could not remove it');
  }

  return (
    <DetailShell title="Recipe" onClose={onClose}>
      {c.imageUrl && (
        <div className="recipe-hero">
          <img src={c.imageUrl} alt="" />
        </div>
      )}
      {/* No photo: the shared title block assumes a hero above it, so round it off here. */}
      <div className="recipe-title-block" style={c.imageUrl ? undefined : { border: '1px solid var(--line)', borderRadius: 20, marginTop: 12 }}>
        <h1>{item.name}</h1>
        <div className="s">
          {creditLine(item)} · {c.servings} serving{c.servings === 1 ? '' : 's'}
          {item.duration ? ` · ${item.duration}` : ''}
        </div>
        {saves > 0 && <div className="lib-saved-by"><Icon name="community" /> Saved by {saves} {saves === 1 ? 'person' : 'people'}</div>}
      </div>
      <DetailTags item={item} />
      {item.description && <p className="lib-desc">{item.description}</p>}
      {c.whoItsFor && (
        <div className="lib-know">
          <div className="lib-know-h"><Icon name="profile" /> Who it's for</div>
          <p>{c.whoItsFor}</p>
        </div>
      )}
      {c.tips?.length ? (
        <div className="lib-know">
          <div className="lib-know-h"><Icon name="info" /> Tips</div>
          <ul>{c.tips.map((t, i) => <li key={i}>{t}</li>)}</ul>
        </div>
      ) : null}
      {item.source_url && (
        <a className="lib-source" href={item.source_url} target="_blank" rel="noreferrer">
          <Icon name="link" /> Original recipe
        </a>
      )}
      {requiredAttribution(item) && <div className="lib-attrib">{requiredAttribution(item)}</div>}
      <div className="recipe-stat-row">
        <div className="recipe-stat"><b>{c.kcal}</b><span>kcal</span></div>
        <div className="recipe-stat"><b>{c.proteinG}g</b><span>protein</span></div>
        <div className="recipe-stat"><b>{c.carbsG}g</b><span>carbs</span></div>
        <div className="recipe-stat"><b>{c.fatG}g</b><span>fat</span></div>
      </div>
      {c.ingredients.length > 0 && (
        <>
          <div className="section-label">Ingredients</div>
          <div className="card">
            {c.ingredients.map((ing, i) => (
              <div className="ingredient-row" key={i}>
                <span className="dot" />
                <span className="n">{ing.name}</span>
                <span className="amt">{ing.amount}</span>
              </div>
            ))}
          </div>
        </>
      )}
      {c.steps.length > 0 && (
        <>
          <div className="section-label">Method</div>
          <div className="card">
            {c.steps.map((s, i) => (
              <div className="step-row" key={i}>
                <span className="step-no">{i + 1}</span>
                <p>{s}</p>
              </div>
            ))}
          </div>
        </>
      )}
      {logTo && (
        <button className="btn btn-primary" onClick={() => { void recordLibrarySave(item.id, 'meal'); logTo.onLog(item); }}>
          <Icon name="plus" style={{ width: 15, height: 15 }} /> Add to {logTo.label}
        </button>
      )}
      <button className={`btn ${logTo ? 'btn-ghost' : 'btn-primary'}`} disabled={busy} onClick={save}>
        <Icon name={logTo ? 'heart' : 'plus'} style={{ width: 15, height: 15 }} /> {busy ? 'Saving…' : 'Save to My Recipes'}
      </button>
      {mine && (
        <button className="btn btn-ghost" style={{ marginTop: 8, color: 'var(--danger)' }} onClick={remove}>
          <Icon name="trash" style={{ width: 15, height: 15 }} /> Remove from Library
        </button>
      )}
    </DetailShell>
  );
}

function DetailTags({ item }: { item: LibraryItem }) {
  const tags = [
    labelFor(LEVELS, item.level),
    item.sport ? labelFor(SPORTS, item.sport) : null,
    ...item.goals.map((g) => labelFor(GOALS, g)),
    ...(item.kind === 'meal' ? item.tags.map((t) => labelFor(DIETS, t)) : []),
  ].filter((t, i, all) => t && all.indexOf(t) === i);
  return (
    <div className="lib-tags">
      {tags.map((t, i) => (
        <span key={i}>{t}</span>
      ))}
    </div>
  );
}

function DetailShell({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return createPortal(
    <div className="macro-search-overlay">
      <div className="macro-search-head">
        <button className="macro-search-back" onClick={onClose} aria-label="Back">
          <svg viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6" /></svg>
        </button>
        <div style={{ fontWeight: 700, fontSize: 15 }}>{title}</div>
      </div>
      <div className="macro-search-results lib-detail">{children}</div>
    </div>,
    document.body,
  );
}

function groupKeys(item: LibraryItem, by: GroupBy): string[] {
  if (by === 'popular') return ['popular'];
  if (by === 'level') return [item.level];
  if (by === 'sport') return [item.kind === 'meal' ? item.category : item.sport ?? 'general'];
  return item.goals.length ? item.goals : ['general-fitness'];
}

function groupLabel(key: string, by: GroupBy, kind: LibraryKind): string {
  if (by === 'popular') return 'Most saved';
  if (by === 'level') return labelFor(LEVELS, key);
  if (by === 'sport') return kind === 'meal' ? labelFor(MEAL_TYPES, key) : labelFor(SPORTS, key);
  return labelFor(GOALS, key);
}

function groupOrder(by: GroupBy, kind: LibraryKind): string[] {
  if (by === 'popular') return ['popular'];
  if (by === 'level') return LEVELS.map((l) => l.id);
  if (by === 'sport') return (kind === 'meal' ? MEAL_TYPES : SPORTS).map((s) => s.id);
  return GOALS.map((g) => g.id);
}

// 'training' (Train tab): Programs + Plans. 'nutrition' (Nutrition tab): meals only.
// logTo: opened from the Log food sheet - a meal's detail page gets an
// "Add to <meal>" button that logs one serving straight away.
// pickFor: opened from a day's "Swap for" sheet - a program's detail page
// gets a "Use for <day>" button that puts it on that day.
export function LibraryScreen({ open, mode, onClose, logTo, pickFor, initialTab = 'programs' }: { open: boolean; mode: 'training' | 'nutrition'; onClose: () => void; initialTab?: 'programs' | 'plans' | 'foryou'; logTo?: { label: string; onLog: (meal: LibraryMeal) => void }; pickFor?: { label: string; onPick: (program: LibraryProgram) => void } }) {
  const initialKind: LibraryKind = mode === 'nutrition' ? 'meal' : 'program';
  const [kind, setKind] = useState<LibraryKind>(initialKind);
  // Train's library opens on For you; the nutrition one is meals only.
  const [tab, setTab] = useState<'foryou' | 'programs' | 'plans'>(initialTab);
  const plans = tab === 'plans';
  const profileSetup = useAppStore((s) => s.profile?.setup);
  const openTrainingProfile = useAppStore((s) => s.openTrainingProfile);
  const [items, setItems] = useState<LibraryItem[] | null>(null);
  const [mine, setMine] = useState<Set<string>>(new Set());
  const [saves, setSaves] = useState<Map<string, number>>(new Map());
  const [query, setQuery] = useState('');
  const [source, setSource] = useState<SourceFilter>('all');
  const [level, setLevel] = useState('all');
  const [sport, setSport] = useState('all');
  const [goal, setGoal] = useState('all');
  const [diet, setDiet] = useState('all');
  const [days, setDays] = useState('all');
  const [lifestyle, setLifestyle] = useState('all');
  const [groupBy, setGroupBy] = useState<GroupBy>('level');
  const [showFilters, setShowFilters] = useState(false);
  const [detail, setDetail] = useState<LibraryItem | null>(null);
  const [reloadTick, setReloadTick] = useState(0);
  // Sections open on their first few cards - drawing all 80+ at once was
  // the bulk of the open time at 6x CPU throttle.
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!open) return;
    setKind(initialKind);
    setTab(initialTab);
  }, [open, initialKind]);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setItems(null);
    // Paint the bundled items straight away; network extras (community
    // shares, my shares, save counts) merge in when they land, so a slow
    // connection never holds up the list.
    let curated: LibraryItem[] = [];
    let remote: LibraryItem[] = [];
    loadCurated(kind).then((c) => {
      if (cancelled) return;
      curated = c;
      setItems(mergeLibrary(curated, remote));
    });
    loadRemote(kind).then((r) => {
      if (cancelled || r.length === 0) return;
      remote = r;
      setItems(mergeLibrary(curated, remote));
    });
    myLibraryItemIds().then((ids) => !cancelled && setMine(ids));
    fetchSaveCounts(kind).then((counts) => !cancelled && setSaves(counts));
    return () => {
      cancelled = true;
    };
  }, [open, kind, reloadTick]);

  // Filters that don't apply to the other kind reset when switching.
  useEffect(() => {
    setSport('all');
    setDiet('all');
    setDays('all');
    setLifestyle('all');
  }, [kind]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (items ?? []).filter((it) => {
      if (source !== 'all' && it.source !== source) return false;
      if (level !== 'all' && it.level !== level) return false;
      if (goal !== 'all' && !it.goals.includes(goal)) return false;
      if (kind === 'program' && sport !== 'all' && it.sport !== sport) return false;
      if (kind === 'meal' && sport !== 'all' && it.category !== sport) return false;
      if (kind === 'meal' && diet !== 'all' && !it.tags.includes(diet)) return false;
      if (it.kind === 'program' && days !== 'all' && !matchesDays(it.content.daysPerWeek, days)) return false;
      if (it.kind === 'program' && lifestyle !== 'all' && !(it.content.lifestyle ?? []).includes(lifestyle)) return false;
      if (q && !`${it.name} ${it.description ?? ''} ${it.credit_name ?? ''}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [items, query, source, level, goal, sport, diet, days, lifestyle, kind]);

  const groups = useMemo(() => {
    const map = new Map<string, LibraryItem[]>();
    for (const it of filtered) for (const k of groupKeys(it, groupBy)) map.set(k, [...(map.get(k) ?? []), it]);
    if (groupBy === 'popular') for (const list of map.values()) list.sort((a, b) => (saves.get(b.id) ?? 0) - (saves.get(a.id) ?? 0));
    const order = groupOrder(groupBy, kind);
    return [...map.entries()].sort((a, b) => {
      const ia = order.indexOf(a[0]);
      const ib = order.indexOf(b[0]);
      return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib);
    });
  }, [filtered, groupBy, kind, saves]);

  // Diet sits in its own always-visible row for meals (see below), not
  // behind the Filters toggle, so it doesn't count toward that badge.
  const activeFilterCount = [days, lifestyle].filter((v) => v !== 'all').length;

  // Switching sort tab clears the chip filters, so nothing stays applied
  // out of sight on a tab you're no longer looking at.
  function changeGroupBy(g: GroupBy) {
    setGroupBy(g);
    setLevel('all');
    setSport('all');
    setGoal('all');
  }

  const present = (id: string, pick: (it: LibraryItem) => string[]) => (items ?? []).some((it) => pick(it).includes(id));
  const sportOf = (it: LibraryItem) => [it.kind === 'program' ? it.sport ?? '' : it.category];
  const wheel =
    groupBy === 'level'
      ? { options: LEVEL_WHEEL, value: level, set: setLevel, allLabel: 'All levels' }
      : groupBy === 'goal'
        ? { options: GOAL_WHEEL.filter((o) => present(o.id, (it) => it.goals)), value: goal, set: setGoal, allLabel: 'All goals' }
        : {
            options: (kind === 'program' ? SPORTS : MEAL_TYPES).filter((o) => present(o.id, sportOf)),
            value: sport,
            set: setSport,
            allLabel: kind === 'program' ? 'All sports' : 'All meals',
          };

  // A short result (a narrow filter or a search) just shows everything.
  const showAll = filtered.length <= SHOW_ALL_UNDER || query.trim() !== '';

  if (!open) return null;

  return createPortal(
    <div className="macro-search-overlay">
      <div className="macro-search-head">
        <button className="macro-search-back" onClick={onClose} aria-label="Close library">
          <svg viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6" /></svg>
        </button>
        <div style={{ fontWeight: 700, fontSize: 15, flex: 1 }}>{mode === 'nutrition' ? 'Meal Library' : 'Library'}</div>
        {mode === 'training' && (
          <div className="scope">
            <button className={tab === 'programs' ? 'on' : ''} onClick={() => setTab('programs')}>
              Programs
            </button>
            <button className={plans ? 'on' : ''} onClick={() => setTab('plans')}>
              Plans
            </button>
            <button className={tab === 'foryou' ? 'on' : ''} onClick={() => setTab('foryou')}>
              For you
            </button>
          </div>
        )}
      </div>
      <div className="macro-search-results">
        {tab === 'foryou' ? (
          profileSetup?.mode === 'plan' ? (
            <>
              <button
                type="button"
                className="lib-foryou-banner"
                onClick={() => {
                  onClose();
                  openTrainingProfile();
                }}
              >
                <Icon name="rotate" />
                <span>
                  Goals or training changed? Update your training profile for better-matched programs.
                </span>
                <b>Update</b>
              </button>
              <p className="lib-desc" style={{ marginTop: 10 }}>
                Ranked for your {profileSetup.level} {profileSetup.days}-day week: sport, goals, level, kit and session length.
              </p>
              {items === null && <div className="macro-search-hint">Loading…</div>}
              <div className="lib-list">
                {rankForYou(
                  (items ?? []).filter((it): it is LibraryProgram => it.kind === 'program'),
                  profileSetup,
                )
                  .slice(0, 20)
                  .map(({ item, fit }) => (
                    <ItemCard key={item.id} item={item} fit={fit} saves={saves.get(item.id) ?? 0} onOpen={() => setDetail(item)} />
                  ))}
              </div>
            </>
          ) : (
            <div className="lib-foryou-empty">
              <Icon name="trophy" />
              <b>Nothing here yet</b>
              <span>For you suggests programs from your training profile: your sport, goals, level, days and kit.</span>
              <button
                className="btn btn-primary"
                onClick={() => {
                  onClose();
                  openTrainingProfile();
                }}
              >
                Update training profile
              </button>
            </div>
          )
        ) : plans ? <PlansTab /> : <>
        <div className="lib-search-row">
          <div className="lib-search">
            <Icon name="search" />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={kind === 'program' ? 'Search programs' : 'Search meals'} />
          </div>
          {kind === 'program' && (
            <button className={`lib-filter-btn${showFilters || activeFilterCount ? ' on' : ''}`} onClick={() => setShowFilters((v) => !v)} aria-label="Filters">
              <Icon name="layers" />
              {activeFilterCount > 0 && <span>{activeFilterCount}</span>}
            </button>
          )}
        </div>

        <div className="feed-filters lib-chips">
          {SOURCE_FILTERS.map((s) => (
            <button key={s.id} className={`type-chip${source === s.id ? ' active' : ''}`} onClick={() => setSource(s.id)}>
              {s.label}
            </button>
          ))}
        </div>

        <div className="lib-groupby">
          <span>Sort by</span>
          <div className="scope">
            {(['popular', 'level', 'sport', 'goal'] as GroupBy[]).map((g) => (
              <button key={g} className={groupBy === g ? 'on' : ''} onClick={() => changeGroupBy(g)}>
                {g === 'popular' ? 'Popular' : g === 'level' ? 'Level' : g === 'sport' ? (kind === 'program' ? 'Sport' : 'Meal') : 'Goal'}
              </button>
            ))}
          </div>
        </div>

        {/* Third row follows the sort tab: levels / sports (or meal types) / goals. */}
        <SportWheel options={wheel.options} value={wheel.value} onChange={wheel.set} allLabel={wheel.allLabel} />

        {/* Diet is core to browsing meals, not a secondary filter - it gets
            its own always-visible row instead of hiding behind the Filters
            toggle below, which is easy to miss entirely. */}
        {kind === 'meal' && (
          <>
            <div className="lib-filter-label">Diet</div>
            <Chips options={DIETS} value={diet} onChange={setDiet} />
          </>
        )}

        {showFilters && (
          <div className="lib-filters">
            {kind === 'program' && (
              <>
                <div className="lib-filter-label">Days per week</div>
                <Chips options={DAYS_FILTERS} value={days} onChange={setDays} />
                <div className="lib-filter-label">Lifestyle</div>
                <Chips options={LIFESTYLES} value={lifestyle} onChange={setLifestyle} />
              </>
            )}
          </div>
        )}

        {items === null && <div className="macro-search-hint">Loading the library…</div>}
        {items !== null && filtered.length === 0 && (
          <div className="macro-search-hint">
            Nothing matches yet.
            <br />
            Share one of yours from {kind === 'program' ? 'My programs' : 'My Recipes'} to add it here.
          </div>
        )}
        {groups.map(([key, list]) => (
          <div key={key}>
            <div className="section-label">
              {groupLabel(key, groupBy, kind)} <span className="lib-count">{list.length}</span>
            </div>
            <div className="lib-list">
              {(showAll || expanded.has(`${groupBy}:${key}`) ? list : list.slice(0, GROUP_PREVIEW)).map((it) => (
                <ItemCard key={`${key}-${it.id}`} item={it} saves={saves.get(it.id) ?? 0} onOpen={() => setDetail(it)} />
              ))}
            </div>
            {!showAll && !expanded.has(`${groupBy}:${key}`) && list.length > GROUP_PREVIEW && (
              <button className="lib-more" onClick={() => setExpanded((e) => new Set(e).add(`${groupBy}:${key}`))}>
                Show all {list.length}
              </button>
            )}
          </div>
        ))}
        </>}
      </div>

      {detail?.kind === 'program' && (
        <ProgramDetail pickFor={pickFor} item={detail} mine={mine.has(detail.id)} saves={saves.get(detail.id) ?? 0} onSaved={() => setSaves((m) => new Map(m).set(detail.id, (m.get(detail.id) ?? 0) + 1))} onClose={() => setDetail(null)} onRemoved={() => { setDetail(null); setReloadTick((t) => t + 1); }} />
      )}
      {detail?.kind === 'meal' && (
        <MealDetail logTo={logTo} item={detail} mine={mine.has(detail.id)} saves={saves.get(detail.id) ?? 0} onSaved={() => setSaves((m) => new Map(m).set(detail.id, (m.get(detail.id) ?? 0) + 1))} onClose={() => setDetail(null)} onRemoved={() => { setDetail(null); setReloadTick((t) => t + 1); }} />
      )}
    </div>,
    document.body,
  );
}
