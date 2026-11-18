import { createClient } from '@supabase/supabase-js';
import { E2E } from './e2e';

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  // Fails loudly at boot rather than silently no-op'ing every auth/db call -
  // much easier to diagnose a missing .env than a blank screen.
  throw new Error('Missing VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY - check your .env file.');
}

// Screen-test mode must never reach the real database: unreachable address.
export const supabase = E2E ? createClient('http://127.0.0.1:9', 'e2e-no-key') : createClient(url, anonKey);
