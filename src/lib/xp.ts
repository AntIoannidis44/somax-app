export const DAILY_CAP = 140;

export const LEVEL_TABLE: number[] = (() => {
  const t = [0];
  let total = 0;
  for (let i = 1; i < 60; i++) {
    total += Math.round(55 + i * 32 + Math.pow(i, 1.55) * 3.2);
    t.push(total);
  }
  return t;
})();

export function levelFromXP(xp: number): number {
  let lvl = 1;
  for (let i = 1; i < LEVEL_TABLE.length; i++) {
    if (xp >= LEVEL_TABLE[i]) lvl = i + 1;
    else break;
  }
  return Math.min(lvl, LEVEL_TABLE.length);
}

export function levelFloor(lvl: number): number {
  return LEVEL_TABLE[lvl - 1] || 0;
}

export function levelCeil(lvl: number): number {
  return LEVEL_TABLE[lvl] !== undefined ? LEVEL_TABLE[lvl] : LEVEL_TABLE[LEVEL_TABLE.length - 1] + 4000;
}
