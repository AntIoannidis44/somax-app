import { useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from './supabase';
import { hydrateFromCloud, startCloudSync, stopCloudSync } from './cloudSync';

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
