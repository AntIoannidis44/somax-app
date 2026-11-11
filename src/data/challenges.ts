import type { ChallengeDef, ChallengeState } from '../types';

export const MAX_ACTIVE_CHALLENGES = 2;

export const CHALLENGE_DEFS: ChallengeDef[] = [
  {
    id: 'consistency',
    name: 'Consistency Sprint',
    desc: 'Complete a workout on 5 of the next 7 program days.',
    lengthDays: 7,
    target: 5,
    unit: 'workout',
    xpPerUnit: 18,
    bonusXp: 60,
  },
  {
    id: 'pushups',
    name: '100 Push-Ups Club',
    desc: 'Log 100 cumulative push-ups this season.',
    lengthDays: 14,
    target: 100,
    unit: 'push-up',
    xpPerUnit: 0.6,
    bonusXp: 40,
    logStep: 10,
  },
  {
    id: 'squats',
    name: '200 Squat Week',
    desc: 'Log 200 squats across the week.',
    lengthDays: 7,
    target: 200,
    unit: 'squat',
    xpPerUnit: 0.2,
    bonusXp: 40,
    logStep: 10,
  },
  {
    id: 'core',
    name: 'Core Crusher',
    desc: 'Finish 5 core sessions within 14 days.',
    lengthDays: 14,
    target: 5,
    unit: 'session',
    xpPerUnit: 8,
    bonusXp: 50,
    logStep: 1,
  },
  {
    id: 'cardio',
    name: 'Cardio Kilometres',
    desc: 'Cover 20 km of running, cycling or swimming this month.',
    lengthDays: 30,
    target: 20,
    unit: 'km',
    xpPerUnit: 3,
    bonusXp: 60,
    // Deliberately no logStep - this is the one challenge with a real data
    // source (HealthKit workout distance, see syncCardioKm), so there's no
    // manual "log km" button letting anyone self-report fake progress.
  },
  {
    id: 'macrotrack',
    name: 'Macro Tracker',
    desc: 'Log a full day of meals (breakfast, lunch, dinner & snacks) on 5 of the last 7 days.',
    lengthDays: 7,
    target: 5,
    unit: 'day',
    xpPerUnit: 10,
    bonusXp: 50,
    // Also deliberately no logStep - driven by real food_log_entries rows
    // (see syncMacroChallenge), not a manual "log a day" button.
  },
  {
    id: 'streak7',
    name: 'Seven-Day Streak',
    desc: 'Keep your real daily activity streak going for 7 days.',
    lengthDays: 14,
    target: 7,
    unit: 'day',
    xpPerUnit: 5,
    bonusXp: 50,
    // Deliberately no logStep (as of this fix) - this now mirrors your
    // actual progress.currentStreak counter (see syncStreakChallenge), not
    // a manual "log a day" tap. It used to be self-reported; fixed because
    // it let anyone claim a streak with no real activity behind it.
  },
];

export function defaultChallengeState(id: string): ChallengeState {
  return { id, joined: false, progress: 0, completed: false, pushupLog: 0 };
}

// Saved accounts predate newer challenges, so their stored list is missing
// those ids. Fill any gap with a fresh unjoined entry instead of letting the
// UI or store dereference undefined.
export function withAllChallenges(list: ChallengeState[] | undefined): ChallengeState[] {
  const have = list ?? [];
  return CHALLENGE_DEFS.map((def) => have.find((c) => c.id === def.id) ?? defaultChallengeState(def.id));
}

export function activeChallengeCount(list: ChallengeState[]): number {
  return list.filter((c) => c.joined && !c.completed).length;
}
