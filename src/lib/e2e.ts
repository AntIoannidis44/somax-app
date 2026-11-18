// Screen-test mode (tests/e2e). ONLY in the local Vite dev server (`import.meta.env.DEV`
// is false in every `vite build`, so this is stripped from TestFlight / production),
// and only with `?e2e=1` in the URL. In this mode:
//  - login is skipped with a fake local user (useSession / useUserId),
//  - the Supabase client points at an unreachable address, so nothing can ever be
//    read from or written to the real database (supabase.ts),
//  - Apple Health is a fake the test script installs as window.__E2E_HEALTH__ (health.ts),
//  - the store is exposed as window.__store so the script can seed state.
export const E2E: boolean =
  import.meta.env.DEV && typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('e2e');
export const E2E_USER_ID = 'e2e-test-user';
