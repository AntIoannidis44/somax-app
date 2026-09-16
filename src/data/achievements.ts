import type { AchievementDef } from '../types';

export const ACHIEVEMENT_DEFS: AchievementDef[] = [
  {
    id: 'first_rep',
    name: 'First Rep',
    desc: 'Complete your first workout',
    icon: 'dumbbell',
    test: (s) => s.stats_workoutsDone >= 1,
  },
  {
    id: 'streak3',
    name: 'Warming Up',
    desc: 'Reach a 3-day streak',
    icon: 'flame',
    test: (s) => s.progress.longestStreak >= 3,
  },
  {
    id: 'streak7',
    name: 'On a Roll',
    desc: 'Reach a 7-day streak',
    icon: 'zap',
    test: (s) => s.progress.longestStreak >= 7,
  },
  {
    id: 'level5',
    name: 'Level 5',
    desc: 'Reach character level 5',
    icon: 'trophy',
    test: (s) => s.progress.level >= 5,
  },
  {
    id: 'level10',
    name: 'Level 10',
    desc: 'Reach character level 10',
    icon: 'trophy',
    test: (s) => s.progress.level >= 10,
  },
  {
    id: 'challenge1',
    name: 'Challenger',
    desc: 'Join your first challenge',
    icon: 'heart',
    test: (s) => s.challenges.some((c) => c.joined),
  },
];
