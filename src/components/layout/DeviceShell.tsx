import { useRef, useState, type ReactNode } from 'react';
import { DeviceHeader } from './DeviceHeader';
import { TabBar } from './TabBar';
import { Toast } from './Toast';
import { LevelUpBurst } from './LevelUpBurst';
import { useAppStore } from '../../store/useAppStore';

interface DeviceShellProps {
  children: ReactNode;
  isHomeHero: boolean;
}

export function DeviceShell({ children, isHomeHero }: DeviceShellProps) {
  const [solid, setSolid] = useState(false);
  const screenRef = useRef<HTMLDivElement>(null);
  const route = useAppStore((s) => s.route);
  const viewingWorkout = useAppStore((s) => s.viewingWorkout);
  const viewingCharacter = useAppStore((s) => s.viewingCharacter);

  const screenKey = `${route}|${viewingWorkout}|${viewingCharacter}`;

  return (
    <div className="stage">
      <div className="device-shell">
        <div className="device">
          <DeviceHeader solid={solid} />
          <div
            key={screenKey}
            ref={screenRef}
            className={`screen screen-in${isHomeHero ? ' has-hero' : ''}`}
            onScroll={(e) => {
              if (!isHomeHero) return;
              setSolid(e.currentTarget.scrollTop > 230);
            }}
          >
            {children}
          </div>
          <TabBar />
          <Toast />
          <LevelUpBurst />
        </div>
      </div>
    </div>
  );
}
