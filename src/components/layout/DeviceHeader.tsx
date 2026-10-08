import { Icon } from '../Icon';
import { useAppStore } from '../../store/useAppStore';
import { getWorkout } from '../../lib/customWorkouts';
import { countUnlocked } from '../../lib/character';
import { dayLabel } from '../../lib/schedule';
import { first } from '../../lib/format';
import { todayPlan } from '../../lib/schedule';
import { workoutTypeById } from '../../data/workoutTypes';
import { LevelBadge } from './LevelBadge';
import type { IconName } from '../../data/icons';
import type { PlanDay, Route } from '../../types';

// Icon for today's plan, shown beside the line under "Hey, <name>".
function todayIcon(weekPlan: PlanDay[]): IconName {
  const plan = todayPlan(weekPlan);
  if (plan.type === 'watch') return 'watch';
  if (plan.type !== 'train' || !plan.key) return 'moon';
  return workoutTypeById(getWorkout(plan.key)?.category)?.icon ?? 'dumbbell';
}

const ROUTE_META: Record<
  Route,
  { title: (name: string) => string; sub: (ctx: { programName: string; weekPlan: PlanDay[] }) => string }
> = {
  home: { title: (name) => `Hey, ${name}`, sub: (ctx) => dayLabel(ctx.weekPlan) },
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
  const viewingGoals = useAppStore((s) => s.viewingGoals);
  const viewingDM = useAppStore((s) => s.viewingDM);
  const viewingGroup = useAppStore((s) => s.viewingGroup);
  const viewingProfile = useAppStore((s) => s.viewingProfile);
  const viewingWorkoutEditor = useAppStore((s) => s.viewingWorkoutEditor);
  const viewingSharedProgram = useAppStore((s) => s.viewingSharedProgram);
  const viewingComposer = useAppStore((s) => s.viewingComposer);
  const viewingSessionDetail = useAppStore((s) => s.viewingSessionDetail);
  const route = useAppStore((s) => s.route);
  const profile = useAppStore((s) => s.profile);
  const progress = useAppStore((s) => s.progress);
  const weekPlan = useAppStore((s) => s.weekPlan);
  const closeWorkout = useAppStore((s) => s.closeWorkout);
  const closeCharacterStudio = useAppStore((s) => s.closeCharacterStudio);
  const closeGoals = useAppStore((s) => s.closeGoals);
  const closeDM = useAppStore((s) => s.closeDM);
  const closeGroup = useAppStore((s) => s.closeGroup);
  const closeProfile = useAppStore((s) => s.closeProfile);
  const closeWorkoutEditor = useAppStore((s) => s.closeWorkoutEditor);
  const closeSharedProgram = useAppStore((s) => s.closeSharedProgram);
  const closeComposer = useAppStore((s) => s.closeComposer);
  const closeSessionDetail = useAppStore((s) => s.closeSessionDetail);

  if (!onboarded) return <div className="device-header" />;

  if (viewingWorkout) {
    const w = getWorkout(viewingWorkout);
    return (
      <div className="device-header">
        <button className="level-chip" style={{ padding: 8 }} onClick={closeWorkout}>
          <span style={{ display: 'flex' }}>
            <Icon name="chevron" style={{ transform: 'rotate(180deg)' }} />
          </span>
        </button>
        <div style={{ textAlign: 'center', flex: 1 }}>
          <div className="dh-title">{w?.name}</div>
          <div className="dh-sub">{w?.duration}</div>
        </div>
        <div style={{ width: 38 }} />
      </div>
    );
  }

  if (viewingCharacter) {
    const cu = countUnlocked({ level: progress.level, longestStreak: progress.longestStreak, prestige: progress.prestige });
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

  if (viewingGoals) {
    return (
      <div className="device-header">
        <button className="level-chip" style={{ padding: 8 }} onClick={closeGoals}>
          <span style={{ display: 'flex' }}>
            <Icon name="chevron" style={{ transform: 'rotate(180deg)' }} />
          </span>
        </button>
        <div style={{ textAlign: 'center', flex: 1 }}>
          <div className="dh-title">Goals &amp; schedule</div>
        </div>
        <div style={{ width: 38 }} />
      </div>
    );
  }

  if (viewingDM) {
    return (
      <div className="device-header">
        <button className="level-chip" style={{ padding: 8 }} onClick={closeDM}>
          <span style={{ display: 'flex' }}>
            <Icon name="chevron" style={{ transform: 'rotate(180deg)' }} />
          </span>
        </button>
        <div style={{ textAlign: 'center', flex: 1 }}>
          <div className="dh-title">{viewingDM.name}</div>
        </div>
        <div style={{ width: 38 }} />
      </div>
    );
  }

  if (viewingGroup) {
    return (
      <div className="device-header">
        <button className="level-chip" style={{ padding: 8 }} onClick={closeGroup}>
          <span style={{ display: 'flex' }}>
            <Icon name="chevron" style={{ transform: 'rotate(180deg)' }} />
          </span>
        </button>
        <div style={{ textAlign: 'center', flex: 1 }}>
          <div className="dh-title">{viewingGroup.name}</div>
        </div>
        <div style={{ width: 38 }} />
      </div>
    );
  }

  if (viewingProfile) {
    return (
      <div className="device-header">
        <button className="level-chip" style={{ padding: 8 }} onClick={closeProfile}>
          <span style={{ display: 'flex' }}>
            <Icon name="chevron" style={{ transform: 'rotate(180deg)' }} />
          </span>
        </button>
        <div style={{ textAlign: 'center', flex: 1 }}>
          <div className="dh-title">Profile</div>
        </div>
        <div style={{ width: 38 }} />
      </div>
    );
  }

  if (viewingWorkoutEditor) {
    return (
      <div className="device-header">
        <button className="level-chip" style={{ padding: 8 }} onClick={closeWorkoutEditor}>
          <span style={{ display: 'flex' }}>
            <Icon name="chevron" style={{ transform: 'rotate(180deg)' }} />
          </span>
        </button>
        <div style={{ textAlign: 'center', flex: 1 }}>
          <div className="dh-title">{viewingWorkoutEditor === 'new' ? 'New program' : 'Edit program'}</div>
        </div>
        <div style={{ width: 38 }} />
      </div>
    );
  }

  if (viewingSharedProgram) {
    return (
      <div className="device-header">
        <button className="level-chip" style={{ padding: 8 }} onClick={closeSharedProgram}>
          <span style={{ display: 'flex' }}>
            <Icon name="chevron" style={{ transform: 'rotate(180deg)' }} />
          </span>
        </button>
        <div style={{ textAlign: 'center', flex: 1 }}>
          <div className="dh-title">Shared program</div>
        </div>
        <div style={{ width: 38 }} />
      </div>
    );
  }

  if (viewingComposer) {
    return (
      <div className="device-header">
        <button className="level-chip" style={{ padding: 8 }} onClick={closeComposer}>
          <span style={{ display: 'flex' }}>
            <Icon name="x" />
          </span>
        </button>
        <div style={{ textAlign: 'center', flex: 1 }}>
          <div className="dh-title">New post</div>
        </div>
        <div style={{ width: 38 }} />
      </div>
    );
  }

  if (viewingSessionDetail) {
    return (
      <div className="device-header">
        <button className="level-chip" style={{ padding: 8 }} onClick={closeSessionDetail}>
          <span style={{ display: 'flex' }}>
            <Icon name="chevron" style={{ transform: 'rotate(180deg)' }} />
          </span>
        </button>
        <div style={{ textAlign: 'center', flex: 1 }}>
          <div className="dh-title">{viewingSessionDetail.name}</div>
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
      <div style={{ minWidth: 0 }}>
        <div className="dh-title">{meta.title(first(profile?.name))}</div>
        <div className="dh-sub">
          {route === 'home' && <Icon name={todayIcon(weekPlan)} />}
          {meta.sub({ programName: profile?.program.name || '', weekPlan })}
        </div>
      </div>
      <LevelBadge />
    </div>
  );
}
