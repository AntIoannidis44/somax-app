import { useEffect, useState } from 'react';
import { App as CapacitorApp } from '@capacitor/app';
import { Sitebar } from './components/layout/Sitebar';
import { AboutModal } from './components/layout/AboutModal';
import { DeviceShell } from './components/layout/DeviceShell';
import { AuthScreen } from './components/auth/AuthScreen';
import { OnboardingFlow } from './components/onboarding/OnboardingFlow';
import { HomeScreen } from './components/home/HomeScreen';
import { TrainScreen } from './components/train/TrainScreen';
import { WorkoutScreen } from './components/train/WorkoutScreen';
import { PlayScreen } from './components/play/PlayScreen';
import { CommunityScreen } from './components/community/CommunityScreen';
import { ProfileScreen } from './components/profile/ProfileScreen';
import { CharacterStudioScreen } from './components/character/CharacterStudioScreen';
import { GoalsScreen } from './components/goals/GoalsScreen';
import { DMScreen } from './components/community/DMScreen';
import { GroupChatScreen } from './components/community/GroupChatScreen';
import { ProfileViewScreen } from './components/community/ProfileViewScreen';
import { WorkoutEditorScreen } from './components/train/WorkoutEditorScreen';
import { SharedProgramScreen } from './components/train/SharedProgramScreen';
import { PostComposerScreen } from './components/community/PostComposerScreen';
import { WorkoutSessionDetail } from './components/train/WorkoutSessionDetail';
import { useAppStore } from './store/useAppStore';
import { useSession, useUserId } from './lib/useSession';
import {
  healthAvailableOnPlatform,
  requestHealthAuthorization,
  getTodayHealthSummary,
  getMonthlySteps,
  getMonthlyCardioKm,
  getLatestHeartRate,
  getTodayWorkouts,
} from './lib/health';
import { syncLocalReminders } from './lib/notifications';
import { registerForPush } from './lib/push';
import { todayPlan, isWorkoutDone } from './lib/schedule';
import { categoryForActivityName } from './data/workoutTypes';
import { recordActivityForGoals } from './lib/fitnessGoals';

function CurrentScreen() {
  const onboarded = useAppStore((s) => s.onboarded);
  const viewingWorkout = useAppStore((s) => s.viewingWorkout);
  const viewingCharacter = useAppStore((s) => s.viewingCharacter);
  const viewingGoals = useAppStore((s) => s.viewingGoals);
  const viewingDM = useAppStore((s) => s.viewingDM);
  const viewingGroup = useAppStore((s) => s.viewingGroup);
  const viewingProfile = useAppStore((s) => s.viewingProfile);
  const viewingWorkoutEditor = useAppStore((s) => s.viewingWorkoutEditor);
  const viewingSharedProgram = useAppStore((s) => s.viewingSharedProgram);
  const viewingComposer = useAppStore((s) => s.viewingComposer);
  const viewingSessionDetail = useAppStore((s) => s.viewingSessionDetail);
  const route = useAppStore((s) => s.route);

  if (!onboarded) return <OnboardingFlow />;
  if (viewingWorkout) return <WorkoutScreen />;
  if (viewingCharacter) return <CharacterStudioScreen />;
  if (viewingGoals) return <GoalsScreen />;
  // Checked before viewingDM/viewingGroup/viewingProfile: tapping "View" on a
  // shared activity inside one of those screens sets this flag without
  // clearing them, so it must win the check or the screen never switches.
  if (viewingSessionDetail) return <WorkoutSessionDetail />;
  if (viewingDM) return <DMScreen />;
  if (viewingGroup) return <GroupChatScreen />;
  if (viewingProfile) return <ProfileViewScreen />;
  if (viewingWorkoutEditor) return <WorkoutEditorScreen />;
  if (viewingSharedProgram) return <SharedProgramScreen />;
  if (viewingComposer) return <PostComposerScreen />;

  switch (route) {
    case 'home':
      return <HomeScreen />;
    case 'train':
      return <TrainScreen />;
    case 'play':
      return <PlayScreen />;
    case 'community':
      return <CommunityScreen />;
    case 'profile':
      return <ProfileScreen />;
    default:
      return null;
  }
}

function App() {
  const [aboutOpen, setAboutOpen] = useState(false);
  const onboarded = useAppStore((s) => s.onboarded);
  const viewingWorkout = useAppStore((s) => s.viewingWorkout);
  const viewingCharacter = useAppStore((s) => s.viewingCharacter);
  const viewingDM = useAppStore((s) => s.viewingDM);
  const viewingGroup = useAppStore((s) => s.viewingGroup);
  const viewingProfile = useAppStore((s) => s.viewingProfile);
  const viewingWorkoutEditor = useAppStore((s) => s.viewingWorkoutEditor);
  const viewingSharedProgram = useAppStore((s) => s.viewingSharedProgram);
  const viewingComposer = useAppStore((s) => s.viewingComposer);
  const viewingSessionDetail = useAppStore((s) => s.viewingSessionDetail);
  const viewingGoals = useAppStore((s) => s.viewingGoals);
  const route = useAppStore((s) => s.route);
  const { session, ready } = useSession();
  const userId = useUserId();
  const checkForNewDay = useAppStore((s) => s.checkForNewDay);
  const openSharedProgram = useAppStore((s) => s.openSharedProgram);
  const syncHealthMetrics = useAppStore((s) => s.syncHealthMetrics);
  const setMonthlySteps = useAppStore((s) => s.setMonthlySteps);
  const syncCardioKm = useAppStore((s) => s.syncCardioKm);
  const syncWatchWorkout = useAppStore((s) => s.syncWatchWorkout);
  const awardFitnessGoalXP = useAppStore((s) => s.awardFitnessGoalXP);
  const showToast = useAppStore((s) => s.showToast);
  const settings = useAppStore((s) => s.settings);
  const weekPlan = useAppStore((s) => s.weekPlan);
  const workoutState = useAppStore((s) => s.workoutState);
  const simDay = useAppStore((s) => s.simDay);
  const today = useAppStore((s) => s.today);
  const currentStreak = useAppStore((s) => s.progress.currentStreak);
  const challenges = useAppStore((s) => s.challenges);

  useEffect(() => {
    // 'system' removes the attribute entirely so app.css's own
    // prefers-color-scheme block decides - 'light'/'dark' pin it via the
    // data-theme attribute the CSS already has explicit overrides for.
    if (settings.theme === 'system') {
      document.documentElement.removeAttribute('data-theme');
    } else {
      document.documentElement.setAttribute('data-theme', settings.theme);
    }
  }, [settings.theme]);

  useEffect(() => {
    // iOS often keeps the WebView alive in the background instead of
    // killing/relaunching it, so a plain foreground (not a fresh mount)
    // never re-ran this before - the real calendar day could roll over
    // while backgrounded and today's goals would stay stuck on
    // yesterday's state until the app was fully relaunched. Re-checking
    // on every foreground (not just mount/sign-in) fixes that, and it has
    // to run *before* the health sync below so a fresh day's HealthKit
    // data lands in the newly-reset `today` object, not a stale one that
    // then gets wiped out from under it.
    if (!session) return;
    checkForNewDay();
    function onVisible() {
      if (document.visibilityState === 'visible') checkForNewDay();
    }
    document.addEventListener('visibilitychange', onVisible);
    // Also catches the case where the app is left open right through
    // midnight without ever being backgrounded - checkForNewDay() is a
    // cheap date comparison that no-ops unless the real day has actually
    // changed, so polling it doesn't cost anything beyond the interval.
    const midnightPoll = setInterval(checkForNewDay, 60_000);
    return () => {
      document.removeEventListener('visibilitychange', onVisible);
      clearInterval(midnightPoll);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  useEffect(() => {
    // Gated on `onboarded` too - the HealthKit permission sheet shouldn't
    // interrupt first-run onboarding before the user has any context for
    // why the app wants this.
    if (!session || !onboarded || !healthAvailableOnPlatform()) return;

    // requestAuthorization only re-prompts the first time per type; once
    // the user has answered (either way), this just silently reflects
    // that choice - safe to call every time to keep Home fresh.
    async function syncHealth() {
      const granted = await requestHealthAuthorization();
      if (!granted) return;
      const [summary, monthlySteps, cardioKm, hr, workouts] = await Promise.all([
        getTodayHealthSummary(),
        getMonthlySteps(),
        getMonthlyCardioKm(),
        getLatestHeartRate(),
        getTodayWorkouts(),
      ]);
      if (summary) {
        syncHealthMetrics({ steps: summary.steps, kcal: summary.kcal, activeMinutes: summary.activeMinutes, hr: hr?.bpm ?? null });
      }
      if (monthlySteps !== null) setMonthlySteps(monthlySteps);
      if (cardioKm !== null) syncCardioKm(cardioKm);
      syncWatchWorkout(workouts);

      // Performance goals (distance-time PBs, cumulative distance,
      // frequency) check against every real workout independently of
      // whether it also happens to satisfy today's single daily-goal
      // checkbox above - a goal should credit every matching activity,
      // not just the first one picked for "today".
      if (userId) {
        for (const w of workouts) {
          const result = await recordActivityForGoals(userId, {
            sourceId: w.uuid,
            category: categoryForActivityName(w.activityName),
            distanceMeters: w.distanceMeters,
            durationSeconds: Math.round(w.durationMinutes * 60),
            occurredAt: w.startDate,
          });
          for (const credit of result) {
            if (credit.justCompleted) {
              awardFitnessGoalXP(`${w.activityName} goal reached`, 20, { completed: true });
              showToast(`Goal reached! +80 bonus XP`);
            } else if (credit.isNewBest || credit.goal.goal_type !== 'distance_time') {
              awardFitnessGoalXP(`${w.activityName} goal progress`, 20, {});
            }
          }
        }
      }
    }

    syncHealth();
    // Re-sync whenever the app comes back to the foreground - e.g. you
    // background SOMAXX to end a Watch workout, then switch back. This
    // isn't true background delivery (nothing happens while the app is
    // fully backgrounded), just a check on return, which covers the
    // realistic case without the complexity of a background HK observer.
    // Runs after the checkForNewDay listener above (registered first, in
    // an earlier effect, so React fires it first on the same event).
    function onVisible() {
      if (document.visibilityState === 'visible') syncHealth();
    }
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, onboarded]);

  useEffect(() => {
    // Recomputes on every relevant state change (not just foreground) so
    // finishing a workout/challenge mid-session cancels a now-stale
    // reminder immediately, rather than leaving it queued until next
    // foreground. syncLocalReminders() itself no-ops without a granted
    // permission - it never prompts on its own (see SettingsCard for the
    // explicit opt-in prompt).
    if (!session || !onboarded) return;
    const plan = todayPlan(weekPlan);
    const hasTrainingToday = plan.type === 'train' || plan.type === 'watch';
    const workoutDoneToday =
      plan.type === 'train' && plan.key ? isWorkoutDone(workoutState, simDay, plan.key) : plan.type === 'watch' ? !!today._watchWorkoutSynced : true;
    const hasIncompleteChallenge = challenges.some((c) => c.joined && !c.completed);
    syncLocalReminders({
      notifWorkout: settings.notifWorkout,
      notifStreak: settings.notifStreak,
      notifChallenge: settings.notifChallenge,
      hasTrainingToday,
      workoutDoneToday,
      dayHadCompletionToday: today.dayHadCompletion,
      currentStreak,
      hasIncompleteChallenge,
    });
  }, [session, onboarded, settings, weekPlan, workoutState, simDay, today, currentStreak, challenges]);

  useEffect(() => {
    // League-update pushes need a registered device token before the
    // server-side trigger has anywhere to send them - registers (or
    // re-confirms) on sign-in whenever the setting is already on, e.g.
    // after signing in on a new device.
    if (!session || !onboarded || !userId || !(settings.notifLeague || settings.notifMessages)) return;
    registerForPush(userId);
  }, [session, onboarded, userId, settings.notifLeague, settings.notifMessages]);

  useEffect(() => {
    if (!session) return;
    const params = new URLSearchParams(window.location.search);
    const programId = params.get('program');
    if (programId) {
      openSharedProgram(programId);
      params.delete('program');
      const rest = params.toString();
      window.history.replaceState(null, '', window.location.pathname + (rest ? `?${rest}` : ''));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  useEffect(() => {
    // Share links open the native app via somaxx://program/<code> (see
    // worker/index.ts's "Download Somaxx" button) rather than falling back
    // to the web build - this is beta-only and only testers hold links, so
    // there's no need for a web/App Store fallback path yet.
    let handle: { remove: () => void } | undefined;
    CapacitorApp.addListener('appUrlOpen', ({ url }) => {
      try {
        const parsed = new URL(url);
        const code = parsed.hostname === 'program' ? parsed.pathname.replace(/^\//, '') : null;
        if (code) openSharedProgram(code);
      } catch {
        // Not a URL we recognize - ignore.
      }
    }).then((h) => {
      handle = h;
    });
    return () => handle?.remove();
  }, [openSharedProgram]);

  const isHomeHero =
    onboarded &&
    !viewingWorkout &&
    !viewingCharacter &&
    !viewingGoals &&
    !viewingDM &&
    !viewingGroup &&
    !viewingProfile &&
    !viewingWorkoutEditor &&
    !viewingSharedProgram &&
    !viewingComposer &&
    !viewingSessionDetail &&
    route === 'home';

  return (
    <div className="page">
      <Sitebar onAboutClick={() => setAboutOpen(true)} />
      <DeviceShell isHomeHero={!!session && isHomeHero}>
        {!ready ? null : !session ? <AuthScreen /> : <CurrentScreen />}
      </DeviceShell>
      <div className="sitefoot">
        Somax Beta — a click-through product prototype. Progress, XP and leaderboard data are saved to your account
        so they carry over between sessions and devices.
      </div>
      <AboutModal open={aboutOpen} onClose={() => setAboutOpen(false)} />
    </div>
  );
}

export default App;
