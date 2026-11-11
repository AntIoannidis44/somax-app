import { lazy, Suspense, useEffect, useState, type ComponentProps } from 'react';

// The Library screen lives in its own chunk so the Train / Nutrition tabs
// stay light. But a React.lazy screen that suspends on first open is held
// back by React's ~300ms Suspense reveal throttle - measured as a fixed
// 300ms delay on open at both 1x and 6x CPU. So: fetch the chunk quietly
// at idle once the tab has painted, and render it directly (no Suspense)
// when it's already here. Only the code is prefetched - the library data
// itself still loads only when the screen opens.

type LibraryModule = typeof import('./LibraryScreen');
let loaded: LibraryModule | null = null;
let loading: Promise<LibraryModule> | null = null;

function load(): Promise<LibraryModule> {
  if (!loading) loading = import('./LibraryScreen').then((m) => (loaded = m));
  return loading;
}

const LazyScreen = lazy(() => load().then((m) => ({ default: m.LibraryScreen })));

export function usePrefetchLibrary() {
  useEffect(() => {
    if (loaded) return;
    const w = window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number; cancelIdleCallback?: (id: number) => void };
    if (w.requestIdleCallback) {
      const id = w.requestIdleCallback(() => void load(), { timeout: 4000 });
      return () => w.cancelIdleCallback?.(id);
    }
    const t = window.setTimeout(() => void load(), 2000);
    return () => window.clearTimeout(t);
  }, []);
}

export function LibraryScreenLazy(props: ComponentProps<LibraryModule['LibraryScreen']>) {
  // Re-render once if the chunk lands while the fallback path is showing.
  const [, setTick] = useState(0);
  useEffect(() => {
    if (!loaded) load().then(() => setTick((t) => t + 1));
  }, []);
  if (loaded) {
    const Screen = loaded.LibraryScreen;
    return <Screen {...props} />;
  }
  return (
    <Suspense fallback={null}>
      <LazyScreen {...props} />
    </Suspense>
  );
}
