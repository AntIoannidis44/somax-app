import type { RoutePoint } from '../../lib/health';

// Deliberately not a real street map - just the GPS path itself, drawn as a
// clean line in our own brand colors on a plain card. No map tiles, no API
// key, no per-view cost, fully on-brand (per the user's explicit choice
// over a real MapKit/Mapbox view).
export function RouteMap({ points, height = 180 }: { points: RoutePoint[]; height?: number }) {
  if (points.length < 2) return null;

  const lats = points.map((p) => p.lat);
  const lngs = points.map((p) => p.lng);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);

  // Equirectangular-ish correction so the shape isn't stretched - degrees
  // of longitude cover less real distance the further from the equator.
  const midLatRad = ((minLat + maxLat) / 2) * (Math.PI / 180);
  const lngScale = Math.cos(midLatRad);

  const spanLat = Math.max(1e-6, maxLat - minLat);
  const spanLng = Math.max(1e-6, (maxLng - minLng) * lngScale);
  const span = Math.max(spanLat, spanLng);

  const PAD = 0.12; // keep the route off the card edges
  const size = 100;
  // The shorter axis's content needs to be nudged forward by half the
  // slack between it and the longer axis to land centered in the square
  // canvas - this was subtracting that slack instead of adding it, which
  // doesn't center the route at all, it shifts it off-center by double
  // the correct offset in the wrong direction.
  function project(p: RoutePoint): [number, number] {
    const x = ((p.lng - minLng) * lngScale + (span - spanLng) / 2) / span;
    const y = (p.lat - minLat + (span - spanLat) / 2) / span;
    return [PAD * size + x * size * (1 - 2 * PAD), (1 - PAD) * size - y * size * (1 - 2 * PAD)];
  }

  const d = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${project(p).join(' ')}`).join(' ');
  const [startX, startY] = project(points[0]);
  const [endX, endY] = project(points[points.length - 1]);

  return (
    <div className="route-map" style={{ height }}>
      <svg viewBox={`0 0 ${size} ${size}`} preserveAspectRatio="xMidYMid meet">
        <path d={d} fill="none" stroke="url(#routeGrad)" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
        <defs>
          <linearGradient id="routeGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="var(--hero-1)" />
            <stop offset="100%" stopColor="var(--hero-2)" />
          </linearGradient>
        </defs>
        <circle cx={startX} cy={startY} r="2.6" fill="#fff" stroke="var(--hero-1)" strokeWidth="1.6" />
        <circle cx={endX} cy={endY} r="2.6" fill="var(--hero-2)" />
      </svg>
    </div>
  );
}
