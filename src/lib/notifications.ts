import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';

export function localNotifsAvailable(): boolean {
  return Capacitor.getPlatform() === 'ios';
}

export async function requestLocalNotifPermission(): Promise<boolean> {
  if (!localNotifsAvailable()) return false;
  const perm = await LocalNotifications.checkPermissions();
  if (perm.display === 'granted') return true;
  const req = await LocalNotifications.requestPermissions();
  return req.display === 'granted';
}

const IDS = { workout: 9001, streak: 9002, challenge: 9003 } as const;
const ALL_IDS = Object.values(IDS).map((id) => ({ id }));

function todayAt(hour: number, minute: number): Date {
  const d = new Date();
  d.setHours(hour, minute, 0, 0);
  return d;
}

export interface ReminderInput {
  notifWorkout: boolean;
  notifStreak: boolean;
  notifChallenge: boolean;
  hasTrainingToday: boolean;
  workoutDoneToday: boolean;
  dayHadCompletionToday: boolean;
  currentStreak: number;
  hasIncompleteChallenge: boolean;
}

// Recomputed and rescheduled every time the app comes to the foreground or
// relevant state changes (see App.tsx) - each notification is scheduled
// for later *today* only if its condition still holds right now, so
// finishing a workout/challenge/streak action later cancels the
// now-stale reminder next time the app is opened. Once scheduled, iOS
// holds and fires it on time regardless of whether the app is running.
export async function syncLocalReminders(input: ReminderInput): Promise<void> {
  if (!localNotifsAvailable()) return;
  const perm = await LocalNotifications.checkPermissions();
  if (perm.display !== 'granted') {
    await LocalNotifications.cancel({ notifications: ALL_IDS });
    return;
  }

  const toSchedule: Array<{ id: number; title: string; body: string; schedule: { at: Date } }> = [];
  const toCancel: number[] = [];
  const now = Date.now();

  const workoutTime = todayAt(18, 0);
  if (input.notifWorkout && input.hasTrainingToday && !input.workoutDoneToday && workoutTime.getTime() > now) {
    toSchedule.push({
      id: IDS.workout,
      title: "Today's session is waiting",
      body: "Get today's workout in to keep your XP climbing.",
      schedule: { at: workoutTime },
    });
  } else {
    toCancel.push(IDS.workout);
  }

  const streakTime = todayAt(21, 0);
  if (input.notifStreak && input.currentStreak > 0 && !input.dayHadCompletionToday && streakTime.getTime() > now) {
    toSchedule.push({
      id: IDS.streak,
      title: `Don't lose your ${input.currentStreak}-day streak`,
      body: 'Log any activity today to keep it alive.',
      schedule: { at: streakTime },
    });
  } else {
    toCancel.push(IDS.streak);
  }

  const challengeTime = todayAt(19, 0);
  if (input.notifChallenge && input.hasIncompleteChallenge && !input.dayHadCompletionToday && challengeTime.getTime() > now) {
    toSchedule.push({
      id: IDS.challenge,
      title: 'Challenge progress',
      body: "You've got an active challenge — log some progress today.",
      schedule: { at: challengeTime },
    });
  } else {
    toCancel.push(IDS.challenge);
  }

  if (toCancel.length) await LocalNotifications.cancel({ notifications: toCancel.map((id) => ({ id })) });
  if (toSchedule.length) await LocalNotifications.schedule({ notifications: toSchedule });
}
