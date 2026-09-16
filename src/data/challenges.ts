import type { ChallengeDef } from '../types';

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
];
