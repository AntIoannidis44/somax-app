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

export const MAX_LEVEL = 55;

// The cap rises slightly as you level up - +10 every 5 levels, so a level 1
// starter is capped at 140/day and the level-55 cap tops out at 240/day.
export function dailyCapForLevel(level: number): number {
  const lvl = Math.max(1, Math.min(level, MAX_LEVEL));
  return DAILY_CAP + Math.floor((lvl - 1) / 5) * 10;
}

export function levelFromXP(xp: number): number {
  let lvl = 1;
  for (let i = 1; i < LEVEL_TABLE.length; i++) {
    if (xp >= LEVEL_TABLE[i]) lvl = i + 1;
    else break;
  }
  return Math.min(lvl, MAX_LEVEL);
}

export function levelFloor(lvl: number): number {
  return LEVEL_TABLE[lvl - 1] || 0;
}

export function levelCeil(lvl: number): number {
  return LEVEL_TABLE[lvl] !== undefined ? LEVEL_TABLE[lvl] : LEVEL_TABLE[LEVEL_TABLE.length - 1] + 4000;
}
