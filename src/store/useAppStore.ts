import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { produce } from 'immer';
import { ACHIEVEMENT_DEFS } from '../data/achievements';
import { CHALLENGE_DEFS } from '../data/challenges';
import { WORKOUTS } from '../data/workouts';
import { statBumpFor } from '../data/workouts';
import { defaultCharacter } from '../lib/character';
import { buildTodayGoals, generateWeekPlan, isWorkoutDone, reviseWeekPlanFrom, todayPlan, todayPlanIndex } from '../lib/schedule';
import { DAILY_CAP, levelFromXP } from '../lib/xp';
import type {
  AppState,
  CatalogKey,
  ChallengeState,
  CharacterConfig,
  DisplayMode,
  OnboardingDraft,
  PlayTab,
  Route,
  Settings,
  StudioCat,
  TrainingFocus,
} from '../types';

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
  return CHALLENGE_DEFS.map((c) => ({ id: c.id, joined: false, progress: 0, completed: false, pushupLog: 0 }));
}

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
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
    mode: 'classic',
    simDay,
    lastActiveDate: todayISO(),
    profile: null,
    progress: {
      totalXP: 0,
      level: 1,
      currentStreak: 0,
      longestStreak: 0,
      stats: { strength: 8, endurance: 8, agility: 8, vitality: 10, recovery: 9, discipline: 8 },
    },
    stats_workoutsDone: 0,
    today: { forDay: simDay, goals: buildTodayGoals(simDay, weekPlan), dayHadCompletion: false, xpEarnedToday: 0 },
    weekPlan,
    workoutState: { [simDay]: {} },
    history: [],
    challenges: defaultChallengeStates(),
    coins: 0,
    achievements: {},
    settings: { notifWorkout: true, notifStreak: true, notifLeague: false, notifChallenge: true },
    viewingWorkout: null,
    viewingCharacter: false,
    viewingDM: null,
    viewingWorkoutEditor: null,
    viewingSharedProgram: null,
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
  openDM: (userId: string, name: string) => void;
  closeDM: () => void;
  openWorkoutEditor: (sourceKey: string | 'new') => void;
  closeWorkoutEditor: () => void;
  openSharedProgram: (id: string) => void;
  closeSharedProgram: () => void;
  setMode: (mode: DisplayMode) => void;
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
  setProfileFocus: (focus: TrainingFocus) => void;
  reviseWeekPlan: () => void;
  setDayWorkout: (dayIndex: number, key: string | null) => void;

  toggleGoal: (goalId: string) => void;
  toggleExercise: (exIndex: number) => void;
  finishWorkout: (wid: string) => void;

  joinChallenge: (id: string) => void;
  logPushups: (id: string) => void;

  updateCharacterField: (key: CatalogKey | 'base' | 'build' | 'skin' | 'hairColor', value: string | number) => void;

  toggleSetting: (key: keyof Settings) => void;

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
          viewingDM: null,
          viewingWorkoutEditor: null,
          viewingSharedProgram: null,
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
      openDM: (userId, name) => set({ viewingDM: { userId, name } }),
      closeDM: () => set({ viewingDM: null }),
      // Opening the editor replaces whatever workout view launched it
      // (WorkoutScreen's Edit button, or Train's own program list) rather
      // than stacking on top of it - closing lands back on the route
      // underneath instead of an intermediate workout view.
      openWorkoutEditor: (sourceKey) => set({ viewingWorkoutEditor: sourceKey, viewingWorkout: null }),
      closeWorkoutEditor: () => set({ viewingWorkoutEditor: null, viewingWorkout: null }),
      openSharedProgram: (id) => set({ viewingSharedProgram: id }),
      closeSharedProgram: () => set({ viewingSharedProgram: null }),
      setMode: (mode) => set({ mode }),
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
            s.today = { forDay: s.simDay, goals: buildTodayGoals(s.simDay, weekPlan), dayHadCompletion: false, xpEarnedToday: 0 };
            s.onboarded = true;
            s.history.unshift({ type: 'system', label: 'Profile created', xp: 0, day: s.simDay });
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
        // Only redistribute training days from today onward - days
        // earlier in this 7-day cycle already happened and shouldn't be
        // rewritten by a preference change made mid-week.
        const fromIdx = todayPlanIndex(s.simDay);
        const weekPlan = reviseWeekPlanFrom(s.weekPlan, fromIdx, s.profile.availability, s.profile.goal, s.profile.focus);
        set(
          produce((st) => {
            st.weekPlan = weekPlan;
            // Rebuild today's goals against the revised plan (today's
            // workout type may have changed), but keep anything already
            // completed marked done - revising the plan shouldn't erase
            // progress already logged today.
            const oldGoals = st.today.goals;
            st.today.goals = buildTodayGoals(st.simDay, weekPlan).map((g: (typeof oldGoals)[number]) => {
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
            if (todayPlanIndex(st.simDay) === dayIndex) {
              const oldGoals = st.today.goals;
              st.today.goals = buildTodayGoals(st.simDay, st.weekPlan).map((g: (typeof oldGoals)[number]) => {
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

      toggleExercise: (exIndex) =>
        set(
          produce((s) => {
            const wid = s.viewingWorkout;
            if (!wid) return;
            const ws = s.workoutState[s.simDay][wid];
            ws.exDone[exIndex] = !ws.exDone[exIndex];
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
        awardXP(40, `${WORKOUTS[wid].name} completed`);
        updateStreakOnActivity();
        bumpChallengeProgress('consistency', 1);
        checkAchievements();
      },

      joinChallenge: (id) => {
        set(
          produce((s) => {
            const c = s.challenges.find((x: { id: string }) => x.id === id)!;
            c.joined = true;
          }),
        );
        const def = CHALLENGE_DEFS.find((d) => d.id === id)!;
        get().showToast(`Joined ${def.name}`);
        checkAchievements();
      },
      logPushups: (id) => bumpChallengeProgress(id, 10),

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

      advanceDay: () => {
        const s = get();
        if (!s.today.dayHadCompletion) {
          set(produce((st) => { st.progress.currentStreak = 0; }));
          get().showToast('No activity yesterday — streak reset');
        } else {
          get().showToast(`Day ${s.simDay + 2} begins`);
        }
        set(
          produce((st) => {
            st.simDay += 1;
            st.today = { forDay: st.simDay, goals: buildTodayGoals(st.simDay, st.weekPlan), dayHadCompletion: false, xpEarnedToday: 0 };
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
        set(produce((st) => { st.lastActiveDate = today; }));
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
      version: 4,
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
      st.today.xpEarnedToday += awarded;
      st.coins += Math.round(awarded / 4);
      const afterLevel = levelFromXP(st.progress.totalXP);
      st.progress.level = afterLevel;
      st.history.unshift({ type: 'xp', label, xp: awarded, day: st.simDay });
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
      useAppStore.getState().showToast(`Achievement unlocked: ${a.name}`);
    }
  });
}

export { todayPlan, isWorkoutDone };
