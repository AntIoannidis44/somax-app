import { supabase } from './supabase';
import { useAppStore } from '../store/useAppStore';

let unsubscribeStore: (() => void) | null = null;
let debounceTimer: ReturnType<typeof setTimeout> | null = null;

function stateForCloud() {
  // Same shape as the localStorage persist partialize - just drop the
  // transient UI fields (toast/levelUp), everything else is plain data.
  const { toast: _toast, levelUp: _levelUp, ...rest } = useAppStore.getState();
  return rest;
}

async function pushToCloud(userId: string) {
  const { error } = await supabase
    .from('app_state')
    .upsert({ user_id: userId, state: stateForCloud(), updated_at: new Date().toISOString() });
  if (error) console.error('[cloudSync] failed to save:', error.message);
}

// Runs once right after sign-in: an existing account's saved state wins over
// whatever's in this browser (it's the canonical copy); a brand-new account
// has nothing to pull yet, so its current local state becomes the seed.
export async function hydrateFromCloud(userId: string): Promise<void> {
  const { data, error } = await supabase.from('app_state').select('state').eq('user_id', userId).maybeSingle();
  if (error) {
    console.error('[cloudSync] failed to load:', error.message);
    return;
  }
  if (data?.state) {
    useAppStore.setState(data.state as Partial<ReturnType<typeof useAppStore.getState>>);
  } else {
    await pushToCloud(userId);
  }
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
