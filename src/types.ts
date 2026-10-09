import type { PostWorkout } from './lib/social';

export type CharacterBase = 'female' | 'male';
export type BodyBuild = 'superhero' | 'regular' | 'teen';

// What opens the full-screen post composer with - undefined/empty when
// opened from Community's own "Share something" button (nothing to
// prefill), or carrying the exact workout just finished/synced when
// opened from Train's "Post to feed" (locked: true means that workout
// is the whole reason the composer opened and can't be swapped out for
// a different one, only removed by cancelling the post entirely).
export interface PostComposerSeed {
  workout?: PostWorkout;
  locked?: boolean;
  defaultCaption?: string;
  defaultType?: string | null;
}

export interface CharacterConfig {
  base: CharacterBase;
  build: BodyBuild;
  skin: number;
  hair: string;
  hairColor: number;
  outfit: string;
  outfitColor: number;
  // Gym wear, worn with the Default outfit (a fantasy outfit replaces it). Optional so
  // characters saved before gym wear existed load unchanged.
  top?: string;
  bottom?: string;
  shoes?: string;
  // index into GYM_COLORS; 0 (or unset) = the piece's own colour
  topColor?: number;
  bottomColor?: number;
  shoesColor?: number;
}

export interface UnlockRule {
  level?: number;
  streak?: number;
  prestige?: number;
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

export type CatalogKey = 'hair' | 'outfit' | 'build' | 'hairColor' | 'outfitColor' | 'skin' | 'top' | 'bottom' | 'shoes' | 'gymColor';

export interface CharTier {
  min: number;
  name: string;
  c1: string;
  c2: string;
}

export type Goal = 'Build strength' | 'Lose fat' | 'General fitness' | 'Endurance' | 'Muscle gain' | string;
export type Experience = 'Beginner' | 'Intermediate' | 'Advanced' | string;

export type TrainingFocus = 'gym' | 'running' | 'swim' | 'ride' | 'hybrid';

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
  photoUrl?: string | null;
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
  // League standings rank by this month's XP, not lifetime totalXP. Resets
  // to 0 on the 1st of each calendar month (see monthStart).
  monthlyXP: number;
  // ISO date (YYYY-MM-01) of the first day of the current league month, in
  // the device's local calendar.
  monthStart: string;
  // Steps counted on completed days this league month (today's steps, still
  // live in today.health.steps, are added on top for display - see the
  // steps leaderboard). Resets alongside monthlyXP on the 1st.
  monthlySteps: number;
  // Times the character has prestiged. Level and XP reset; unlocks stay.
  prestige: number;
  // Accepted friends, kept in step with the Community tab so achievements can read it.
  friendCount?: number;
}

export type GoalType = 'workout' | 'toggle' | 'watch';

export interface TodayGoal {
  id: string;
  label: string;
  meta: string;
  xp: number;
  type: GoalType;
  done: boolean;
}

export interface HealthMetrics {
  steps: number;
  kcal: number;
  activeMinutes: number;
  hr: number | null;
}

// Minimal shape needed to detect "a workout happened today" from
// HealthKit (e.g. logged via the Watch's own Fitness app) - see
// syncWatchWorkout/selectWatchWorkout in useAppStore.ts.
export interface HealthWorkoutSummary {
  uuid: string;
  activityName: string;
  startDate: string;
  durationMinutes: number;
  kcal: number;
  distanceMeters: number | null;
}

export interface TodayState {
  forDay?: number;
  goals: TodayGoal[];
  dayHadCompletion: boolean;
  xpEarnedToday: number;
  _streakCounted?: number;
  // Real Apple Health data for today, once the native app has synced it -
  // undefined means "not connected / not native", not "zero activity", so
  // the UI can tell those apart instead of showing a false zero.
  health?: HealthMetrics;
  _stepsGoalAwarded?: boolean;
  // Set once at least one Watch-logged workout has been picked for
  // today's session (XP is awarded once, the first time this flips true) -
  // further toggling of selectedWatchWorkouts afterwards doesn't re-award
  // or claw back XP, same as every other goal never un-completing.
  _watchWorkoutSynced?: boolean;
  // Every real Watch/Health workout logged today, offered as a picker on
  // a 'watch' type day so the user chooses which one(s) count (there may
  // be several - e.g. more than one indoor walk) rather than the app
  // silently grabbing the first one back.
  availableWatchWorkouts?: HealthWorkoutSummary[];
  // The user's picks from availableWatchWorkouts - can be more than one;
  // matched against availableWatchWorkouts by startDate.
  selectedWatchWorkouts?: HealthWorkoutSummary[];
  // Manually tracked via the draggable HydrationBar - undefined/0 means
  // none logged yet today.
  hydrationMl?: number;
  // The actual written journal entry behind the 'logfeel' goal - only
  // set once the 25-word minimum is met and submitted (see LogFeelModal).
  feelingText?: string;
}

// One row of a per-set program: its own reps and weight (e.g. a drop set
// where each set has a different load).
export interface SetDef {
  reps: string;
  weight?: string;
}

export interface ExerciseDef {
  name: string;
  sets: number;
  // Freeform so it covers both weight-training ("8", "12/leg") and
  // interval work ("45s", "20 min") with one field rather than a
  // separate exercise "type" per kind of training.
  reps: string;
  weight?: string;
  // For run/swim/ride segments - distance is its own field (not crammed
  // into `reps`) so the editor can label it clearly and a segment can
  // carry sets *and* distance together (e.g. 4 x 400m swim intervals).
  distance?: string;
  // Per-set detail. When present it is the source of truth for reps/weight
  // and its length is the set count; the flat reps/weight fields are then
  // only a fallback for older programs.
  setList?: SetDef[];
  // Exercises sharing a group letter are one superset: they are done back to
  // back, round by round (set 1 of each, then set 2 of each, ...).
  group?: string;
}

export interface WorkoutDef {
  name: string;
  duration: string;
  exercises: ExerciseDef[];
  // One of WORKOUT_TYPES' ids (src/data/workoutTypes.ts) - the icon shown
  // next to this workout, and the tag a feed post gets when it's shared.
  category: string;
}

// 'watch' = "don't pre-plan a session for this day, just count whatever
// real workout shows up in Apple Health" - see syncWatchWorkout.
export type PlanDayType = 'train' | 'rest' | 'watch';

export interface PlanDay {
  type: PlanDayType;
  key?: string;
  label?: string;
}

export interface WorkoutSessionState {
  exDone: Record<number, boolean>;
  // Per-set ticks, keyed "exIndex-setIndex". Optional so older saved
  // sessions (exercise-level ticks only) keep loading.
  setDone?: Record<string, boolean>;
  // Exercises the user chose not to do (time or other reasons). They count
  // as finished for the workout but are shown greyed out, not green.
  skipped?: Record<number, boolean>;
  completed: boolean;
}

export type WorkoutState = Record<number, Record<string, WorkoutSessionState>>;

export interface HistoryEntry {
  type: 'xp' | 'system';
  label: string;
  xp: number;
  day: number;
  // ISO timestamp - added so a friend's profile can show real recent
  // activity with an actual time, not just an internal day-counter that
  // means nothing outside this account. Entries from before this existed
  // simply have no `at` and are filtered out of that view, not backfilled.
  at?: string;
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
  // Set for count-based achievements so the list can show how close you are.
  progress?: { value: (s: AppState) => number; target: number };
  // XP awarded once, on unlock.
  xp: number;
}

export interface Settings {
  notifWorkout: boolean;
  notifStreak: boolean;
  notifLeague: boolean;
  notifChallenge: boolean;
  notifMessages: boolean;
  // Private profile: only accepted friends can open the full profile view
  // (stats, streak, recent activity). Everyone still sees the name/avatar
  // in the feed and leaderboard - this only gates the detail screen.
  privateProfile: boolean;
  // 'system' follows the device's own light/dark setting (the CSS already
  // has a prefers-color-scheme block for this); 'light'/'dark' pins it via
  // the data-theme attribute regardless of the device setting.
  theme: 'system' | 'light' | 'dark';
}

export type Route = 'home' | 'train' | 'play' | 'community' | 'profile';
export type StudioCat = 'base' | 'build' | 'skin' | 'hair' | 'hairColor' | 'outfit' | 'outfitColor' | 'top' | 'bottom' | 'shoes' | 'topColor' | 'bottomColor' | 'shoesColor';
export type PlayTab = 'challenges' | 'league' | 'achv';

export interface AppState {
  onboarded: boolean;
  onbStep: number;
  onbDraft: OnboardingDraft;
  character: CharacterConfig | null;
  route: Route;
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
  // Full-screen goal management (weight + performance goals) - opened from
  // Profile's Goals section, not part of the bottom-nav route switch.
  viewingGoals: boolean;
  viewingDM: { userId: string; name: string } | null;
  viewingGroup: { groupId: string; name: string } | null;
  // A userId being viewed via a full profile screen (tapped from League,
  // Community, or a feed post) - separate from viewingDM, which is the
  // message thread, not the profile itself.
  viewingProfile: string | null;
  // 'new' = blank create mode; a string = fork/edit starting from this
  // workout (a built-in preset key or one of the user's own custom
  // workout ids) - see WorkoutEditorScreen.
  viewingWorkoutEditor: string | 'new' | null;
  // A shared workout id read from a `?program=` link on launch, shown as
  // an import preview before it's copied into the viewer's own programs.
  viewingSharedProgram: string | null;
  // The full-screen post composer (see PostComposerSeed) - null when closed.
  viewingComposer: PostComposerSeed | null;
  // A tapped-into feed post's attached workout/activity, shown full-screen
  // (not a popup - it needs to scroll past the header, past km splits,
  // without being cramped against the top nav).
  viewingSessionDetail: PostWorkout | null;
  studioCat: StudioCat;
  playTab: PlayTab;
}
