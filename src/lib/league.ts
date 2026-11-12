import type { PublicProfile } from './social';

// League ranking - the single source of truth for who is where and what
// number is shown next to them. The podium, every list row and the "You"
// bar all read from here, so they can never disagree about which stat a
// board shows (rows 4+ once showed steps on the XP board and XP on the
// Steps board, while the podium showed the right one).

export type Board = 'xp' | 'steps';

export interface Ranked {
  row: PublicProfile;
  rank: number; // 1-based position
  score: number; // this board's number for this month
  label: string; // "811 XP" / "89,740 steps"
}

function monthStart(now: Date): number {
  return new Date(now.getFullYear(), now.getMonth(), 1).getTime();
}

// A profile only counts toward this month if it has synced this month -
// otherwise monthly_xp / monthly_steps still hold LAST month's totals
// (they reset on the device the next time that person opens the app).
function activeThisMonth(r: PublicProfile, now: Date): boolean {
  const t = Date.parse(r.updated_at ?? '');
  return Number.isFinite(t) && t >= monthStart(now);
}

export function monthlyXP(r: PublicProfile, now = new Date()): number {
  return activeThisMonth(r, now) ? Math.max(0, Number(r.monthly_xp) || 0) : 0;
}

export function monthlySteps(r: PublicProfile, now = new Date()): number {
  return activeThisMonth(r, now) ? Math.max(0, Math.round(Number(r.monthly_steps) || 0)) : 0;
}

export function boardScore(r: PublicProfile, board: Board, now = new Date()): number {
  return board === 'xp' ? monthlyXP(r, now) : monthlySteps(r, now);
}

export function scoreLabel(score: number, board: Board): string {
  return `${score.toLocaleString()} ${board === 'xp' ? 'XP' : 'steps'}`;
}

// Highest first. Ties break on the other board's number, then lifetime XP,
// then name - so equal scores keep a stable, sensible order instead of
// whatever order the database happened to return.
export function rankLeague(rows: PublicProfile[], board: Board, now = new Date()): Ranked[] {
  const other: Board = board === 'xp' ? 'steps' : 'xp';
  return rows
    .map((row) => ({ row, score: boardScore(row, board, now), tie: boardScore(row, other, now) }))
    .sort(
      (a, b) =>
        b.score - a.score ||
        b.tie - a.tie ||
        (Number(b.row.total_xp) || 0) - (Number(a.row.total_xp) || 0) ||
        (a.row.name ?? '').localeCompare(b.row.name ?? ''),
    )
    .map((x, i) => ({ row: x.row, rank: i + 1, score: x.score, label: scoreLabel(x.score, board) }));
}
