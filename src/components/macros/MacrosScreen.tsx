import { useEffect, useMemo, useState } from 'react';
import { LibraryScreenLazy, usePrefetchLibrary } from '../library/LazyLibrary';
import { useUserId } from '../../lib/useSession';
import { useGoals } from '../../lib/useGoals';
import { useAppStore } from '../../store/useAppStore';
import { getTodayWorkouts, healthAvailableOnPlatform, type HealthWorkout } from '../../lib/health';
import { AddFoodSheet } from './AddFoodSheet';
import { EditFoodEntrySheet } from './EditFoodEntrySheet';
import { MacroGoalsSheet } from './MacroGoalsSheet';
import { MyRecipesScreen } from '../community/MyRecipesScreen';
import { Icon } from '../Icon';
import { ShareRecipeSheet } from '../community/ShareRecipeSheet';
import type { RecipeToShare } from '../../lib/recipePosts';
import {
  addDaysIso,
  addFoodEntry,
  addSkippedMeal,
  computeGoalCalories,
  deleteFoodEntry,
  entryTotal,
  fetchDayEntries,
  fetchNutritionGoals,
  fetchRecentEntries,
  isoToday,
  isSkippedEntry,
  saveFavoriteMeal,
  saveNutritionGoals,
  updateFoodEntry,
  type FoodLogEntry,
  type MealId,
  type NutritionGoals,
} from './macros';


const MEALS: { id: MealId; label: string; color: string; icon: string }[] = [
  { id: 'breakfast', label: 'Breakfast', color: '#e0a53c', icon: '<path d="M5 12a7 7 0 0 1 14 0"/><path d="M4 12h16v1a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3v-1Z"/><path d="M8 19h8"/>' },
  { id: 'lunch', label: 'Lunch', color: '#0f8f5c', icon: '<path d="M4 9h16l-1.2 9.2a2 2 0 0 1-2 1.8H7.2a2 2 0 0 1-2-1.8L4 9Z"/><path d="M8 9V6a4 4 0 0 1 8 0v3"/>' },
  { id: 'dinner', label: 'Dinner', color: '#8936e8', icon: '<circle cx="12" cy="12" r="8"/><path d="M12 8v4l3 2"/>' },
  { id: 'snacks', label: 'Snacks', color: '#d4425c', icon: '<path d="M12 3c2 2 6 2 6 6a6 6 0 0 1-12 0c0-4 4-4 6-6Z"/>' },
];

const RING_C = 2 * Math.PI * 42;

function fmt(n: number): string {
  return Math.round(n).toLocaleString();
}

export function MacrosScreen() {
  usePrefetchLibrary();
  const userId = useUserId();
  const { weightGoal, latestWeight, loaded: goalsLoaded } = useGoals();
  const openGoals = useAppStore((s) => s.openGoals);
  const showToast = useAppStore((s) => s.showToast);
  const syncMacroGoal = useAppStore((s) => s.syncMacroGoal);
  const syncMacroChallenge = useAppStore((s) => s.syncMacroChallenge);

  const [activeDate, setActiveDate] = useState(isoToday());
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [entries, setEntries] = useState<FoodLogEntry[]>([]);
  const [recentEntries, setRecentEntries] = useState<FoodLogEntry[]>([]);
  const [goals, setGoals] = useState<NutritionGoals | null>(null);
  const [todayWorkouts, setTodayWorkouts] = useState<HealthWorkout[]>([]);
  const [addSheetMeal, setAddSheetMeal] = useState<MealId | null>(null);
  const [goalsSheetOpen, setGoalsSheetOpen] = useState(false);
  const [myRecipesOpen, setMyRecipesOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<FoodLogEntry | null>(null);
  const [sharingRecipe, setSharingRecipe] = useState<RecipeToShare | null>(null);

  useEffect(() => {
    if (!userId) return;
    fetchNutritionGoals(userId).then(setGoals);
    fetchRecentEntries(userId, addDaysIso(isoToday(), -6)).then(setRecentEntries);
    if (healthAvailableOnPlatform()) getTodayWorkouts().then(setTodayWorkouts);
  }, [userId]);

  useEffect(() => {
    if (!userId) return;
    fetchDayEntries(userId, activeDate).then(setEntries);
  }, [userId, activeDate]);

  // Real-data checklist/challenge sync - mirrors syncWatchWorkout/
  // syncCardioKm's pattern (auto-detect from real rows, not a manual tap).
  useEffect(() => {
    if (activeDate !== isoToday()) return;
    syncMacroGoal(entries.map((e) => e.meal));
  }, [entries, activeDate, syncMacroGoal]);

  useEffect(() => {
    const mealsByDate = new Map<string, Set<MealId>>();
    for (const e of recentEntries) {
      if (!mealsByDate.has(e.log_date)) mealsByDate.set(e.log_date, new Set());
      mealsByDate.get(e.log_date)!.add(e.meal);
    }
    const fullyLoggedDays = [...mealsByDate.values()].filter((s) => s.size >= 4).length;
    syncMacroChallenge(fullyLoggedDays);
  }, [recentEntries, syncMacroChallenge]);

  const isToday = activeDate === isoToday();
  const exerciseKcal = isToday ? todayWorkouts.reduce((sum, w) => sum + w.kcal, 0) : 0;

  const totals = useMemo(() => {
    const t = { kcal: 0, protein: 0, carbs: 0, fat: 0 };
    for (const e of entries) {
      const total = entryTotal(e);
      t.kcal += total.kcal;
      t.protein += total.protein;
      t.carbs += total.carbs;
      t.fat += total.fat;
    }
    return t;
  }, [entries]);

  const goalCalories = computeGoalCalories(weightGoal, goals?.maintenance_kcal ?? 2200);
  const adjustedGoal = goalCalories.calories + exerciseKcal;
  const remaining = adjustedGoal - totals.kcal;
  const over = remaining < 0;
  const pct = adjustedGoal ? totals.kcal / adjustedGoal : 0;
  const ringOffset = RING_C * (1 - Math.min(1, pct));

  function kcalForDate(date: string): number {
    return recentEntries.filter((e) => e.log_date === date).reduce((sum, e) => sum + entryTotal(e).kcal, 0);
  }

  async function handleAddFood(
    entries: {
      meal: MealId;
      name: string;
      serving: string;
      proteinG: number;
      carbsG: number;
      fatG: number;
      quantity: number;
      source: FoodLogEntry['source'];
      barcode?: string;
      imageUrl?: string | null;
    }[],
  ) {
    if (!userId || entries.length === 0) return;
    const saved = (await Promise.all(entries.map((entry) => addFoodEntry(userId, activeDate, entry)))).filter(
      (e): e is NonNullable<typeof e> => e !== null,
    );
    if (saved.length > 0) {
      setEntries((prev) => [...prev, ...saved]);
      setRecentEntries((prev) => [...prev, ...saved]);
      showToast(saved.length === 1 ? `Added to ${MEALS.find((m) => m.id === entries[0].meal)!.label.toLowerCase()}` : `Added ${saved.length} items`);
    }
    setAddSheetMeal(null);
  }

  async function handleSkipMeal(meal: MealId) {
    if (!userId) return;
    const saved = await addSkippedMeal(userId, activeDate, meal);
    if (saved) {
      setEntries((prev) => [...prev, saved]);
      setRecentEntries((prev) => [...prev, saved]);
      showToast(`${MEALS.find((m) => m.id === meal)!.label} skipped`);
    }
  }

  async function handleDelete(entry: FoodLogEntry) {
    setEntries((prev) => prev.filter((e) => e.id !== entry.id));
    setRecentEntries((prev) => prev.filter((e) => e.id !== entry.id));
    await deleteFoodEntry(entry.id);
    showToast('Removed');
  }

  async function handleSaveEdit(fields: { name: string; serving: string; proteinG: number; carbsG: number; fatG: number; quantity: number }) {
    if (!editingEntry) return;
    const updated = await updateFoodEntry(editingEntry.id, fields);
    if (updated) {
      setEntries((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));
      setRecentEntries((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));
      showToast('Updated');
    }
    setEditingEntry(null);
  }

  async function handleSaveEntryAsFavorite(fields: { name: string; serving: string; proteinG: number; carbsG: number; fatG: number }) {
    if (!userId || !editingEntry) return;
    const fav = await saveFavoriteMeal(userId, fields.name, editingEntry.meal, [fields]);
    showToast(fav ? 'Saved as favourite' : 'Could not save as favourite');
  }

  function handleDeleteFromEdit() {
    if (!editingEntry) return;
    handleDelete(editingEntry);
    setEditingEntry(null);
  }

  // A log entry has no ingredients/steps/photo of its own - fill in sensible
  // defaults (one "ingredient" that's just the serving itself, no steps, no
  // photo yet) so it fits the same RecipeToShare shape a saved recipe uses;
  // ShareRecipeSheet already lets a photo be added before posting.
  function handleShareEntry(fields: { name: string; serving: string; kcal: number; proteinG: number; carbsG: number; fatG: number }) {
    setSharingRecipe({
      name: fields.name,
      imageUrl: null,
      servings: 1,
      kcal: fields.kcal,
      proteinG: fields.proteinG,
      carbsG: fields.carbsG,
      fatG: fields.fatG,
      ingredients: [{ name: fields.name, amount: fields.serving }],
      steps: [],
    });
    setEditingEntry(null);
  }

  async function handleSaveGoals(g: { maintenanceKcal: number; proteinG: number; carbsG: number; fatG: number }) {
    if (!userId) return;
    await saveNutritionGoals(userId, g);
    setGoals({ user_id: userId, updated_at: new Date().toISOString(), maintenance_kcal: g.maintenanceKcal, protein_g: g.proteinG, carbs_g: g.carbsG, fat_g: g.fatG });
    setGoalsSheetOpen(false);
    showToast('Targets updated');
  }

  const macroBars = goals
    ? [
        { label: 'Protein', color: 'var(--macro-protein)', value: totals.protein, goal: goals.protein_g },
        { label: 'Carbs', color: 'var(--macro-carbs)', value: totals.carbs, goal: goals.carbs_g },
        { label: 'Fat', color: 'var(--macro-fat)', value: totals.fat, goal: goals.fat_g },
      ]
    : [];

  const dayStripDays = Array.from({ length: 7 }, (_, i) => addDaysIso(isoToday(), i - 6));

  if (!goals) return null;

  return (
    <>
      <div className="macro-topbar">
        <div className="macro-sub">{isToday ? 'Today' : new Date(activeDate + 'T00:00:00').toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}</div>
        <button className="macro-gear" aria-label="Edit goals" onClick={() => setGoalsSheetOpen(true)}>
          <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3.2" /><path d="M19.4 13a7.6 7.6 0 0 0 0-2l2-1.6-2-3.4-2.4 1a7.6 7.6 0 0 0-1.7-1l-.4-2.6h-4l-.4 2.6a7.6 7.6 0 0 0-1.7 1l-2.4-1-2 3.4 2 1.6a7.6 7.6 0 0 0 0 2l-2 1.6 2 3.4 2.4-1a7.6 7.6 0 0 0 1.7 1l.4 2.6h4l.4-2.6a7.6 7.6 0 0 0 1.7-1l2.4 1 2-3.4z" /></svg>
        </button>
      </div>

      <div className="macro-daystrip">
        {dayStripDays.map((d) => {
          const date = new Date(d + 'T00:00:00');
          const dayKcal = kcalForDate(d);
          const hasLog = dayKcal > 0;
          const dotClass = hasLog ? (dayKcal - (d === isoToday() ? exerciseKcal : 0) <= goalCalories.calories ? 'under' : 'over') : '';
          return (
            <button key={d} className={`macro-daypill${d === activeDate ? ' on' : ''}`} onClick={() => setActiveDate(d)}>
              <span className="d">{d === isoToday() ? 'Today' : date.toLocaleDateString(undefined, { weekday: 'short' }).slice(0, 2)}</span>
              <span className="n">{date.getDate()}</span>
              <span className={`dot ${dotClass}`} />
            </button>
          );
        })}
      </div>

      <div className="macro-hero">
        <div className="macro-track-pill">
          {over ? (
            <>
              <svg viewBox="0 0 24 24"><path d="M12 8v5M12 16h.01" /><circle cx="12" cy="12" r="9" /></svg>
              {fmt(Math.abs(remaining))} kcal over {isToday ? 'today' : 'that day'}
            </>
          ) : (
            <>
              <svg viewBox="0 0 24 24"><path d="M20 6 9 17l-5-5" /></svg>
              On track {isToday ? 'today' : 'that day'}
            </>
          )}
        </div>
        <div className="macro-hero-top">
          <div className="macro-ring-wrap">
            <svg viewBox="0 0 100 100">
              <circle className="track" cx="50" cy="50" r="42" strokeWidth="9" />
              <circle className={`fill${over ? ' over' : ''}`} cx="50" cy="50" r="42" strokeWidth="9" strokeDasharray={RING_C} strokeDashoffset={ringOffset} />
            </svg>
            <div className="macro-ring-mid">
              <b>{fmt(Math.abs(remaining))}</b>
              <span>{over ? 'over' : 'left'}</span>
            </div>
          </div>
          <div className="macro-hero-stats">
            <div className="row"><span>Goal</span><b className="mono">{fmt(goalCalories.calories)}</b></div>
            <div className="row"><span>Food</span><b className="mono">{fmt(totals.kcal)}</b></div>
            <div className="row plus"><span>+ Exercise</span><b className="mono">{fmt(exerciseKcal)}</b></div>
            <div className="rule" />
            <div className="row"><span>= Remaining</span><b className="mono">{over ? '-' : ''}{fmt(Math.abs(remaining))}</b></div>
          </div>
        </div>
        <div className="macro-bars">
          {macroBars.map((m) => {
            const p = m.goal ? Math.min(100, Math.round((m.value / m.goal) * 100)) : 0;
            return (
              <div className="macro-bar" key={m.label}>
                <div className="lbl"><span>{m.label}</span><span className="amt">{Math.round(m.value)} / {m.goal}g</span></div>
                <div className="track"><div className="fill" style={{ width: `${p}%`, background: m.color }} /></div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="section-label">
        Recipes &amp; favourites
        <span className="link" onClick={() => setMyRecipesOpen(true)}>See all</span>
      </div>
      <button
        className="btn btn-ghost"
        style={{ width: '100%', marginBottom: 4, justifyContent: 'flex-start', gap: 10 }}
        onClick={() => setMyRecipesOpen(true)}
      >
        <svg viewBox="0 0 24 24" style={{ width: 16, height: 16, stroke: 'var(--accent)', fill: 'none', strokeWidth: 2 }}>
          <path d="M4 9h16l-1.2 9.2a2 2 0 0 1-2 1.8H7.2a2 2 0 0 1-2-1.8L4 9Z" />
          <path d="M8 9V6a4 4 0 0 1 8 0v3" />
        </svg>
        Add a recipe, browse favourites, or share one to the feed
      </button>

      <div className="section-label">
        Weight goal
        <span className="link" onClick={openGoals}>Edit</span>
      </div>
      <div className="macro-weightcard">
        {!goalsLoaded ? null : weightGoal && latestWeight != null ? (
          <>
            <div className="macro-wg-top">
              <div className="cur">{latestWeight}kg <small>now</small></div>
              <div className="togo"><b>{Math.abs(weightGoal.target_weight_kg - latestWeight).toFixed(1)}kg</b> to go</div>
            </div>
            <div className="macro-wg-track">
              <div className="fill" style={{ width: `${Math.max(0, Math.min(100, (Math.abs(latestWeight - weightGoal.start_weight_kg) / (Math.abs(weightGoal.target_weight_kg - weightGoal.start_weight_kg) || 1)) * 100))}%` }} />
            </div>
            <div className="macro-wg-ends"><span>{weightGoal.start_weight_kg}kg start</span><span>{weightGoal.target_weight_kg}kg target</span></div>
            <div className="macro-wg-math">
              <div className="item"><div className="k">Pace</div><div className="v">{goalCalories.weeklyRateKg !== null ? Math.abs(goalCalories.weeklyRateKg).toFixed(2) : '0.00'}kg/wk</div></div>
              <div className="item"><div className="k">Daily {goalCalories.dailyDeltaKcal < 0 ? 'deficit' : 'surplus'}</div><div className="v">{Math.abs(goalCalories.dailyDeltaKcal)} kcal</div></div>
            </div>
            <div className="macro-wg-goal-chip"><span className="lbl">Calorie goal</span><span className="v">{fmt(goalCalories.calories)}<small>kcal/day</small></span></div>
          </>
        ) : (
          <div className="macro-wg-empty">
            No active weight goal - your calorie goal is set to maintenance ({fmt(goals.maintenance_kcal)} kcal/day). Set a weight goal to get a real daily target.
            <button className="btn btn-primary btn-sm" onClick={openGoals}>Set a weight goal</button>
          </div>
        )}
      </div>

      <div className="section-label">
        Exercise
        <span className="note mono">+{fmt(exerciseKcal)} kcal {isToday ? 'today' : ''}</span>
      </div>
      <div className="macro-exercise">
        {!isToday ? (
          <div className="macro-exercise-empty">Exercise only shows for today - switch to today's date to see it.</div>
        ) : !healthAvailableOnPlatform() ? (
          <div className="macro-exercise-empty">Connect Apple Health to count workout calories toward today's goal.</div>
        ) : todayWorkouts.length === 0 ? (
          <div className="macro-exercise-empty">No workout logged today yet.</div>
        ) : (
          todayWorkouts.map((w) => (
            <div className="item" key={w.uuid}>
              <span className="ic"><svg viewBox="0 0 24 24"><path d="M4 8v8M20 8v8M4 12H2M22 12h-2M7 6v12M17 6v12" /></svg></span>
              <div className="main">
                <div className="n">{w.activityName}</div>
                <div className="s">{Math.round(w.durationMinutes)} min</div>
              </div>
              <div className="kcal">+{Math.round(w.kcal)} kcal</div>
            </div>
          ))
        )}
      </div>

      <div className="section-label">
        Today's log
        <span className="note mono">{entries.length} item{entries.length === 1 ? '' : 's'}</span>
      </div>
      {MEALS.map((m) => {
        const items = entries.filter((e) => e.meal === m.id);
        const kcal = items.reduce((sum, e) => sum + entryTotal(e).kcal, 0);
        return (
          <div className="macro-meal" key={m.id}>
            <div className="macro-meal-head">
              <div className="t">
                <span className="ic" style={{ background: `${m.color}26` }}>
                  <svg viewBox="0 0 24 24" style={{ stroke: m.color }} dangerouslySetInnerHTML={{ __html: m.icon }} />
                </span>
                {m.label}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span className="kcal">{kcal} kcal</span>
                <button className="macro-meal-add" aria-label={`Add food to ${m.label}`} onClick={() => setAddSheetMeal(m.id)}>
                  <svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14" /></svg>
                </button>
              </div>
            </div>
            {items.length === 0 ? (
              <div className="macro-meal-empty">
                Nothing logged yet
                <button className="link-btn" style={{ marginLeft: 8 }} onClick={() => handleSkipMeal(m.id)}>
                  Skip meal
                </button>
              </div>
            ) : (
              items.map((e) => {
                if (isSkippedEntry(e)) {
                  return (
                    <div className="macro-food-row skipped" key={e.id}>
                      <div className="main">
                        <div className="n">Skipped</div>
                        <div className="s">Counted as logged - no food recorded</div>
                      </div>
                      <span
                        className="del"
                        role="button"
                        aria-label="Undo skip"
                        onClick={() => handleDelete(e)}
                      >
                        <svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6 6 18" /></svg>
                      </span>
                    </div>
                  );
                }
                const total = entryTotal(e);
                return (
                <button className="macro-food-row" key={e.id} onClick={() => setEditingEntry(e)}>
                  {e.image_url && <img className="macro-food-thumb" src={e.image_url} alt="" />}
                  <div className="main">
                    <div className="n">{e.name}{e.quantity !== 1 ? ` ×${e.quantity}` : ''}</div>
                    {e.serving && <div className="s">{e.serving}</div>}
                    <div className="macros">
                      <span><b>{total.kcal}</b> kcal</span>
                      <span>P <b>{Math.round(total.protein)}g</b></span>
                      <span>C <b>{Math.round(total.carbs)}g</b></span>
                      <span>F <b>{Math.round(total.fat)}g</b></span>
                    </div>
                  </div>
                  <span
                    className="del"
                    role="button"
                    aria-label="Remove"
                    onClick={(ev) => {
                      ev.stopPropagation();
                      handleDelete(e);
                    }}
                  >
                    <svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6 6 18" /></svg>
                  </span>
                </button>
                );
              })
            )}
          </div>
        );
      })}

      <button className="lib-entry lib-entry-bottom" onClick={() => setLibraryOpen(true)}>
        <span className="ic">
          <Icon name="nutrition" />
        </span>
        <span>
          <b>Browse the Meal Library</b>
          <small>Recipes by goal, meal and diet - from Somax and the community</small>
        </span>
        <Icon name="chevron" />
      </button>
      {libraryOpen && <LibraryScreenLazy open mode="nutrition" onClose={() => setLibraryOpen(false)} />}

      <AddFoodSheet
        open={addSheetMeal !== null}
        initialMeal={addSheetMeal ?? 'breakfast'}
        onClose={() => setAddSheetMeal(null)}
        onSave={handleAddFood}
      />
      <EditFoodEntrySheet
        entry={editingEntry}
        onClose={() => setEditingEntry(null)}
        onSave={handleSaveEdit}
        onDelete={handleDeleteFromEdit}
        onSaveAsFavorite={handleSaveEntryAsFavorite}
        onShare={handleShareEntry}
      />
      {sharingRecipe && <ShareRecipeSheet recipe={sharingRecipe} onClose={() => setSharingRecipe(null)} />}
      <MacroGoalsSheet
        open={goalsSheetOpen}
        onClose={() => setGoalsSheetOpen(false)}
        goals={goals}
        onSave={handleSaveGoals}
        onEditWeightGoal={() => {
          setGoalsSheetOpen(false);
          openGoals();
        }}
      />
      <MyRecipesScreen open={myRecipesOpen} onClose={() => setMyRecipesOpen(false)} />
    </>
  );
}
