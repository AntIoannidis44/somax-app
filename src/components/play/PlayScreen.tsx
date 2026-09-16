import { useEffect, useRef, useState } from 'react';
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
  const thumbRef = useRef<HTMLDivElement>(null);
  const btnRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const [thumbStyle, setThumbStyle] = useState<{ width: number; left: number }>({ width: 0, left: 0 });

  useEffect(() => {
    const btn = btnRefs.current[playTab];
    if (btn) setThumbStyle({ width: btn.offsetWidth, left: btn.offsetLeft });
  }, [playTab]);

  return (
    <>
      <div className="seg">
        <div className="seg-thumb" ref={thumbRef} style={{ width: thumbStyle.width, left: thumbStyle.left }} />
        {SEGMENTS.map((seg) => (
          <button
            key={seg.id}
            ref={(el) => {
              btnRefs.current[seg.id] = el;
            }}
            className={playTab === seg.id ? 'active' : ''}
            onClick={() => setPlayTab(seg.id)}
          >
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
