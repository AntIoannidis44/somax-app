import { useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from './supabase';
import { hydrateFromCloud, startCloudSync, stopCloudSync } from './cloudSync';
import { loadMyWorkouts } from './customWorkouts';

// A lighter version of useSession for components that just need to know
// "who am I" (e.g. to mark which league row/post is mine) without also
// re-running the cloud hydrate/sync side effects that hook owns.
export function useUserId(): string | null {
  const [userId, setUserId] = useState<string | null>(null);
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setUserId(data.session?.user.id ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => setUserId(next?.user.id ?? null));
    return () => sub.subscription.unsubscribe();
  }, []);
  return userId;
}

export function useSession() {
  const [session, setSession] = useState<Session | null | undefined>(undefined); // undefined = still checking
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let lastUserId: string | null = null;

    async function applySession(next: Session | null) {
      const userId = next?.user.id ?? null;
      if (userId === lastUserId) return;
      lastUserId = userId;
      if (userId) {
        // Retry a few times (short, fixed backoff - a cold-launch network
        // hiccup is the realistic failure mode here, not a persistent
        // outage) rather than give up after one attempt. Only arm cloud
        // sync once hydration has actually succeeded - starting it
        // unconditionally was the likely mechanism behind a real data-
        // loss incident: a failed hydrate left local storage on
        // whatever stale snapshot it had, and the very next local state
        // change (e.g. checkForNewDay() on the same mount) then pushed
        // that stale snapshot up, overwriting real cloud progress.
        let hydrated = await hydrateFromCloud(userId);
        for (let attempt = 0; !hydrated && attempt < 3; attempt++) {
          await new Promise((r) => setTimeout(r, 800));
          if (cancelled || userId !== lastUserId) return;
          hydrated = await hydrateFromCloud(userId);
        }
        await loadMyWorkouts(userId);
        if (!hydrated) {
          console.error(`[useSession] giving up on cloud hydration for ${userId} after retries - staying local-only this session, not pushing`);
          return;
        }
        startCloudSync(userId);
      } else {
        stopCloudSync();
      }
    }

    supabase.auth.getSession().then(async ({ data }) => {
      if (cancelled) return;
      await applySession(data.session);
      if (!cancelled) {
        setSession(data.session);
        setReady(true);
      }
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
      applySession(next).then(() => {
        if (!cancelled) setSession(next);
      });
    });

    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
      stopCloudSync();
    };
  }, []);

  return { session, ready };
}
