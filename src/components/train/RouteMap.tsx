import { useId, type ReactNode } from 'react';
import type { RoutePoint } from '../../lib/health';
import { haversineMeters } from '../../lib/routeSplits';

// The GPS path drawn as a glowing brand-gradient line over a plain grid -
// no map tiles, API key or per-view cost. The grid is deliberately abstract:
// fake streets under a real trace would look like a map while being wrong.
// The layout box is ~phone width, so stroke widths and markers read as px.
const W = 360;
const PAD = 34;

function kmStep(totalKm: number): number {
  if (totalKm <= 12) return 1;
  if (totalKm <= 30) return 5;
  return 10;
}

export function RouteMap({
  points,
  height = 180,
  label,
  brand = false,
}: {
  points: RoutePoint[];
  height?: number;
  // Small chip in the top-left corner, e.g. distance.
  label?: ReactNode;
  // SOMAX watermark in the bottom-right, for feed posts.
  brand?: boolean;
}) {
  const uid = useId().replace(/:/g, '');
  if (points.length < 2) return null;
  const H = height;

  const lats = points.map((p) => p.lat);
  const lngs = points.map((p) => p.lng);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);
  // Degrees of longitude cover less ground away from the equator.
  const lngScale = Math.cos((((minLat + maxLat) / 2) * Math.PI) / 180);
  const spanX = Math.max(1e-6, (maxLng - minLng) * lngScale);
  const spanY = Math.max(1e-6, maxLat - minLat);
  const scale = Math.min((W - 2 * PAD) / spanX, (H - 2 * PAD) / spanY);
  const offX = (W - spanX * scale) / 2;
  const offY = (H - spanY * scale) / 2;
  const project = (p: RoutePoint): [number, number] => [offX + (p.lng - minLng) * lngScale * scale, H - offY - (p.lat - minLat) * scale];

  const xy = points.map(project);
  const d = xy.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`).join('');

  // Whole-km markers along the trace.
  const cum: number[] = [0];
  for (let i = 1; i < points.length; i++) cum.push(cum[i - 1] + haversineMeters(points[i - 1], points[i]));
  const totalKm = cum[cum.length - 1] / 1000;
  const step = kmStep(totalKm);
  const marks: { km: number; x: number; y: number }[] = [];
  for (let km = step; km < totalKm - step * 0.35; km += step) {
    const target = km * 1000;
    const i = cum.findIndex((c) => c >= target);
    if (i <= 0) continue;
    const f = (target - cum[i - 1]) / Math.max(1e-6, cum[i] - cum[i - 1]);
    marks.push({ km, x: xy[i - 1][0] + (xy[i][0] - xy[i - 1][0]) * f, y: xy[i - 1][1] + (xy[i][1] - xy[i - 1][1]) * f });
  }

  const [sx, sy] = xy[0];
  const [ex, ey] = xy[xy.length - 1];
  const loop = haversineMeters(points[0], points[points.length - 1]) < 80;
  const xs = xy.map((p) => p[0]);
  const ys = xy.map((p) => p[1]);

  return (
    <div className="route-map" style={{ height }}>
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet" role="img" aria-label="Route map">
        <defs>
          <linearGradient id={`g${uid}`} gradientUnits="userSpaceOnUse" x1={Math.min(...xs)} y1={Math.max(...ys)} x2={Math.max(...xs)} y2={Math.min(...ys)}>
            <stop offset="0" stopColor="var(--hero-1)" />
            <stop offset="1" stopColor="var(--hero-2)" />
          </linearGradient>
          <filter id={`b${uid}`} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="6" />
          </filter>
          <pattern id={`c${uid}`} width="4" height="4" patternUnits="userSpaceOnUse">
            <rect width="4" height="4" fill="#fff" />
            <rect width="2" height="2" fill="#0a1224" />
            <rect x="2" y="2" width="2" height="2" fill="#0a1224" />
          </pattern>
        </defs>
        <path d={d} fill="none" stroke={`url(#g${uid})`} strokeWidth="12" strokeLinejoin="round" opacity=".45" filter={`url(#b${uid})`} />
        <path d={d} fill="none" stroke="var(--map-casing)" strokeWidth="9" strokeLinejoin="round" strokeLinecap="round" />
        <path d={d} fill="none" stroke={`url(#g${uid})`} strokeWidth="5" strokeLinejoin="round" strokeLinecap="round" />
        {marks.map((m) => (
          <g key={m.km}>
            <circle cx={m.x} cy={m.y} r="9" fill="var(--map-casing)" />
            <circle cx={m.x} cy={m.y} r="7.5" fill={`url(#g${uid})`} />
            <text x={m.x} y={m.y + 3} textAnchor="middle" fontFamily="IBM Plex Mono, monospace" fontSize="8" fontWeight="600" fill="#fff">
              {m.km}
            </text>
          </g>
        ))}
        {!loop && (
          <>
            <circle cx={sx} cy={sy} r="8" fill="var(--map-casing)" />
            <circle cx={sx} cy={sy} r="5.5" fill="var(--success)" />
          </>
        )}
        <circle cx={ex} cy={ey} r="10" fill="var(--map-casing)" />
        <circle cx={ex} cy={ey} r="7.5" fill={`url(#c${uid})`} />
      </svg>
      {label && <span className="rm-chip">{label}</span>}
      {brand && (
        <span className="rm-mark">
          SO<b>MAX</b>
        </span>
      )}
    </div>
  );
}
