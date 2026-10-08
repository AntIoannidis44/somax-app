import type { RoutePoint } from './health';

function haversineMeters(a: RoutePoint, b: RoutePoint): number {
  const R = 6371000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

export interface KmSplit {
  km: number;
  seconds: number;
}

// Walks the GPS trace accumulating distance, and whenever a whole-km mark
// is crossed, linearly interpolates the exact time it happened between the
// two bracketing points - this is what "average kilometer splits" actually
// means (the real elapsed time for each km), not just total time / count.
export function computeKmSplits(route: RoutePoint[]): KmSplit[] {
  if (route.length < 2) return [];
  const startMs = new Date(route[0].t).getTime();
  // A route point with a missing/malformed timestamp has no business
  // computing a pace at all - better to show no splits than "NaN:NaN /km".
  if (Number.isNaN(startMs)) return [];
  const splits: KmSplit[] = [];
  let cumMeters = 0;
  let nextKmMeters = 1000;
  let km = 1;

  for (let i = 1; i < route.length; i++) {
    const prev = route[i - 1];
    const cur = route[i];
    const segMeters = haversineMeters(prev, cur);
    if (segMeters <= 0) continue;
    const segStart = cumMeters;
    const segEnd = cumMeters + segMeters;

    while (nextKmMeters <= segEnd) {
      const frac = (nextKmMeters - segStart) / segMeters;
      const prevMs = new Date(prev.t).getTime();
      const curMs = new Date(cur.t).getTime();
      const crossingMs = prevMs + (curMs - prevMs) * frac;
      splits.push({ km, seconds: Math.round((crossingMs - startMs) / 1000) });
      km += 1;
      nextKmMeters += 1000;
    }
    cumMeters = segEnd;
  }
  return splits;
}

export function formatPace(secondsPerKm: number): string {
  const m = Math.floor(secondsPerKm / 60);
  const s = Math.round(secondsPerKm % 60);
  return `${m}:${s.toString().padStart(2, '0')} /km`;
}

export function totalRouteMeters(route: RoutePoint[]): number {
  let total = 0;
  for (let i = 1; i < route.length; i++) total += haversineMeters(route[i - 1], route[i]);
  return total;
}
