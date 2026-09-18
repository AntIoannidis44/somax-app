export type CharacterBase = 'female' | 'male';
export type BodyBuild = 'superhero' | 'regular' | 'teen';

export interface CharacterConfig {
  base: CharacterBase;
  build: BodyBuild;
  skin: number;
  hair: string;
  hairColor: number;
  outfit: string;
}

export interface UnlockRule {
  level?: number;
  streak?: number;
}

export interface CatalogItem {
  id: string;
  name: string;
  unlock?: UnlockRule;
}

export interface HairItem extends CatalogItem {
  // omitted = applies to both genders (e.g. "None")
  base?: CharacterBase;
}

export interface OutfitItem extends CatalogItem {}

export type CatalogKey = 'hair' | 'outfit' | 'build';

export interface CharTier {
  min: number;
  name: string;
  c1: string;
  c2: string;
}

export type Goal = 'Build strength' | 'Lose fat' | 'General fitness' | 'Endurance' | 'Muscle gain' | string;
export type Experience = 'Beginner' | 'Intermediate' | 'Advanced' | string;

export type TrainingFocus = 'gym' | 'running' | 'hybrid';

export interface OnboardingDraft {
  name: string;
  age: string;
  height: string;
  weight: string;
  goal: string[];
  focus: TrainingFocus | '';
  experience: string;
  availability: string;
  equipment: string[];
  character: CharacterConfig | null;
}

export interface Profile {
  name: string;
  age: string;
  height: string;
  weight: string;
  goal: string[];
  focus: TrainingFocus;
  experience: string;
  availability: string;
  equipment: string[];
  program: { name: string };
}

export interface Stats {
  strength: number;
  endurance: number;
  agility: number;
  vitality: number;
  recovery: number;
  discipline: number;
}

export interface Progress {
  totalXP: number;
  level: number;
  currentStreak: number;
  longestStreak: number;
  stats: Stats;
}

export type GoalType = 'workout' | 'toggle';

export interface TodayGoal {
  id: string;
  label: string;
  meta: string;
  xp: number;
  type: GoalType;
  done: boolean;
}

export interface TodayState {
  forDay?: number;
  goals: TodayGoal[];
  dayHadCompletion: boolean;
  xpEarnedToday: number;
  _streakCounted?: number;
}

export interface ExerciseDef {
  name: string;
  meta: string;
}

export interface WorkoutDef {
  name: string;
  duration: string;
  exercises: ExerciseDef[];
}

export type PlanDayType = 'train' | 'rest';

export interface PlanDay {
  type: PlanDayType;
  key?: string;
  label?: string;
}

export interface WorkoutSessionState {
  exDone: Record<number, boolean>;
  completed: boolean;
}

export type WorkoutState = Record<number, Record<string, WorkoutSessionState>>;

export interface HistoryEntry {
  type: 'xp' | 'system';
  label: string;
  xp: number;
  day: number;
}

export interface ChallengeDef {
  id: string;
  name: string;
  desc: string;
  lengthDays: number;
  target: number;
  unit: string;
  xpPerUnit: number;
  bonusXp: number;
  logStep?: number;
}

export interface ChallengeState {
  id: string;
  joined: boolean;
  progress: number;
  completed: boolean;
  pushupLog: number;
}

export interface AchievementDef {
  id: string;
  name: string;
  desc: string;
  icon: string;
  test: (s: AppState) => boolean;
}

export interface Settings {
  notifWorkout: boolean;
  notifStreak: boolean;
  notifLeague: boolean;
  notifChallenge: boolean;
}

export type Route = 'home' | 'train' | 'play' | 'community' | 'profile';
export type DisplayMode = 'classic' | 'character';
export type StudioCat = 'base' | 'build' | 'skin' | 'hair' | 'hairColor' | 'outfit';
export type PlayTab = 'challenges' | 'league' | 'achv';

export interface AppState {
  onboarded: boolean;
  onbStep: number;
  onbDraft: OnboardingDraft;
  character: CharacterConfig | null;
  route: Route;
  mode: DisplayMode;
  simDay: number;
  // Real calendar date (YYYY-MM-DD) `simDay` was last advanced for - lets
  // the app detect a new real day has started and auto-advance, now that
  // there's no manual "simulate next day" button for real testers to
  // click. Not used to pick which day-of-week the plan shows (that's
  // still simDay % 7, deliberately independent of the real calendar).
  lastActiveDate: string;
  profile: Profile | null;
  progress: Progress;
  stats_workoutsDone: number;
  today: TodayState;
  weekPlan: PlanDay[];
  workoutState: WorkoutState;
  history: HistoryEntry[];
  challenges: ChallengeState[];
  coins: number;
  achievements: Record<string, boolean>;
  settings: Settings;
  viewingWorkout: string | null;
  viewingCharacter: boolean;
  viewingDM: { userId: string; name: string } | null;
  studioCat: StudioCat;
  playTab: PlayTab;
}
