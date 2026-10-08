import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { produce } from 'immer';
import { ACHIEVEMENT_DEFS } from '../data/achievements';
import { CHALLENGE_DEFS, MAX_ACTIVE_CHALLENGES, activeChallengeCount, defaultChallengeState, withAllChallenges } from '../data/challenges';
import { statBumpFor } from '../data/workouts';
import { defaultCharacter } from '../lib/character';
import { HYDRATION_TARGET_ML, STEP_GOAL, STEP_GOAL_XP, buildTodayGoals, generateWeekPlan, reviseWeekPlanFrom, todayPlanIndex } from '../lib/schedule';
import { getWorkout } from '../lib/customWorkouts';
import { expandSets, setKey } from '../lib/workoutSets';
import { DAILY_CAP, MAX_LEVEL, levelFromXP } from '../lib/xp';
import type { PostWorkout } from '../lib/social';
import type {
  AppState,
  CatalogKey,
  ChallengeState,
  CharacterConfig,
  HealthMetrics,
  HealthWorkoutSummary,
  OnboardingDraft,
  PlayTab,
  PostComposerSeed,
  Route,
  Settings,
  StudioCat,
  TrainingFocus,
  WorkoutSessionState,
} from '../types';

const WEIGHT_LOG_XP = 20;
const WEIGHT_GOAL_BONUS_XP = 80;
const FITNESS_GOAL_BONUS_XP = 80;

function defaultOnbDraft(): OnboardingDraft {
  return {
    name: '',
    age: '',
    height: '',
    weight: '',
    goal: [],
    focus: '',
    experience: '',
    availability: '',
    equipment: [],
    character: null,
  };
}

function defaultChallengeStates(): ChallengeState[] {
  return CHALLENGE_DEFS.map((c) => defaultChallengeState(c.id));
}

// Local calendar date, not UTC - toISOString() always returns UTC, which
// in a timezone ahead of UTC (e.g. AEDT, UTC+11) lags the real local day
// by that many hours. That meant the day wouldn't actually roll over
// here until well into the following local morning, even though the
// user's own calendar had already moved on - the actual bug behind
// "goals aren't resetting at midnight".
function todayISO(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

// First day (YYYY-MM-01) of the local calendar month containing the given ISO
// date - the league period boundary.
export function monthStartOf(dateISO: string): string {
  return `${dateISO.slice(0, 7)}-01`;
}

function defaultAppState(): AppState {
  const simDay = 0;
  const weekPlan = generateWeekPlan('4', []);
  return {
    onboarded: false,
    onbStep: 0,
    onbDraft: defaultOnbDraft(),
    character: null,
    route: 'home',
    simDay,
    lastActiveDate: todayISO(),
    profile: null,
    progress: {
      totalXP: 0,
      level: 1,
      currentStreak: 0,
      longestStreak: 0,
      monthlyXP: 0,
      monthStart: monthStartOf(todayISO()),
      monthlySteps: 0,
      prestige: 0,
      stats: { strength: 8, endurance: 8, agility: 8, vitality: 10, recovery: 9, discipline: 8 },
    },
    stats_workoutsDone: 0,
    today: { forDay: simDay, goals: buildTodayGoals(weekPlan), dayHadCompletion: false, xpEarnedToday: 0 },
    weekPlan,
    workoutState: { [simDay]: {} },
    history: [],
    challenges: defaultChallengeStates(),
    coins: 0,
    achievements: {},
    settings: { notifWorkout: true, notifStreak: true, notifLeague: false, notifChallenge: true, notifMessages: false, privateProfile: false, theme: 'system' },
    viewingWorkout: null,
    viewingCharacter: false,
    viewingGoals: false,
    viewingDM: null,
    viewingGroup: null,
    viewingProfile: null,
    viewingWorkoutEditor: null,
    viewingSharedProgram: null,
    viewingComposer: null,
    viewingSessionDetail: null,
    studioCat: 'base',
    playTab: 'challenges',
  };
}

export interface Toast {
  id: number;
  message: string;
}

interface TransientState {
  toast: Toast | null;
  levelUp: { id: number; level: number } | null;
}

interface Actions {
  go: (route: Route) => void;
  openWorkout: (wid: string) => void;
  closeWorkout: () => void;
  openCharacterStudio: () => void;
  closeCharacterStudio: () => void;
  openGoals: () => void;
  closeGoals: () => void;
  openDM: (userId: string, name: string) => void;
  closeDM: () => void;
  openGroup: (groupId: string, name: string) => void;
  closeGroup: () => void;
  openProfile: (userId: string) => void;
  closeProfile: () => void;
  openWorkoutEditor: (sourceKey: string | 'new') => void;
  closeWorkoutEditor: () => void;
  openSharedProgram: (id: string) => void;
  closeSharedProgram: () => void;
  openComposer: (seed?: PostComposerSeed) => void;
  closeComposer: () => void;
  openSessionDetail: (workout: PostWorkout) => void;
  closeSessionDetail: () => void;
  setStudioCat: (cat: StudioCat) => void;
  setPlayTab: (tab: PlayTab) => void;

  setOnbField: (field: keyof OnboardingDraft, value: string) => void;
  toggleOnbMulti: (field: 'equipment' | 'goal', value: string) => void;
  setOnbCharacterBase: (base: 'female' | 'male') => void;
  setOnbCharacterSkin: (skin: number) => void;
  onbNext: () => void;
  onbBack: () => void;
  finishOnboarding: () => void;

  toggleProfileGoal: (goal: string) => void;
  setProfileAvailability: (days: string) => void;
  setProfilePhoto: (url: string | null) => void;
  setProfileFocus: (focus: TrainingFocus) => void;
  reviseWeekPlan: () => void;
  setDayWorkout: (dayIndex: number, key: string | null) => void;
  setDayToWatchSync: (dayIndex: number) => void;

  toggleGoal: (goalId: string) => void;
  submitFeelingLog: (text: string) => void;
  setHydration: (ml: number) => void;
  syncHealthMetrics: (metrics: HealthMetrics) => void;
  setMonthlySteps: (steps: number) => void;
  syncWatchWorkout: (workouts: HealthWorkoutSummary[]) => void;
  toggleWatchWorkoutSelection: (workout: HealthWorkoutSummary) => void;
  toggleExercise: (exIndex: number) => void;
  toggleSet: (exIndex: number, setIndex: number) => void;
  toggleSkip: (exIndex: number) => void;
  finishWorkout: (wid: string) => void;

  joinChallenge: (id: string) => void;
  logChallenge: (id: string) => void;
  syncCardioKm: (km: number) => void;
  setFriendCount: (count: number) => void;
  prestige: () => void;
  leaveChallenge: (id: string) => void;
  awardWeightGoalXP: (label: string, opts?: { completed?: boolean }) => void;
  awardFitnessGoalXP: (label: string, amount: number, opts?: { completed?: boolean }) => void;

  updateCharacterField: (key: CatalogKey | 'base' | 'build' | 'skin' | 'hairColor', value: string | number) => void;

  toggleSetting: (key: keyof Settings) => void;
  setTheme: (theme: Settings['theme']) => void;

  advanceDay: () => void;
  checkForNewDay: () => void;
  resetDemo: () => void;

  showToast: (message: string) => void;
  clearToast: () => void;
  clearLevelUp: () => void;
}

export type Store = AppState & TransientState & Actions;

let toastCounter = 0;
let levelUpCounter = 0;

// An exercise is finished once every one of its sets is ticked, or once it
// has been skipped. exDone is kept in step so existing readers (recap,
// completion check) keep working unchanged.
function syncExerciseDone(ws: WorkoutSessionState, wid: string) {
  const w = getWorkout(wid);
  if (!w) return;
  ws.exDone = ws.exDone ?? {};
  w.exercises.forEach((ex, i) => {
    const count = expandSets(ex).length;
    const allSetsDone = Array.from({ length: count }, (_, k) => !!ws.setDone?.[setKey(i, k)]).every(Boolean);
    ws.exDone[i] = allSetsDone || !!ws.skipped?.[i];
  });
}

export const useAppStore = create<Store>()(
  persist(
    (set, get) => ({
      ...defaultAppState(),
      toast: null,
      levelUp: null,

      go: (route) =>
        set({
          route,
          viewingWorkout: null,
          viewingCharacter: false,
          viewingGoals: false,
          viewingDM: null,
          viewingGroup: null,
          viewingProfile: null,
          viewingWorkoutEditor: null,
          viewingSharedProgram: null,
          viewingComposer: null,
          viewingSessionDetail: null,
        }),
      openWorkout: (wid) =>
        set(
          produce((s) => {
            s.viewingWorkout = wid;
            if (!s.workoutState[s.simDay]) s.workoutState[s.simDay] = {};
            if (!s.workoutState[s.simDay][wid]) s.workoutState[s.simDay][wid] = { exDone: {}, completed: false };
          }),
        ),
      closeWorkout: () => set({ viewingWorkout: null }),
      openCharacterStudio: () => set({ viewingCharacter: true, route: 'profile' }),
      closeCharacterStudio: () => set({ viewingCharacter: false }),
      openGoals: () => set({ viewingGoals: true, route: 'profile' }),
      closeGoals: () => set({ viewingGoals: false }),
      openDM: (userId, name) => set({ viewingDM: { userId, name } }),
      closeDM: () => set({ viewingDM: null }),
      openGroup: (groupId, name) => set({ viewingGroup: { groupId, name } }),
      closeGroup: () => set({ viewingGroup: null }),
      openProfile: (userId) => set({ viewingProfile: userId }),
      closeProfile: () => set({ viewingProfile: null }),
      // Opening the editor replaces whatever workout view launched it
      // (WorkoutScreen's Edit button, or Train's own program list) rather
      // than stacking on top of it - closing lands back on the route
      // underneath instead of an intermediate workout view.
      openWorkoutEditor: (sourceKey) => set({ viewingWorkoutEditor: sourceKey, viewingWorkout: null }),
      closeWorkoutEditor: () => set({ viewingWorkoutEditor: null, viewingWorkout: null }),
      openSharedProgram: (id) => set({ viewingSharedProgram: id }),
      closeSharedProgram: () => set({ viewingSharedProgram: null }),
      openComposer: (seed) => set({ viewingComposer: seed ?? {} }),
      closeComposer: () => set({ viewingComposer: null }),
      openSessionDetail: (workout) => set({ viewingSessionDetail: workout }),
      closeSessionDetail: () => set({ viewingSessionDetail: null }),
      setStudioCat: (studioCat) => set({ studioCat }),
      setPlayTab: (playTab) => set({ playTab }),

      setOnbField: (field, value) =>
        set(produce((s) => {
          (s.onbDraft as any)[field] = value;
        })),
      toggleOnbMulti: (field, value) =>
        set(produce((s) => {
          const arr = s.onbDraft[field];
          const idx = arr.indexOf(value);
          if (idx > -1) arr.splice(idx, 1);
          else arr.push(value);
        })),
      setOnbCharacterBase: (base) =>
        set(produce((s) => {
          const keepSkin = s.onbDraft.character ? s.onbDraft.character.skin : 2;
          s.onbDraft.character = { ...defaultCharacter(base), skin: keepSkin };
        })),
      setOnbCharacterSkin: (skin) =>
        set(produce((s) => {
          if (!s.onbDraft.character) s.onbDraft.character = defaultCharacter('female');
          s.onbDraft.character.skin = skin;
        })),
      onbNext: () => set(produce((s) => { s.onbStep += 1; })),
      onbBack: () => set(produce((s) => { s.onbStep -= 1; })),
      finishOnboarding: () => {
        const d = get().onbDraft;
        const difficulty = d.experience === 'Beginner' ? 'Foundations' : d.experience === 'Advanced' ? 'Performance' : 'Progression';
        const focus = d.focus || 'gym';
        const weekPlan = generateWeekPlan(d.availability, d.goal, focus);
        set(
          produce((s) => {
            s.profile = {
              name: d.name.trim(),
              age: d.age,
              height: d.height,
              weight: d.weight,
              goal: d.goal,
              focus,
              experience: d.experience,
              availability: d.availability,
              equipment: d.equipment,
              program: { name: `${difficulty} Block · Week 1` },
            };
            s.character = d.character || defaultCharacter('female');
            s.weekPlan = weekPlan;
            s.today = { forDay: s.simDay, goals: buildTodayGoals(weekPlan), dayHadCompletion: false, xpEarnedToday: 0 };
            s.onboarded = true;
            s.history.unshift({ type: 'system', label: 'Profile created', xp: 0, day: s.simDay, at: new Date().toISOString() });
          }),
        );
        get().showToast(`Welcome to Somax, ${d.name.trim().split(' ')[0] || 'Athlete'}!`);
      },

      toggleProfileGoal: (goal) =>
        set(
          produce((s) => {
            if (!s.profile) return;
            const idx = s.profile.goal.indexOf(goal);
            if (idx > -1) s.profile.goal.splice(idx, 1);
            else s.profile.goal.push(goal);
          }),
        ),
      setProfileAvailability: (days) =>
        set(
          produce((s) => {
            if (!s.profile) return;
            s.profile.availability = days;
          }),
        ),
      setProfilePhoto: (url) =>
        set(
          produce((s) => {
            if (!s.profile) return;
            s.profile.photoUrl = url;
          }),
        ),
      setProfileFocus: (focus) =>
        set(
          produce((s) => {
            if (!s.profile) return;
            s.profile.focus = focus;
          }),
        ),
      reviseWeekPlan: () => {
        const s = get();
        if (!s.profile) return;
        // Only redistribute training days from today onward - earlier
        // days this real calendar week already happened and shouldn't be
        // rewritten by a preference change made mid-week.
        const fromIdx = todayPlanIndex();
        const weekPlan = reviseWeekPlanFrom(s.weekPlan, fromIdx, s.profile.availability, s.profile.goal, s.profile.focus);
        set(
          produce((st) => {
            st.weekPlan = weekPlan;
            // Rebuild today's goals against the revised plan (today's
            // workout type may have changed), but keep anything already
            // completed marked done - revising the plan shouldn't erase
            // progress already logged today.
            const oldGoals = st.today.goals;
            st.today.goals = buildTodayGoals(weekPlan).map((g: (typeof oldGoals)[number]) => {
              const prev = oldGoals.find((og: (typeof oldGoals)[number]) => og.id === g.id);
              return prev ? { ...g, done: prev.done } : g;
            });
          }),
        );
        get().showToast("This week's program has been revised");
      },

      // Manually assigns (or clears) a specific day in the week, from the
      // program picker - independent of the goal/focus-driven generator,
      // since the user is choosing exactly what they want for that slot.
      setDayWorkout: (dayIndex, key) => {
        set(
          produce((st) => {
            st.weekPlan[dayIndex] = key ? { type: 'train', key } : { type: 'rest' };
            if (todayPlanIndex() === dayIndex) {
              const oldGoals = st.today.goals;
              st.today.goals = buildTodayGoals(st.weekPlan).map((g: (typeof oldGoals)[number]) => {
                const prev = oldGoals.find((og: (typeof oldGoals)[number]) => og.id === g.id);
                return prev ? { ...g, done: prev.done } : g;
              });
            }
          }),
        );
      },

      // Marks a day as "don't pre-plan a session - just count whatever
      // real workout shows up in Apple Health", from the same program
      // picker as setDayWorkout. Re-picking this for today also clears
      // any earlier sync/selection, so it doubles as a reset if the
      // wrong activity got picked or the list needs refetching.
      setDayToWatchSync: (dayIndex) => {
        set(
          produce((st) => {
            st.weekPlan[dayIndex] = { type: 'watch' };
            if (todayPlanIndex() === dayIndex) {
              st.today._watchWorkoutSynced = false;
              st.today.selectedWatchWorkouts = undefined;
              st.today.availableWatchWorkouts = undefined;
              const oldGoals = st.today.goals;
              st.today.goals = buildTodayGoals(st.weekPlan).map((g: (typeof oldGoals)[number]) => {
                // Every goal except the watch one keeps its prior done
                // state (revising the plan shouldn't erase hydration/
                // warmup progress already logged today) - the watch goal
                // itself always comes back fresh since this is a reset.
                if (g.id === 'watch_workout') return g;
                const prev = oldGoals.find((og: (typeof oldGoals)[number]) => og.id === g.id);
                return prev ? { ...g, done: prev.done } : g;
              });
            }
          }),
        );
      },

      toggleGoal: (goalId) => {
        const s = get();
        const goal = s.today.goals.find((g) => g.id === goalId);
        if (!goal || goal.done) return;
        set(
          produce((st) => {
            const g = st.today.goals.find((x: { id: string }) => x.id === goalId)!;
            g.done = true;
            st.today.dayHadCompletion = true;
          }),
        );
        awardXP(goal.xp, goal.label);
        updateStreakOnActivity();
      },

      submitFeelingLog: (text) => {
        set(
          produce((st) => {
            st.today.feelingText = text;
          }),
        );
        get().toggleGoal('logfeel');
      },

      // Drives HydrationBar - tracks the live dragged amount separately
      // from the one-time "hit the target" award, so dragging back down
      // later (correcting an overcount) never claws back XP already
      // earned, same as every other goal never un-completing.
      setHydration: (ml) => {
        const s = get();
        const goal = s.today.goals.find((g) => g.id === 'hydration');
        const alreadyDone = !!goal?.done;
        const clamped = Math.max(0, Math.min(HYDRATION_TARGET_ML, ml));
        set(
          produce((st) => {
            st.today.hydrationMl = clamped;
          }),
        );
        if (!alreadyDone && goal && clamped >= HYDRATION_TARGET_ML) {
          set(
            produce((st) => {
              const g = st.today.goals.find((x: { id: string }) => x.id === 'hydration');
              if (g) g.done = true;
              st.today.dayHadCompletion = true;
            }),
          );
          awardXP(goal.xp, goal.label);
          updateStreakOnActivity();
        }
      },

      syncHealthMetrics: (metrics) => {
        const s = get();
        const alreadyAwarded = !!s.today._stepsGoalAwarded;
        set(
          produce((st) => {
            st.today.health = metrics;
          }),
        );
        if (!alreadyAwarded && metrics.steps >= STEP_GOAL) {
          set(
            produce((st) => {
              st.today._stepsGoalAwarded = true;
              st.today.dayHadCompletion = true;
            }),
          );
          awardXP(STEP_GOAL_XP, 'Hit step goal');
          updateStreakOnActivity();
        }
      },

      // The true month-to-date total straight from HealthKit (see
      // health.ts's getMonthlySteps) - overwrites rather than accumulates,
      // since the native query already covers the whole month including
      // today, so there's nothing to add on top of it.
      setMonthlySteps: (steps) =>
        set(
          produce((st) => {
            st.progress.monthlySteps = steps;
          }),
        ),

      toggleExercise: (exIndex) =>
        set(
          produce((s) => {
            const wid = s.viewingWorkout;
            if (!wid) return;
            const ws = s.workoutState[s.simDay][wid];
            ws.exDone[exIndex] = !ws.exDone[exIndex];
          }),
        ),

      toggleSet: (exIndex, setIndex) =>
        set(
          produce((s) => {
            const wid = s.viewingWorkout;
            if (!wid) return;
            const ws = s.workoutState[s.simDay][wid];
            ws.setDone = ws.setDone ?? {};
            const key = setKey(exIndex, setIndex);
            ws.setDone[key] = !ws.setDone[key];
            syncExerciseDone(ws, wid);
          }),
        ),

      toggleSkip: (exIndex) =>
        set(
          produce((s) => {
            const wid = s.viewingWorkout;
            if (!wid) return;
            const ws = s.workoutState[s.simDay][wid];
            ws.skipped = ws.skipped ?? {};
            ws.skipped[exIndex] = !ws.skipped[exIndex];
            syncExerciseDone(ws, wid);
          }),
        ),

      finishWorkout: (wid) => {
        const s = get();
        const ws = s.workoutState[s.simDay]?.[wid];
        if (!ws || ws.completed) return;
        set(
          produce((st) => {
            st.workoutState[st.simDay][wid].completed = true;
            st.stats_workoutsDone += 1;
            const wg = st.today.goals.find((g: { id: string }) => g.id === 'workout');
            if (wg) wg.done = true;
            st.today.dayHadCompletion = true;
            const bumps = statBumpFor(wid);
            Object.entries(bumps).forEach(([k, v]) => {
              const key = k as keyof typeof st.progress.stats;
              st.progress.stats[key] = Math.min(99, st.progress.stats[key] + (v || 0));
            });
          }),
        );
        awardXP(40, `${getWorkout(wid)?.name || 'Workout'} completed`);
        updateStreakOnActivity();
        bumpChallengeProgress('consistency', 1);
        checkAchievements();
      },

      // A workout logged via the Watch's own Fitness app (or any other
      // app writing to HealthKit) never goes through finishWorkout, so it
      // wouldn't otherwise be noticed - this is the Watch-side equivalent,
      // triggered once real workout data shows up for today.
      syncWatchWorkout: (workouts) => {
        const s = get();
        const plan = s.weekPlan[todayPlanIndex()];

        // 'watch' days have no preset to match against, and there can be
        // more than one real activity today (e.g. two separate indoor
        // walks) - offer the full list rather than silently guessing
        // which one the user means. Keeps refreshing on every app open/
        // foreground even after some picks are made, since more real
        // activities can still show up later in the day.
        if (plan.type === 'watch') {
          const listed = workouts.map((w) => ({
            uuid: w.uuid,
            activityName: w.activityName,
            startDate: w.startDate,
            durationMinutes: w.durationMinutes,
            kcal: w.kcal,
            distanceMeters: w.distanceMeters,
          }));
          // First time we see a logged Watch workout today, it counts on its
          // own (the goal says so) - once. Anything logged later still shows
          // in the list for the user to pick, same as before.
          const autoCount = !s.today._watchWorkoutSynced && listed.length > 0;
          set(
            produce((st) => {
              st.today.availableWatchWorkouts = listed;
              // Already-selected picks stay selected across a refresh (a
              // later foreground shouldn't silently drop the user's
              // choice) - but their data still needs to come from this
              // fresh read, matched by startDate, so a pick made before a
              // fix like the native distance/uuid read landed doesn't
              // stay stuck on the old incomplete snapshot forever.
              if (st.today.selectedWatchWorkouts?.length) {
                st.today.selectedWatchWorkouts = st.today.selectedWatchWorkouts.map(
                  (sel: { startDate: string }) => listed.find((w) => w.startDate === sel.startDate) ?? sel,
                );
              }
              if (!autoCount) return;
              st.today.selectedWatchWorkouts = listed;
              st.today._watchWorkoutSynced = true;
              const wg = st.today.goals.find((g: { id: string }) => g.id === 'watch_workout');
              if (wg) wg.done = true;
              st.today.dayHadCompletion = true;
              st.stats_workoutsDone += 1;
              st.progress.stats.endurance = Math.min(99, st.progress.stats.endurance + 0.8);
              st.progress.stats.vitality = Math.min(99, st.progress.stats.vitality + 0.4);
            }),
          );
          if (autoCount) {
            awardXP(40, `${listed[0].activityName} synced from Apple Fitness`);
            updateStreakOnActivity();
            bumpChallengeProgress('consistency', 1);
            checkAchievements();
            get().showToast(`Synced "${listed[0].activityName}" from Apple Fitness`);
          }
          return;
        }

        if (s.today._watchWorkoutSynced || workouts.length === 0) return;
        // Otherwise, only auto-completes today's already-assigned preset
        // session (if any and not already done) - a Watch workout on a
        // plain rest day has nothing to attach to.
        if (plan.type !== 'train' || !plan.key) return;
        const wid = plan.key;
        const ws = s.workoutState[s.simDay]?.[wid];
        if (ws?.completed) return;
        const w = getWorkout(wid);
        if (!w) return;

        set(
          produce((st) => {
            st.today._watchWorkoutSynced = true;
            if (!st.workoutState[st.simDay]) st.workoutState[st.simDay] = {};
            const exDone: Record<number, boolean> = {};
            w.exercises.forEach((_, i) => { exDone[i] = true; });
            st.workoutState[st.simDay][wid] = { exDone, completed: true };
            st.stats_workoutsDone += 1;
            const wg = st.today.goals.find((g: { id: string }) => g.id === 'workout');
            if (wg) wg.done = true;
            st.today.dayHadCompletion = true;
            const bumps = statBumpFor(wid);
            Object.entries(bumps).forEach(([k, v]) => {
              const key = k as keyof typeof st.progress.stats;
              st.progress.stats[key] = Math.min(99, st.progress.stats[key] + (v || 0));
            });
          }),
        );
        awardXP(40, `${w.name} synced from Apple Fitness`);
        updateStreakOnActivity();
        bumpChallengeProgress('consistency', 1);
        checkAchievements();
        get().showToast(`Synced "${workouts[0].activityName}" from Apple Fitness`);
      },

      // Toggles one activity in/out of today's picks - the user can select
      // more than one (e.g. two separate indoor walks both count). XP
      // only awards once, the first time the selection goes from none to
      // one or more; later toggling (adding more, or deselecting some)
      // just updates which ones are recorded, no re-award or clawback.
      toggleWatchWorkoutSelection: (workout) => {
        const s = get();
        const selected = s.today.selectedWatchWorkouts ?? [];
        const already = selected.some((w) => w.startDate === workout.startDate);
        const next = already ? selected.filter((w) => w.startDate !== workout.startDate) : [...selected, workout];
        const wasEmpty = selected.length === 0;

        set(
          produce((st) => {
            st.today.selectedWatchWorkouts = next;
          }),
        );

        if (!already && wasEmpty) {
          set(
            produce((st) => {
              st.today._watchWorkoutSynced = true;
              const wg = st.today.goals.find((g: { id: string }) => g.id === 'watch_workout');
              if (wg) wg.done = true;
              st.today.dayHadCompletion = true;
              st.stats_workoutsDone += 1;
              st.progress.stats.endurance = Math.min(99, st.progress.stats.endurance + 0.8);
              st.progress.stats.vitality = Math.min(99, st.progress.stats.vitality + 0.4);
            }),
          );
          awardXP(40, `${workout.activityName} synced from Apple Fitness`);
          updateStreakOnActivity();
          bumpChallengeProgress('consistency', 1);
          checkAchievements();
          get().showToast(`Synced "${workout.activityName}" from Apple Fitness`);
        }
      },

      joinChallenge: (id) => {
        const list = withAllChallenges(get().challenges);
        const def = CHALLENGE_DEFS.find((d) => d.id === id)!;
        if (activeChallengeCount(list) >= MAX_ACTIVE_CHALLENGES) {
          get().showToast(`You can run ${MAX_ACTIVE_CHALLENGES} challenges at once - leave one first`);
          return;
        }
        set(
          produce((s) => {
            s.challenges = withAllChallenges(s.challenges);
            const c = s.challenges.find((x: { id: string }) => x.id === id)!;
            c.joined = true;
          }),
        );
        get().showToast(`Joined ${def.name}`);
        checkAchievements();
      },
      leaveChallenge: (id) => {
        set(
          produce((s) => {
            s.challenges = withAllChallenges(s.challenges);
            const c = s.challenges.find((x: { id: string }) => x.id === id)!;
            if (c.completed) return;
            c.joined = false;
            c.progress = 0;
          }),
        );
      },
      prestige: () => {
        const cur = get().progress;
        if (cur.level < MAX_LEVEL) {
          get().showToast(`Reach level ${MAX_LEVEL} to evolve`);
          return;
        }
        const next = (cur.prestige ?? 0) + 1;
        set(
          produce((st) => {
            st.progress.prestige = next;
            st.progress.totalXP = 0;
            st.progress.level = 1;
          }),
        );
        get().showToast(`Evolved ${next}x! New skins and colours unlocked`);
        checkAchievements();
      },
      setFriendCount: (count) => {
        if (get().progress.friendCount === count) return;
        set(produce((st) => { st.progress.friendCount = count; }));
        checkAchievements();
      },
      logChallenge: (id) => {
        const def = CHALLENGE_DEFS.find((d) => d.id === id);
        if (!def?.logStep) return;
        bumpChallengeProgress(id, def.logStep);
      },
      // A verified weigh-in (logWeight already confirmed it against the
      // goal) earns flat XP same as hitting a daily goal; actually reaching
      // the target earns a one-off bonus on top, scaled like a challenge
      // completion since a weight goal runs for months, not days.
      awardWeightGoalXP: (label, opts) => {
        awardXP(WEIGHT_LOG_XP, label, { ignoreCap: true });
        if (opts?.completed) awardXP(WEIGHT_GOAL_BONUS_XP, `${label} - goal reached`, { ignoreCap: true });
        checkAchievements();
      },
      // Performance goals (distance-time PBs, cumulative distance, frequency)
      // are verified automatically from real synced Apple Health activity -
      // see fitnessGoals.ts's recordActivityForGoals, called from App.tsx
      // whenever new workouts come in. amount is per-credit XP (small,
      // uncapped like a daily goal) separate from the one-off completion
      // bonus, mirroring the weight-goal and challenge-completion shape.
      awardFitnessGoalXP: (label, amount, opts) => {
        awardXP(amount, label, { ignoreCap: true });
        if (opts?.completed) awardXP(FITNESS_GOAL_BONUS_XP, `${label} - goal reached`, { ignoreCap: true });
        checkAchievements();
      },
      // The only legitimate way 'cardio' progress moves now - km comes
      // straight from HealthKit (see health.ts's getMonthlyCardioKm), never
      // self-reported. Sets progress directly to the real monthly total
      // rather than only ever ratcheting forward - a forward-only ratchet
      // sounds safe but actually means a single bad write (the old
      // fakeable manual-log value, a stale push from a device that hadn't
      // picked up a fix yet) gets stuck forever, since no later real
      // reading can ever be allowed to correct it back down. The only
      // real failure mode worth guarding is a query that fails outright -
      // the native side already resolves that to 0, so skipping zero/
      // negative reads here is enough to avoid wiping real progress from
      // a transient HealthKit error.
      syncCardioKm: (km) => {
        const c = get().challenges.find((x) => x.id === 'cardio');
        if (!c || !c.joined || c.completed || km <= 0) return;
        if (km !== c.progress) bumpChallengeProgress('cardio', km - c.progress);
      },

      updateCharacterField: (key, value) => {
        const s = get();
        if (!s.character) return;
        if (key === 'skin') {
          set(produce((st) => { st.character!.skin = value as number; }));
          return;
        }
        if (key === 'base') {
          set(produce((st) => { st.character!.base = value as 'female' | 'male'; }));
          return;
        }
        if (key === 'build') {
          set(produce((st) => { st.character!.build = value as CharacterConfig['build']; }));
          return;
        }
        set(produce((st) => { (st.character as any)[key] = value; }));
      },

      toggleSetting: (key) =>
        set(
          produce((s) => {
            s.settings[key] = !s.settings[key];
          }),
        ),
      setTheme: (theme) => set(produce((s) => { s.settings.theme = theme; })),

      advanceDay: () => {
        const s = get();
        if (!s.today.dayHadCompletion) {
          set(produce((st) => { st.progress.currentStreak = 0; }));
          get().showToast('No activity yesterday — streak reset');
        } else {
          get().showToast('New day started');
        }
        set(
          produce((st) => {
            st.simDay += 1;
            st.today = { forDay: st.simDay, goals: buildTodayGoals(st.weekPlan), dayHadCompletion: false, xpEarnedToday: 0 };
            st.workoutState[st.simDay] = st.workoutState[st.simDay] || {};
          }),
        );
      },
      // Real testers have no "simulate next day" button anymore - this is
      // what actually moves the program/streak forward now, driven by the
      // device's real calendar date rather than a manual click.
      checkForNewDay: () => {
        const s = get();
        if (!s.onboarded) return;
        const today = todayISO();
        if (today === s.lastActiveDate) return;
        const elapsed = Math.max(
          1,
          Math.round((new Date(today).getTime() - new Date(s.lastActiveDate).getTime()) / 86_400_000),
        );
        for (let i = 0; i < elapsed; i++) get().advanceDay();
        const newMonthStart = monthStartOf(today);
        set(
          produce((st) => {
            st.lastActiveDate = today;
            if (newMonthStart !== st.progress.monthStart) {
              st.progress.monthlyXP = st.progress.monthStart ? 0 : st.progress.totalXP;
              // monthlySteps is NOT reconstructed day-by-day here - it's the
              // true month-to-date total queried directly from HealthKit
              // (see App.tsx's health sync effect / setMonthlySteps), which
              // is authoritative and self-corrects at the month boundary on
              // its own. Reset to 0 here only matters for platforms with no
              // HealthKit source (web), where nothing else will ever set it.
              st.progress.monthlySteps = 0;
              st.progress.monthStart = newMonthStart;
            }
          }),
        );
      },
      resetDemo: () => set({ ...defaultAppState(), toast: null, levelUp: null }),

      showToast: (message) => {
        toastCounter += 1;
        const id = toastCounter;
        set({ toast: { id, message } });
      },
      clearToast: () => set({ toast: null }),
      clearLevelUp: () => set({ levelUp: null }),
    }),
    {
      name: 'somax_state_v1',
      partialize: ({ toast: _toast, levelUp: _levelUp, ...rest }) => rest,
      // v1 -> v2: `goal` changed from a single string to a multi-select
      // string[] (onboarding + profile). Existing saved profiles still
      // have the old string shape, which crashes anything calling
      // .join()/.includes() on it - coerce on load instead of requiring
      // everyone to reset their demo data.
      version: 9,
      migrate: (persisted) => {
        const s = persisted as any;
        const toGoalArray = (g: unknown) => (Array.isArray(g) ? g : typeof g === 'string' && g ? [g] : []);
        if (s?.profile) s.profile.goal = toGoalArray(s.profile.goal);
        if (s?.onbDraft) s.onbDraft.goal = toGoalArray(s.onbDraft.goal);
        // `focus` (gym/running/hybrid) is new - default existing profiles
        // to 'gym', matching the only modality that existed before this.
        if (s?.profile && !s.profile.focus) s.profile.focus = 'gym';
        if (s?.onbDraft && !s.onbDraft.focus) s.onbDraft.focus = '';
        // `weekPlan` is new - existing saved states predate it entirely.
        // Derive it from the saved profile so returning users keep the
        // same fixed rotation they've been on rather than a re-roll.
        if (!Array.isArray(s?.weekPlan)) {
          s.weekPlan = s?.profile ? generateWeekPlan(s.profile.availability, s.profile.goal, s.profile.focus) : generateWeekPlan('4', []);
        }
        // `lastActiveDate` is new (replaces the manual "simulate next day"
        // button for real testers) - assume "seen just now" rather than
        // triggering a burst of catch-up day-advances for existing users.
        if (!s?.lastActiveDate) s.lastActiveDate = todayISO();
        if (s) s.challenges = withAllChallenges(s.challenges);
        if (s?.progress && typeof s.progress.prestige !== 'number') s.progress.prestige = 0;
        if (s?.progress && typeof s.progress.monthlyXP !== 'number') {
          s.progress.monthlyXP = s.progress.totalXP ?? 0;
          s.progress.monthStart = monthStartOf(todayISO());
        }
        // `monthlySteps` is new - no historical step data to backfill, so
        // existing users just start this month's steps count from 0.
        if (s?.progress && typeof s.progress.monthlySteps !== 'number') {
          s.progress.monthlySteps = 0;
        }
        // `privateProfile` is new - default existing users to public (how
        // profiles have always behaved) rather than silently locking them.
        if (s?.settings && typeof s.settings.privateProfile !== 'boolean') {
          s.settings.privateProfile = false;
        }
        if (s?.settings && !s.settings.theme) {
          s.settings.theme = 'system';
        }
        return s;
      },
    },
  ),
);

function awardXP(amount: number, label: string, opts: { ignoreCap?: boolean } = {}) {
  const s = useAppStore.getState();
  const remainingCap = Math.max(0, DAILY_CAP - s.today.xpEarnedToday);
  const awarded = opts.ignoreCap ? amount : Math.min(amount, remainingCap);
  const capped = !opts.ignoreCap && awarded < amount;
  if (awarded <= 0 && !opts.ignoreCap) {
    s.showToast('Daily XP cap reached — resets tomorrow');
    return 0;
  }
  const beforeLevel = levelFromXP(s.progress.totalXP);
  useAppStore.setState(
    produce((st) => {
      st.progress.totalXP += awarded;
      // Cloud-synced saves skip the local persist migration, so tolerate a
      // missing monthly total here as well.
      st.progress.monthlyXP = (st.progress.monthlyXP || 0) + awarded;
      st.today.xpEarnedToday += awarded;
      st.coins += Math.round(awarded / 4);
      const afterLevel = levelFromXP(st.progress.totalXP);
      st.progress.level = afterLevel;
      st.history.unshift({ type: 'xp', label, xp: awarded, day: st.simDay, at: new Date().toISOString() });
      if (st.history.length > 60) st.history.pop();
    }),
  );
  const afterLevel = levelFromXP(useAppStore.getState().progress.totalXP);
  if (afterLevel > beforeLevel) {
    levelUpCounter += 1;
    const id = levelUpCounter;
    setTimeout(() => useAppStore.setState({ levelUp: { id, level: afterLevel } }), 260);
  }
  if (capped) useAppStore.getState().showToast(`+${awarded} XP (daily cap reached)`);
  checkAchievements();
  return awarded;
}

function updateStreakOnActivity() {
  const s = useAppStore.getState();
  if (s.today.dayHadCompletion && s.today._streakCounted !== s.simDay) {
    useAppStore.setState(
      produce((st) => {
        st.progress.currentStreak += 1;
        st.progress.longestStreak = Math.max(st.progress.longestStreak, st.progress.currentStreak);
        st.today._streakCounted = st.simDay;
      }),
    );
    checkAchievements();
  }
}

function bumpChallengeProgress(id: string, amount: number) {
  const s = useAppStore.getState();
  const c = s.challenges.find((x) => x.id === id);
  const def = CHALLENGE_DEFS.find((d) => d.id === id);
  if (!c || !def || !c.joined || c.completed) return;
  useAppStore.setState(
    produce((st) => {
      const cc = st.challenges.find((x: { id: string }) => x.id === id)!;
      cc.progress = Math.min(def.target, cc.progress + amount);
    }),
  );
  const xpGain = Math.round(amount * def.xpPerUnit);
  if (xpGain > 0) {
    awardXP(xpGain, `${def.name} progress`, { ignoreCap: true });
  }
  const updated = useAppStore.getState().challenges.find((x) => x.id === id)!;
  if (updated.progress >= def.target && !updated.completed) {
    useAppStore.setState(
      produce((st) => {
        const cc = st.challenges.find((x: { id: string }) => x.id === id)!;
        cc.completed = true;
      }),
    );
    awardXP(def.bonusXp, `${def.name} complete`, { ignoreCap: true });
    useAppStore.getState().showToast(`${def.name} complete! +${def.bonusXp} bonus XP`);
    checkAchievements();
  }
}

function checkAchievements() {
  const s = useAppStore.getState();
  ACHIEVEMENT_DEFS.forEach((a) => {
    if (!s.achievements[a.id] && a.test(s)) {
      useAppStore.setState(produce((st) => { st.achievements[a.id] = true; }));
      useAppStore.getState().showToast(`Achievement unlocked: ${a.name} · +${a.xp} XP`);
      if (a.xp > 0) awardXP(a.xp, `Achievement: ${a.name}`, { ignoreCap: true });
    }
  });
}
