import { registerPlugin, Capacitor } from '@capacitor/core';

interface TodaySummary {
  steps: number;
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
  getMonthlyCardioDistance(): Promise<{ meters: number }>;
  getLatestHeartRate(): Promise<LatestHeartRate>;
  getTodayWorkouts(): Promise<{ workouts: HealthWorkout[] }>;
  getWorkoutRoute(options: { uuid: string }): Promise<{ points: RoutePoint[] }>;
  openAppSettings(): Promise<{ opened: boolean }>;
}

const Health = registerPlugin<HealthPlugin>('Health');

// Apple Health only exists inside the native iOS shell (Capacitor) - the
// web/PWA build has no HealthKit bridge, so every caller checks this
// first rather than the plugin call failing loudly for web users.
export function healthAvailableOnPlatform(): boolean {
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

export async function getLatestHeartRate(): Promise<LatestHeartRate | null> {
  if (!healthAvailableOnPlatform()) return null;
  return Health.getLatestHeartRate();
}

export async function getTodayWorkouts(): Promise<HealthWorkout[]> {
  if (!healthAvailableOnPlatform()) return [];
  const { workouts } = await Health.getTodayWorkouts();
  return workouts;
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
