import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { produce } from 'immer';
import { ACHIEVEMENT_DEFS } from '../data/achievements';
import { CHALLENGE_DEFS } from '../data/challenges';
import { WORKOUTS } from '../data/workouts';
import { statBumpFor } from '../data/workouts';
import { defaultCharacter } from '../lib/character';
import { buildTodayGoals, isWorkoutDone, todayPlan } from '../lib/schedule';
import { DAILY_CAP, levelFromXP } from '../lib/xp';
import type {
  AppState,
  CatalogKey,
  ChallengeState,
  DisplayMode,
  OnboardingDraft,
  PlayTab,
  Route,
  Settings,
  StudioCat,
} from '../types';

function defaultOnbDraft(): OnboardingDraft {
  return {
    name: '',
    age: '',
    height: '',
    weight: '',
    goal: '',
    experience: '',
    availability: '',
    equipment: [],
    character: null,
  };
}

function defaultChallengeStates(): ChallengeState[] {
  return CHALLENGE_DEFS.map((c) => ({ id: c.id, joined: false, progress: 0, completed: false, pushupLog: 0 }));
}

function defaultAppState(): AppState {
  const simDay = 0;
  return {
    onboarded: false,
    onbStep: 0,
    onbDraft: defaultOnbDraft(),
    character: null,
    route: 'home',
    mode: 'classic',
    simDay,
    profile: null,
    progress: {
      totalXP: 0,
      level: 1,
      currentStreak: 0,
      longestStreak: 0,
      stats: { strength: 8, endurance: 8, agility: 8, vitality: 10, recovery: 9, discipline: 8 },
    },
    stats_workoutsDone: 0,
    today: { forDay: simDay, goals: buildTodayGoals(simDay), dayHadCompletion: false, xpEarnedToday: 0 },
    workoutState: { [simDay]: {} },
    history: [],
    challenges: defaultChallengeStates(),
    leagueXP: 0,
    coins: 0,
    achievements: {},
    cheered: {},
    settings: { notifWorkout: true, notifStreak: true, notifLeague: false, notifChallenge: true },
    viewingWorkout: null,
    viewingCharacter: false,
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
  setMode: (mode: DisplayMode) => void;
  setStudioCat: (cat: StudioCat) => void;
  setPlayTab: (tab: PlayTab) => void;

  setOnbField: (field: keyof OnboardingDraft, value: string) => void;
  toggleOnbMulti: (field: 'equipment', value: string) => void;
  setOnbCharacterBase: (base: 'female' | 'male') => void;
  setOnbCharacterSkin: (skin: number) => void;
  onbNext: () => void;
  onbBack: () => void;
  finishOnboarding: () => void;

  toggleGoal: (goalId: string) => void;
  toggleExercise: (exIndex: number) => void;
  finishWorkout: (wid: string) => void;

  joinChallenge: (id: string) => void;
  logPushups: (id: string) => void;

  updateCharacterField: (key: CatalogKey | 'base' | 'skin', value: string | number) => void;

  cheerFeedItem: (index: number) => void;
  toggleSetting: (key: keyof Settings) => void;

  advanceDay: () => void;
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

      go: (route) => set({ route, viewingWorkout: null, viewingCharacter: false }),
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
        set(
          produce((s) => {
            s.profile = {
              name: d.name.trim(),
              age: d.age,
              height: d.height,
              weight: d.weight,
              goal: d.goal,
              experience: d.experience,
              availability: d.availability,
              equipment: d.equipment,
              program: { name: `${difficulty} Block · Week 1` },
            };
            s.character = d.character || defaultCharacter('female');
            s.onboarded = true;
            s.history.unshift({ type: 'system', label: 'Profile created', xp: 0, day: s.simDay });
          }),
        );
        get().showToast(`Welcome to Somax, ${d.name.trim().split(' ')[0] || 'Athlete'}!`);
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
        set(produce((st) => { (st.character as any)[key] = value; }));
      },

      cheerFeedItem: (index) =>
        set(
          produce((s) => {
            s.cheered[index] = !s.cheered[index];
          }),
        ),
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
            st.today = { forDay: st.simDay, goals: buildTodayGoals(st.simDay), dayHadCompletion: false, xpEarnedToday: 0 };
            st.workoutState[st.simDay] = st.workoutState[st.simDay] || {};
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
    { name: 'somax_state_v1', partialize: ({ toast: _toast, levelUp: _levelUp, ...rest }) => rest },
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
    useAppStore.setState(produce((st) => { st.leagueXP += xpGain; }));
    awardXP(xpGain, `${def.name} progress`, { ignoreCap: true });
  }
  const updated = useAppStore.getState().challenges.find((x) => x.id === id)!;
  if (updated.progress >= def.target && !updated.completed) {
    useAppStore.setState(
      produce((st) => {
        const cc = st.challenges.find((x: { id: string }) => x.id === id)!;
        cc.completed = true;
        st.leagueXP += def.bonusXp;
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
