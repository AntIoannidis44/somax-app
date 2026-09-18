import { Icon } from '../Icon';
import { useAppStore } from '../../store/useAppStore';
import { WORKOUTS } from '../../data/workouts';
import { countUnlocked } from '../../lib/character';
import { dayLabel } from '../../lib/schedule';
import { first } from '../../lib/format';
import type { PlanDay, Route } from '../../types';

const ROUTE_META: Record<
  Route,
  { title: (name: string) => string; sub: (ctx: { simDay: number; programName: string; weekPlan: PlanDay[] }) => string }
> = {
  home: { title: (name) => `Hey, ${name}`, sub: (ctx) => dayLabel(ctx.simDay, ctx.weekPlan) },
  train: { title: () => 'Training', sub: (ctx) => ctx.programName },
  play: { title: () => 'Play', sub: () => 'Challenges & league' },
  community: { title: () => 'Community', sub: () => 'Bronze League activity' },
  profile: { title: () => 'Profile', sub: () => 'Stats & settings' },
};

interface DeviceHeaderProps {
  solid: boolean;
}

export function DeviceHeader({ solid }: DeviceHeaderProps) {
  const onboarded = useAppStore((s) => s.onboarded);
  const viewingWorkout = useAppStore((s) => s.viewingWorkout);
  const viewingCharacter = useAppStore((s) => s.viewingCharacter);
  const route = useAppStore((s) => s.route);
  const profile = useAppStore((s) => s.profile);
  const progress = useAppStore((s) => s.progress);
  const simDay = useAppStore((s) => s.simDay);
  const weekPlan = useAppStore((s) => s.weekPlan);
  const go = useAppStore((s) => s.go);
  const closeWorkout = useAppStore((s) => s.closeWorkout);
  const closeCharacterStudio = useAppStore((s) => s.closeCharacterStudio);

  if (!onboarded) return <div className="device-header" />;

  if (viewingWorkout) {
    const w = WORKOUTS[viewingWorkout];
    return (
      <div className="device-header">
        <button className="level-chip" style={{ padding: 8 }} onClick={closeWorkout}>
          <span style={{ display: 'flex' }}>
            <Icon name="chevron" style={{ transform: 'rotate(180deg)' }} />
          </span>
        </button>
        <div style={{ textAlign: 'center', flex: 1 }}>
          <div className="dh-title">{w.name}</div>
          <div className="dh-sub">{w.duration}</div>
        </div>
        <div style={{ width: 38 }} />
      </div>
    );
  }

  if (viewingCharacter) {
    const cu = countUnlocked({ level: progress.level, longestStreak: progress.longestStreak });
    return (
      <div className="device-header">
        <button className="level-chip" style={{ padding: 8 }} onClick={closeCharacterStudio}>
          <span style={{ display: 'flex' }}>
            <Icon name="chevron" style={{ transform: 'rotate(180deg)' }} />
          </span>
        </button>
        <div style={{ textAlign: 'center', flex: 1 }}>
          <div className="dh-title">Character</div>
          <div className="dh-sub">
            {cu.done} of {cu.total} items unlocked
          </div>
        </div>
        <div style={{ width: 38 }} />
      </div>
    );
  }

  const meta = ROUTE_META[route];
  const isOverlay = route === 'home';
  const classes = ['device-header'];
  if (isOverlay) classes.push('overlay');
  if (isOverlay && solid) classes.push('solid');

  return (
    <div className={classes.join(' ')}>
      <div>
        <div className="dh-title">{meta.title(first(profile?.name))}</div>
        <div className="dh-sub">{meta.sub({ simDay, programName: profile?.program.name || '', weekPlan })}</div>
      </div>
      <button className="level-chip" onClick={() => go('profile')}>
        <span className="lvl-badge">{progress.level}</span>
        <span className="lvl-text">Lv {progress.level}</span>
      </button>
    </div>
  );
}
