import type { ChallengeDef } from '../types';
import { verifySpecFor } from './verifiedChallenges';

// Coins become real-life supplement-store credit later (not announced yet).
// Owner's rule (2026-11-18): coins are ONLY earned from verifiable data -
// things Apple Health recorded from a device, never a tap, a typed-in number
// or anything added by hand in the Health app - and harder challenges pay
// more. Every payout is written to `coinLedger` under a unique key so the
// same day/workout/challenge can never pay twice, and the ledger is the
// audit trail any future credit redemption should be checked against.
export const COINS = {
  // A real Apple Fitness workout that passes checkWatchSync (matching type,
  // enough length, real effort, not hand-entered). Once per calendar day.
  verifiedWorkout: 10,
  // Daily step goal reached on device-recorded steps only (verifiedSteps).
  stepGoal: 5,
} as const;

const CHALLENGE_COINS: Record<ChallengeDef['difficulty'], number> = {
  beginner: 25,
  intermediate: 50,
  advanced: 100,
};

// 0 for challenges whose progress can be typed in (a "log" button) - only
// challenges tracked entirely from verified device data pay coins.
export function challengeCoins(def: ChallengeDef): number {
  return def.coinsVerified || verifySpecFor(def) ? CHALLENGE_COINS[def.difficulty] : 0;
}
