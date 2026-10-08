import { supabase } from './supabase';
import { useAppStore } from '../store/useAppStore';
import { withAllChallenges } from '../data/challenges';
import { monthStartOf } from '../store/useAppStore';

let unsubscribeStore: (() => void) | null = null;
let debounceTimer: ReturnType<typeof setTimeout> | null = null;

function stateForCloud() {
  // Same shape as the localStorage persist partialize - just drop the
  // transient UI fields (toast/levelUp), everything else is plain data.
  const { toast: _toast, levelUp: _levelUp, ...rest } = useAppStore.getState();
  return rest;
}

async function pushToCloud(userId: string) {
  const state = stateForCloud();

  // XP only ever goes up during normal play (see awardXP - there is no
  // code path that decrements progress.totalXP). A push that would lower
  // it server-side is a strong signal this client's local state is stale
  // - a race on cold start, a rehydrate that silently failed and left an
  // old cached snapshot in place, etc - not real progress loss. Refuse
  // it rather than let it clobber the canonical copy; the next
  // successful hydrate pulls the still-correct cloud value back down
  // locally instead. This was added after a real incident where local
  // state repeatedly overwrote more-advanced cloud progress with an old
  // snapshot - root cause not fully confirmed, so this guard is the
  // actual fix regardless of the exact mechanism.
  const { data: existing } = await supabase.from('app_state').select('state').eq('user_id', userId).maybeSingle();
  const cloudXP = (existing?.state as { progress?: { totalXP?: number } } | null)?.progress?.totalXP ?? 0;
  const localXP = state.progress.totalXP;
  if (existing && localXP < cloudXP) {
    console.error(
      `[cloudSync] refused to push: local totalXP (${localXP}) is lower than cloud's (${cloudXP}) for user ${userId} - this would have overwritten real progress`,
    );
    return;
  }

  const { error } = await supabase.from('app_state').upsert({ user_id: userId, state, updated_at: new Date().toISOString() });
  if (error) console.error('[cloudSync] failed to save:', error.message);

  // A slice of the same state is mirrored into public_profiles - just
  // enough for the league and community to show a real name/level/XP/
  // avatar for every tester, without exposing the rest of their state
  // (workout history, settings, etc.) to other signed-in users.
  if (state.profile) {
    const { error: pubError } = await supabase.from('public_profiles').upsert({
      user_id: userId,
      name: state.profile.name,
      level: state.progress.level,
      total_xp: state.progress.totalXP,
      monthly_xp: state.progress.monthlyXP,
      // The real month-to-date total queried directly from HealthKit (see
      // App.tsx's health sync effect / setMonthlySteps) - already includes
      // today, so there's nothing to add on top of it here.
      monthly_steps: state.progress.monthlySteps || 0,
      current_streak: state.progress.currentStreak,
      is_private: state.settings?.privateProfile ?? false,
      character: state.character,
      photo_url: state.profile?.photoUrl ?? null,
      // A friend's profile view shows this - only real XP events with a
      // real timestamp (see HistoryEntry.at), not the 'system' entries or
      // pre-timestamp history predating this field.
      recent_activity: state.history
        .filter((h) => h.type === 'xp' && h.at)
        .slice(0, 8)
        .map((h) => ({ label: h.label, xp: h.xp, at: h.at })),
      updated_at: new Date().toISOString(),
    });
    if (pubError) console.error('[cloudSync] failed to save public profile:', pubError.message);
  }
}

// Runs once right after sign-in: an existing account's saved state wins over
// whatever's in this browser (it's the canonical copy); a brand-new account
// has nothing to pull yet, so its current local state becomes the seed.
//
// Returns whether it's now safe to start pushing local changes - false on
// a network/query failure. The caller (useSession.ts) must not call
// startCloudSync() when this is false: on a suspected real-device data-
// loss incident, the most likely mechanism was this exact gap - hydration
// failing silently while cloud sync still armed unconditionally right
// after, so the very next local mutation (e.g. checkForNewDay() on the
// same mount) pushed whatever stale snapshot was left in local storage
// and overwrote real cloud progress with it.
export async function hydrateFromCloud(userId: string): Promise<boolean> {
  const { data, error } = await supabase.from('app_state').select('state').eq('user_id', userId).maybeSingle();
  if (error) {
    console.error('[cloudSync] failed to load:', error.message);
    return false;
  }
  if (data?.state) {
    useAppStore.setState(data.state as Partial<ReturnType<typeof useAppStore.getState>>);
    useAppStore.setState({ challenges: withAllChallenges(useAppStore.getState().challenges) });
    const p = useAppStore.getState().progress;
    if (typeof p.monthlyXP !== 'number' || !p.monthStart || typeof p.prestige !== 'number' || typeof p.monthlySteps !== 'number') {
      useAppStore.setState({
        progress: {
          ...p,
          monthlyXP: typeof p.monthlyXP === 'number' ? p.monthlyXP : p.totalXP ?? 0,
          monthStart: p.monthStart || monthStartOf(new Date().toISOString().slice(0, 10)),
          prestige: typeof p.prestige === 'number' ? p.prestige : 0,
          monthlySteps: typeof p.monthlySteps === 'number' ? p.monthlySteps : 0,
        },
      });
    }
  } else {
    await pushToCloud(userId);
  }
  return true;
}

// Debounced so a burst of rapid changes (e.g. dragging a slider) doesn't
// fire a write per frame - only once things settle for a moment.
export function startCloudSync(userId: string): void {
  stopCloudSync();
  unsubscribeStore = useAppStore.subscribe(() => {
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => pushToCloud(userId), 1500);
  });
}

export function stopCloudSync(): void {
  unsubscribeStore?.();
  unsubscribeStore = null;
  if (debounceTimer) {
    clearTimeout(debounceTimer);
    debounceTimer = null;
  }
}
