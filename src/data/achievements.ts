import type { AchievementDef, AppState } from '../types';

type Metric = (s: AppState) => number;

// A count-based achievement: unlocks at `target`, and the list shows progress toward it.
function counted(
  id: string,
  name: string,
  desc: string,
  icon: string,
  value: Metric,
  target: number,
): AchievementDef {
  return { id, name, desc, icon, xp: 0, test: (s) => value(s) >= target, progress: { value, target } };
}

const workouts: Metric = (s) => s.stats_workoutsDone;
const longestStreak: Metric = (s) => s.progress.longestStreak;
const level: Metric = (s) => s.progress.level;
const friends: Metric = (s) => s.progress.friendCount ?? 0;

export const ACHIEVEMENT_DEFS: AchievementDef[] = [
  counted('first_rep', 'First Rep', 'Complete your first workout', 'dumbbell', workouts, 1),
  counted('workouts10', 'Ten Strong', 'Complete 10 workouts', 'dumbbell', workouts, 10),
  counted('workouts25', 'Committed', 'Complete 25 workouts', 'dumbbell', workouts, 25),
  counted('workouts50', 'Iron Habit', 'Complete 50 workouts', 'dumbbell', workouts, 50),
  counted('streak3', 'Warming Up', 'Reach a 3-day streak', 'flame', longestStreak, 3),
  counted('streak7', 'On a Roll', 'Reach a 7-day streak', 'zap', longestStreak, 7),
  counted('streak14', 'Fortnight', 'Reach a 14-day streak', 'flame', longestStreak, 14),
  counted('streak30', 'Unstoppable', 'Reach a 30-day streak', 'flame', longestStreak, 30),
  counted('level5', 'Level 5', 'Reach character level 5', 'trophy', level, 5),
  counted('level10', 'Level 10', 'Reach character level 10', 'trophy', level, 10),
  counted('level15', 'Level 15', 'Reach character level 15', 'trophy', level, 15),
  counted('level20', 'Level 20', 'Reach character level 20', 'trophy', level, 20),
  counted('level25', 'Level 25', 'Reach character level 25', 'trophy', level, 25),
  counted('level30', 'Level 30', 'Reach character level 30', 'trophy', level, 30),
  counted('level40', 'Level 40', 'Reach character level 40', 'trophy', level, 40),
  counted('level50', 'Level 50', 'Reach character level 50', 'trophy', level, 50),
  counted('level55', 'Max Level', 'Reach the level cap of 55', 'trophy', level, 55),
  { id: 'prestige1', name: 'Ascended', desc: 'Evolve for the first time', icon: 'trophy', xp: 0, test: (s) => (s.progress.prestige ?? 0) >= 1 },
  counted('first_friend', 'First Friend', 'Add your first friend', 'heart', friends, 1),
  counted('squad', 'Squad Goals', 'Have 5 friends', 'heart', friends, 5),
  counted('crew', 'Full Crew', 'Have 10 friends', 'heart', friends, 10),
  { id: 'challenge1', name: 'Challenger', desc: 'Join your first challenge', icon: 'heart', xp: 0, test: (s) => s.challenges.some((c) => c.joined) },
  { id: 'challenge_done', name: 'Challenge Complete', desc: 'Finish a challenge', icon: 'zap', xp: 0, test: (s) => s.challenges.some((c) => c.completed) },
  { id: 'double_duty', name: 'Double Duty', desc: 'Run two challenges at once', icon: 'zap', xp: 0, test: (s) => s.challenges.filter((c) => c.joined && !c.completed).length >= 2 },
];

// XP paid out when each achievement unlocks, scaled by how hard it is to reach.
const ACHIEVEMENT_XP: Record<string, number> = {
  first_rep: 20, workouts10: 40, workouts25: 60, workouts50: 100,
  streak3: 20, streak7: 40, streak14: 60, streak30: 100,
  level5: 20, level10: 40, level15: 50, level20: 60, level25: 80, level30: 100, level40: 120, level50: 150, level55: 200, prestige1: 150,
  first_friend: 20, squad: 50, crew: 80,
  challenge1: 20, challenge_done: 60, double_duty: 40,
};

for (const a of ACHIEVEMENT_DEFS) a.xp = ACHIEVEMENT_XP[a.id] ?? 20;
