import { lazy, Suspense, useEffect, useState } from 'react';
import { App as CapacitorApp } from '@capacitor/app';
import { Sitebar } from './components/layout/Sitebar';
import { AboutModal } from './components/layout/AboutModal';
import { DeviceShell } from './components/layout/DeviceShell';
import { LoadingSpinner } from './components/layout/LoadingSpinner';
import { AuthScreen } from './components/auth/AuthScreen';
import { HomeScreen } from './components/home/HomeScreen';

// Code-split: everything below is one tap away from Home, not part of the
// very first paint, so there's no reason to make every cold start parse
// and evaluate all of it up front - this is what was behind Vite's
// "chunk larger than 500kB" warning. Each import() becomes its own chunk,
// fetched (from the bundle already shipped with the app, so effectively
// instant - no network involved) only the first time its screen is shown.
// Redesigned onboarding (also the existing-user "Update your training
// profile" flow) - its own chunk; it pulls in the Library and plan engines.
const OnboardingV2 = lazy(() => import('./components/onboarding/v2/OnboardingV2').then((m) => ({ default: m.OnboardingV2 })));
const TrainScreen = lazy(() => import('./components/train/TrainScreen').then((m) => ({ default: m.TrainScreen })));
const WorkoutScreen = lazy(() => import('./components/train/WorkoutScreen').then((m) => ({ default: m.WorkoutScreen })));
const PlayScreen = lazy(() => import('./components/play/PlayScreen').then((m) => ({ default: m.PlayScreen })));
const CommunityScreen = lazy(() => import('./components/community/CommunityScreen').then((m) => ({ default: m.CommunityScreen })));
const ProfileScreen = lazy(() => import('./components/profile/ProfileScreen').then((m) => ({ default: m.ProfileScreen })));
const CharacterStudioScreen = lazy(() => import('./components/character/CharacterStudioScreen').then((m) => ({ default: m.CharacterStudioScreen })));
const GoalsScreen = lazy(() => import('./components/goals/GoalsScreen').then((m) => ({ default: m.GoalsScreen })));
const MacrosScreen = lazy(() => import('./components/macros/MacrosScreen').then((m) => ({ default: m.MacrosScreen })));
const DMScreen = lazy(() => import('./components/community/DMScreen').then((m) => ({ default: m.DMScreen })));
const GroupChatScreen = lazy(() => import('./components/community/GroupChatScreen').then((m) => ({ default: m.GroupChatScreen })));
const ChatInfoScreen = lazy(() => import('./components/community/ChatInfoScreen').then((m) => ({ default: m.ChatInfoScreen })));
const SharedContentScreen = lazy(() => import('./components/community/SharedContentScreen').then((m) => ({ default: m.SharedContentScreen })));
const ProfileViewScreen = lazy(() => import('./components/community/ProfileViewScreen').then((m) => ({ default: m.ProfileViewScreen })));
const WorkoutEditorScreen = lazy(() => import('./components/train/WorkoutEditorScreen').then((m) => ({ default: m.WorkoutEditorScreen })));
const SharedProgramScreen = lazy(() => import('./components/train/SharedProgramScreen').then((m) => ({ default: m.SharedProgramScreen })));
const PostComposerScreen = lazy(() => import('./components/community/PostComposerScreen').then((m) => ({ default: m.PostComposerScreen })));
const WorkoutSessionDetail = lazy(() => import('./components/train/WorkoutSessionDetail').then((m) => ({ default: m.WorkoutSessionDetail })));
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
import { registerForPush, registerPushTapHandler } from './lib/push';
import { fetchUnreadDMCounts, subscribeDMs } from './lib/social';
import { setBadgeCount } from './lib/badge';
import { todayPlan, isWorkoutDone } from './lib/schedule';
import { categoryForActivityName } from './data/workoutTypes';
import { recordActivityForGoals } from './lib/fitnessGoals';

function CurrentScreen() {
  const onboarded = useAppStore((s) => s.onboarded);
  const viewingWorkout = useAppStore((s) => s.viewingWorkout);
  const viewingCharacter = useAppStore((s) => s.viewingCharacter);
  const viewingGoals = useAppStore((s) => s.viewingGoals);
  const viewingMacros = useAppStore((s) => s.viewingMacros);
  const viewingDM = useAppStore((s) => s.viewingDM);
  const viewingGroup = useAppStore((s) => s.viewingGroup);
  const viewingChatInfo = useAppStore((s) => s.viewingChatInfo);
  const viewingSharedContent = useAppStore((s) => s.viewingSharedContent);
  const viewingProfile = useAppStore((s) => s.viewingProfile);
  const viewingWorkoutEditor = useAppStore((s) => s.viewingWorkoutEditor);
  const viewingSharedProgram = useAppStore((s) => s.viewingSharedProgram);
  const viewingComposer = useAppStore((s) => s.viewingComposer);
  const viewingSessionDetail = useAppStore((s) => s.viewingSessionDetail);
  const route = useAppStore((s) => s.route);
  const profileSetupOpen = useAppStore((s) => s.profileSetupOpen);

  if (!onboarded) return <OnboardingV2 />;
  if (profileSetupOpen) return <OnboardingV2 mode="update" />;
  if (viewingWorkout) return <WorkoutScreen />;
  if (viewingCharacter) return <CharacterStudioScreen />;
  if (viewingGoals) return <GoalsScreen />;
  if (viewingMacros) return <MacrosScreen />;
  // Checked before viewingDM/viewingGroup/viewingProfile: tapping "View" on a
  // shared activity inside one of those screens (or inside Chat Info/Shared
  // Content, which stack on top of them) sets this flag without clearing
  // the others, so it must win the check or the screen never switches.
  if (viewingSessionDetail) return <WorkoutSessionDetail />;
  // Also stacked, innermost first: Shared Content opens from Chat Info,
  // which opens from a DM/group chat - none of the screens underneath get
  // cleared, so "back" naturally lands on the right one.
  if (viewingSharedContent) return <SharedContentScreen />;
  if (viewingChatInfo) return <ChatInfoScreen />;
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
  const viewingMacros = useAppStore((s) => s.viewingMacros);
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
  const setUnreadDM = useAppStore((s) => s.setUnreadDM);
  const openDM = useAppStore((s) => s.openDM);
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
      try {
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
      } catch (err) {
        // A native-bridge failure here (vs. a plain permission denial, which
        // just resolves `granted: false`) used to fail this whole function
        // silently - skipping the steps checklist item and the Watch workout
        // sync together with zero trace of why. At least surface it.
        console.error('[health] sync failed:', err);
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
    // Independent of permission/registration state - this only reacts to a
    // tap on a notification that already arrived, so it's safe (and needed)
    // to have listening from app start regardless of whether push is set up
    // yet this session.
    registerPushTapHandler(openDM);
  }, [openDM]);

  useEffect(() => {
    // League-update/message pushes need a registered device token before the
    // server-side trigger has anywhere to send them - registers (or
    // re-confirms) on sign-in whenever a push setting is already on, e.g.
    // after signing in on a new device. If permission was denied (at the OS
    // level, or before this toggle existed on this device), this silently
    // did nothing on every launch with no way for the user to notice their
    // toggle isn't actually doing anything - surface it instead.
    if (!session || !onboarded || !userId || !(settings.notifLeague || settings.notifMessages)) return;
    registerForPush(userId).then((ok) => {
      if (!ok) showToast('Push notifications are off for SOMAXX - enable them in iOS Settings');
    });
  }, [session, onboarded, userId, settings.notifLeague, settings.notifMessages, showToast]);

  useEffect(() => {
    if (!session || !onboarded || !userId) return;
    let cancelled = false;
    function refresh() {
      fetchUnreadDMCounts(userId!).then((counts) => {
        if (cancelled) return;
        setUnreadDM(counts);
        setBadgeCount(Object.values(counts).reduce((sum, n) => sum + n, 0));
      });
    }
    refresh();
    const unsubscribe = subscribeDMs(refresh);
    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [session, onboarded, userId, setUnreadDM]);

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
    !viewingMacros &&
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
        {!ready ? <LoadingSpinner /> : !session ? <AuthScreen /> : <Suspense fallback={<LoadingSpinner />}><CurrentScreen /></Suspense>}
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
