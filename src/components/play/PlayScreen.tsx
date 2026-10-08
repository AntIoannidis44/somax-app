import { ChallengesTab } from './ChallengesTab';
import { LeagueTab } from './LeagueTab';
import { AchievementsTab } from './AchievementsTab';
import { useAppStore } from '../../store/useAppStore';

const SEGMENTS = [
  { id: 'challenges', label: 'Challenges' },
  { id: 'league', label: 'League' },
  { id: 'achv', label: 'Achievements' },
] as const;

export function PlayScreen() {
  const playTab = useAppStore((s) => s.playTab);
  const setPlayTab = useAppStore((s) => s.setPlayTab);
  // Equal-width (flex:1) buttons mean the pill's position is index/count -
  // derived, not measured, so it's correct from the first paint.
  const activeIndex = SEGMENTS.findIndex((seg) => seg.id === playTab);

  return (
    <>
      <div className="seg">
        <div
          className="seg-thumb"
          style={{ width: `calc((100% - 8px) / ${SEGMENTS.length})`, transform: `translateX(${activeIndex * 100}%)` }}
        />
        {SEGMENTS.map((seg) => (
          <button key={seg.id} className={playTab === seg.id ? 'active' : ''} onClick={() => setPlayTab(seg.id)}>
            {seg.label}
          </button>
        ))}
      </div>
      {playTab === 'challenges' && <ChallengesTab />}
      {playTab === 'league' && <LeagueTab />}
      {playTab === 'achv' && <AchievementsTab />}
    </>
  );
}
