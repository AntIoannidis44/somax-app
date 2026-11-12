// The real tier badge, already shown top-right in every main tab's header
// (see LevelBadge.tsx's .lvl-hex/.lvl-ring) - reused here instead of a new
// shape, so the Level Path shows the same badge players already recognise.
export function TierBadge({ level, c1, c2, pct, size = 36 }: { level: number; c1: string; c2: string; pct?: number; size?: number }) {
  const hex = (
    <span className="lvl-hex" style={{ ['--c1' as string]: c1, ['--c2' as string]: c2, width: size, height: size, fontSize: size * 0.36 }}>
      {level}
    </span>
  );
  if (pct === undefined) return hex;
  return (
    <span className="lvl-ring" style={{ ['--p' as string]: `${Math.round(pct * 100)}%`, width: size + 5, height: size + 5 }}>
      {hex}
    </span>
  );
}
