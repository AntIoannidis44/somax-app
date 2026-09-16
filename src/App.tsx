import { useState } from 'react';
import { Sitebar } from './components/layout/Sitebar';
import { AboutModal } from './components/layout/AboutModal';
import { DeviceShell } from './components/layout/DeviceShell';
import { OnboardingFlow } from './components/onboarding/OnboardingFlow';
import { HomeScreen } from './components/home/HomeScreen';
import { TrainScreen } from './components/train/TrainScreen';
import { WorkoutScreen } from './components/train/WorkoutScreen';
import { PlayScreen } from './components/play/PlayScreen';
import { CommunityScreen } from './components/community/CommunityScreen';
import { ProfileScreen } from './components/profile/ProfileScreen';
import { CharacterStudioScreen } from './components/character/CharacterStudioScreen';
import { useAppStore } from './store/useAppStore';

function CurrentScreen() {
  const onboarded = useAppStore((s) => s.onboarded);
  const viewingWorkout = useAppStore((s) => s.viewingWorkout);
  const viewingCharacter = useAppStore((s) => s.viewingCharacter);
  const route = useAppStore((s) => s.route);

  if (!onboarded) return <OnboardingFlow />;
  if (viewingWorkout) return <WorkoutScreen />;
  if (viewingCharacter) return <CharacterStudioScreen />;

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
  const route = useAppStore((s) => s.route);

  const isHomeHero = onboarded && !viewingWorkout && !viewingCharacter && route === 'home';

  return (
    <div className="page">
      <Sitebar onAboutClick={() => setAboutOpen(true)} />
      <DeviceShell isHomeHero={isHomeHero}>
        <CurrentScreen />
      </DeviceShell>
      <div className="sitefoot">
        Somax Beta — a click-through product prototype. All progress, XP and leaderboard data are simulated locally
        in your browser; nothing is sent to a server.
      </div>
      <AboutModal open={aboutOpen} onClose={() => setAboutOpen(false)} />
    </div>
  );
}

export default App;
