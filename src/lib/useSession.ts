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
        await hydrateFromCloud(userId);
        await loadMyWorkouts(userId);
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
