import { useEffect, useState } from 'react';
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
import { DMScreen } from './components/community/DMScreen';
import { WorkoutEditorScreen } from './components/train/WorkoutEditorScreen';
import { SharedProgramScreen } from './components/train/SharedProgramScreen';
import { useAppStore } from './store/useAppStore';
import { useSession } from './lib/useSession';

function CurrentScreen() {
  const onboarded = useAppStore((s) => s.onboarded);
  const viewingWorkout = useAppStore((s) => s.viewingWorkout);
  const viewingCharacter = useAppStore((s) => s.viewingCharacter);
  const viewingDM = useAppStore((s) => s.viewingDM);
  const viewingWorkoutEditor = useAppStore((s) => s.viewingWorkoutEditor);
  const viewingSharedProgram = useAppStore((s) => s.viewingSharedProgram);
  const route = useAppStore((s) => s.route);

  if (!onboarded) return <OnboardingFlow />;
  if (viewingWorkout) return <WorkoutScreen />;
  if (viewingCharacter) return <CharacterStudioScreen />;
  if (viewingDM) return <DMScreen />;
  if (viewingWorkoutEditor) return <WorkoutEditorScreen />;
  if (viewingSharedProgram) return <SharedProgramScreen />;

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
  const viewingWorkoutEditor = useAppStore((s) => s.viewingWorkoutEditor);
  const viewingSharedProgram = useAppStore((s) => s.viewingSharedProgram);
  const route = useAppStore((s) => s.route);
  const { session, ready } = useSession();
  const checkForNewDay = useAppStore((s) => s.checkForNewDay);
  const openSharedProgram = useAppStore((s) => s.openSharedProgram);

  useEffect(() => {
    if (session) checkForNewDay();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

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

  const isHomeHero =
    onboarded && !viewingWorkout && !viewingCharacter && !viewingDM && !viewingWorkoutEditor && !viewingSharedProgram && route === 'home';

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
