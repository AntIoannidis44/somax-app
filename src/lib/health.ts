import { registerPlugin, Capacitor } from '@capacitor/core';
import { E2E } from './e2e';

interface TodaySummary {
  steps: number;
  verifiedSteps?: number;
  activeMinutes: number;
  kcal: number;
}

interface LatestHeartRate {
  bpm: number | null;
  recordedAt: string | null;
}

export interface HealthWorkout {
  uuid: string;
  activityName: string;
  startDate: string;
  durationMinutes: number;
  kcal: number;
  distanceMeters: number | null;
  userEntered?: boolean;
  lapLengthMeters?: number | null;
}

export interface RoutePoint {
  lat: number;
  lng: number;
  t: string;
}

interface HealthPlugin {
  isAvailable(): Promise<{ available: boolean }>;
  requestAuthorization(): Promise<{ granted: boolean }>;
  getTodaySummary(): Promise<TodaySummary>;
  getMonthlyStepsSummary(): Promise<{ steps: number }>;
  getDailyVerifiedSteps(options: { startDate: string; endDate: string }): Promise<{ days: { date: string; steps: number }[] }>;
  getMonthlyCardioDistance(): Promise<{ meters: number }>;
  getLatestHeartRate(): Promise<LatestHeartRate>;
  getTodayAverageHeartRate(): Promise<{ bpm: number | null }>;
  getTodayWorkouts(options?: { startDate?: string; endDate?: string }): Promise<{ workouts: HealthWorkout[] }>;
  getWorkoutRoute(options: { uuid: string }): Promise<{ points: RoutePoint[] }>;
  openAppSettings(): Promise<{ opened: boolean }>;
}

// Screen-test mode uses the fake the test script installs (lib/e2e.ts).
const Health: HealthPlugin = E2E ? (window as unknown as { __E2E_HEALTH__: HealthPlugin }).__E2E_HEALTH__ : registerPlugin<HealthPlugin>('Health');

// Apple Health only exists inside the native iOS shell (Capacitor) - the
// web/PWA build has no HealthKit bridge, so every caller checks this
// first rather than the plugin call failing loudly for web users.
export function healthAvailableOnPlatform(): boolean {
  if (E2E) return true;
  return Capacitor.getPlatform() === 'ios' && Capacitor.isNativePlatform();
}

export async function requestHealthAuthorization(): Promise<boolean> {
  if (!healthAvailableOnPlatform()) return false;
  const { granted } = await Health.requestAuthorization();
  return granted;
}

export async function getTodayHealthSummary(): Promise<TodaySummary | null> {
  if (!healthAvailableOnPlatform()) return null;
  return Health.getTodaySummary();
}

export async function getMonthlySteps(): Promise<number | null> {
  if (!healthAvailableOnPlatform()) return null;
  const { steps } = await Health.getMonthlyStepsSummary();
  return steps;
}

// Real month-to-date km for run/cycle/swim workouts only - the actual source
// of truth the Cardio Kilometres challenge syncs from (see
// useAppStore.ts's syncCardioKm). There's deliberately no manual "log km"
// path anymore - it has to come from here or it doesn't count.
export async function getMonthlyCardioKm(): Promise<number | null> {
  if (!healthAvailableOnPlatform()) return null;
  const { meters } = await Health.getMonthlyCardioDistance();
  return meters / 1000;
}

// Today's average heart rate (bpm, rounded) from every Apple Health reading since midnight, or null when
// there is none today. This is what Home and Profile show (owner, 2026-11-20).
export async function getTodayAverageHeartRate(): Promise<number | null> {
  if (!healthAvailableOnPlatform()) return null;
  const { bpm } = await Health.getTodayAverageHeartRate();
  return typeof bpm === 'number' && bpm > 0 ? Math.round(bpm) : null;
}

export async function getLatestHeartRate(): Promise<LatestHeartRate | null> {
  if (!healthAvailableOnPlatform()) return null;
  return Health.getLatestHeartRate();
}

export async function getTodayWorkouts(): Promise<HealthWorkout[]> {
  if (!healthAvailableOnPlatform()) return [];
  const { workouts } = await Health.getTodayWorkouts();
  return workouts;
}

// For syncing a Watch workout onto a PAST day's logged session - startDate
// is a plain "YYYY-MM-DD" (local calendar day), converted here to the
// midnight-to-midnight ISO range the native side expects.
export async function getWorkoutsForDate(isoDate: string): Promise<HealthWorkout[]> {
  if (!healthAvailableOnPlatform()) return [];
  const start = new Date(`${isoDate}T00:00:00`);
  const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);
  const { workouts } = await Health.getTodayWorkouts({ startDate: start.toISOString(), endDate: end.toISOString() });
  return workouts;
}

// Every Health workout between two local dates (inclusive, "YYYY-MM-DD") -
// the source for verified challenge progress (lib/verifiedChallenges.ts).
export async function getWorkoutsInRange(startIso: string, endIso: string): Promise<HealthWorkout[]> {
  if (!healthAvailableOnPlatform()) return [];
  const start = new Date(`${startIso}T00:00:00`);
  const end = new Date(new Date(`${endIso}T00:00:00`).getTime() + 24 * 60 * 60 * 1000);
  const { workouts } = await Health.getTodayWorkouts({ startDate: start.toISOString(), endDate: end.toISOString() });
  return workouts;
}

// Device-recorded (not hand-entered) steps per day between two local dates.
export async function getDailyVerifiedSteps(startIso: string, endIso: string): Promise<{ date: string; steps: number }[]> {
  if (!healthAvailableOnPlatform()) return [];
  const start = new Date(`${startIso}T00:00:00`);
  const end = new Date(new Date(`${endIso}T00:00:00`).getTime() + 24 * 60 * 60 * 1000);
  try {
    const { days } = await Health.getDailyVerifiedSteps({ startDate: start.toISOString(), endDate: end.toISOString() });
    return days ?? [];
  } catch {
    return []; // older native build without the method
  }
}

export async function getWorkoutRoute(uuid: string): Promise<RoutePoint[]> {
  if (!healthAvailableOnPlatform()) return [];
  const { points } = await Health.getWorkoutRoute({ uuid });
  return points;
}

// Deep-links to this app's own iOS Settings page - the only real
// self-service fix when Health sync keeps coming back empty, since
// there's no way for the app to tell "nothing logged" apart from
// "access denied" (see openAppSettings' native-side comment).
export async function openHealthAppSettings(): Promise<void> {
  if (!healthAvailableOnPlatform()) return;
  await Health.openAppSettings();
}
