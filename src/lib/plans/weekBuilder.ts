import type { PlanDay, WorkoutDef } from '../../types';
import type { IconName } from '../../data/icons';
import type { LibraryItem, LibraryLevel, LibraryProgram } from '../library';

// One matching engine for both the onboarding week and the Library's
// "For you" tab: every program is scored against the person's sport,
// goals, level, kit and time, so the week and the suggestions always agree.

export interface OnbSport {
  id: string;
  label: string;
  icon: IconName;
  colorVar: string;
  // Library `sport` ids that count as this sport's own programs.
  lib: string[];
  // How the week is shaped around it.
  shape: 'strength' | 'endurance' | 'field' | 'mindbody' | 'general';
}

export const ONB_SPORTS: OnbSport[] = [
  { id: 'gym', label: 'Gym & strength', icon: 'dumbbell', colorVar: '--stat-strength', lib: ['strength-training', 'bodybuilding', 'powerlifting', 'calisthenics'], shape: 'strength' },
  { id: 'run', label: 'Running', icon: 'run', colorVar: '--stat-endurance', lib: ['running'], shape: 'endurance' },
  { id: 'afl', label: 'AFL', icon: 'trophy', colorVar: '--stat-strength', lib: ['afl'], shape: 'field' },
  { id: 'soccer', label: 'Soccer', icon: 'trophy', colorVar: '--stat-agility', lib: ['soccer'], shape: 'field' },
  { id: 'ride', label: 'Cycling', icon: 'ride', colorVar: '--stat-agility', lib: ['cycling'], shape: 'endurance' },
  { id: 'swim', label: 'Swimming', icon: 'swim', colorVar: '--stat-discipline', lib: ['swimming'], shape: 'endurance' },
  { id: 'basketball', label: 'Basketball', icon: 'trophy', colorVar: '--stat-vitality', lib: ['basketball'], shape: 'field' },
  { id: 'tennis', label: 'Tennis', icon: 'trophy', colorVar: '--stat-recovery', lib: ['tennis'], shape: 'field' },
  { id: 'boxing', label: 'Boxing', icon: 'zap', colorVar: '--stat-strength', lib: ['boxing'], shape: 'field' },
  { id: 'golf', label: 'Golf', icon: 'trophy', colorVar: '--stat-endurance', lib: ['golf'], shape: 'mindbody' },
  { id: 'pilates', label: 'Pilates', icon: 'pilates', colorVar: '--sport-pilates', lib: ['pilates'], shape: 'mindbody' },
  { id: 'yoga', label: 'Yoga & mobility', icon: 'pilates', colorVar: '--stat-recovery', lib: ['yoga-mobility'], shape: 'mindbody' },
  { id: 'hiit', label: 'HIIT', icon: 'flame', colorVar: '--stat-vitality', lib: ['hiit'], shape: 'general' },
  { id: 'hybrid', label: 'Hybrid / HYROX', icon: 'zap', colorVar: '--stat-discipline', lib: ['hybrid'], shape: 'field' },
  { id: 'general', label: 'General fitness', icon: 'walk', colorVar: '--stat-recovery', lib: ['general'], shape: 'general' },
];

export function onbSport(id: string | null | undefined): OnbSport | undefined {
  return ONB_SPORTS.find((s) => s.id === id);
}

// A sport is only offered if the Library actually has programs for it -
// so a sport can never be picked and then handed a week of nothing.
export function sportsWithPrograms(programs: LibraryProgram[]): OnbSport[] {
  const have = new Set(programs.map((p) => p.sport));
  return ONB_SPORTS.filter((s) => s.lib.some((l) => have.has(l)));
}

export const ONB_GOALS: { id: string; label: string; sub: string; icon: IconName; colorVar: string }[] = [
  { id: 'strength', label: 'Get stronger', sub: 'Lift more, move better', icon: 'dumbbell', colorVar: '--stat-strength' },
  { id: 'muscle', label: 'Build muscle', sub: 'Size and shape', icon: 'zap', colorVar: '--stat-strength' },
  { id: 'fat-loss', label: 'Lose fat', sub: 'Training plus a sensible deficit', icon: 'flame', colorVar: '--stat-vitality' },
  { id: 'endurance', label: 'Go further, go faster', sub: 'Fitness, pace and stamina', icon: 'heart', colorVar: '--stat-endurance' },
  { id: 'mobility', label: 'Move better', sub: 'Flexibility, posture, fewer niggles', icon: 'pilates', colorVar: '--stat-recovery' },
  { id: 'general-fitness', label: 'Feel fitter overall', sub: 'A bit of everything', icon: 'fitness', colorVar: '--stat-agility' },
  { id: 'sport-performance', label: 'Perform in my sport', sub: 'Speed, power and match fitness', icon: 'trophy', colorVar: '--stat-discipline' },
];

export type TrainPlace = 'gym' | 'home' | 'outdoor' | 'mix';

export interface TrainingSetup {
  sport: string;
  extraSports: string[];
  goals: string[];
  level: LibraryLevel;
  days: number;
  sessionMinutes: number;
  place: TrainPlace;
  kit: string[];
}

const LEVEL_RANK: Record<LibraryLevel, number> = { beginner: 0, intermediate: 1, advanced: 2 };
const HOME_KIT = new Set(['bodyweight', 'dumbbells', 'dumbbell', 'bands', 'band', 'kettlebell', 'mat', 'none', 'pull-up bar', 'chair', 'step']);

function minutesOf(p: LibraryProgram): number {
  return p.content.sessionMinutes ?? (parseInt(p.duration ?? '', 10) || 40);
}

// Can this program be done where (and with what) the person trains?
function fitsPlace(p: LibraryProgram, s: TrainingSetup): boolean {
  if (s.place === 'gym' || s.place === 'mix') return true;
  const life = p.content.lifestyle ?? [];
  if (life.includes('home') || life.includes('minimal-equipment') || life.includes('outdoor')) return true;
  const kit = new Set([...s.kit.map((k) => k.toLowerCase()), 'bodyweight', 'none', 'mat']);
  const needs = p.tags.map((t) => t.toLowerCase());
  if (needs.length === 0) return true;
  return needs.every((t) => kit.has(t) || (HOME_KIT.has(t) && kit.has(t)) || t === 'bodyweight');
}

export function scoreProgram(p: LibraryProgram, s: TrainingSetup): number {
  const main = onbSport(s.sport);
  let score = 0;
  if (main?.lib.includes(p.sport ?? '')) score += 50;
  else if (s.extraSports.some((x) => onbSport(x)?.lib.includes(p.sport ?? ''))) score += 25;
  else if (['strength-training', 'yoga-mobility', 'general', 'hiit'].includes(p.sport ?? '')) score += 8;
  score += p.goals.filter((g) => s.goals.includes(g)).length * 12;
  const gap = LEVEL_RANK[p.level] - LEVEL_RANK[s.level];
  score += gap === 0 ? 20 : gap === -1 ? 8 : gap < -1 ? -5 : -40;
  if (!fitsPlace(p, s)) score -= 35;
  score -= Math.abs(minutesOf(p) - s.sessionMinutes) * 0.25;
  // A short warm-up or routine (FIFA 11+, a 15-min mobility flow) is a
  // poor stand-in for a full training day when they asked for more time.
  if (minutesOf(p) < s.sessionMinutes * 0.6) score -= 15;
  if (p.source === 'somax') score += 3;
  return score;
}

// "For you": every program ranked for this person, with a 0-100 fit.
export function rankForYou(programs: LibraryProgram[], s: TrainingSetup): { item: LibraryProgram; fit: number }[] {
  const scored = programs.map((p) => ({ item: p, score: scoreProgram(p, s) })).filter((x) => x.score > 0);
  scored.sort((a, b) => b.score - a.score);
  const top = scored[0]?.score ?? 1;
  return scored.map((x) => ({ item: x.item, fit: Math.max(50, Math.min(99, Math.round((x.score / top) * 99))) }));
}

type Role = 'main' | 'strength' | 'conditioning' | 'mobility' | `extra:${string}`;

const SHAPES: Record<OnbSport['shape'], Role[]> = {
  strength: ['main', 'main', 'main', 'main', 'mobility', 'main'],
  endurance: ['main', 'strength', 'main', 'main', 'mobility', 'main'],
  field: ['main', 'strength', 'main', 'conditioning', 'strength', 'mobility'],
  mindbody: ['main', 'strength', 'main', 'mobility', 'main', 'strength'],
  general: ['main', 'strength', 'mobility', 'main', 'strength', 'main'],
};

const ROLE_POOL: Record<'strength' | 'conditioning' | 'mobility', string[]> = {
  strength: ['strength-training', 'calisthenics'],
  conditioning: ['running', 'hiit'],
  mobility: ['yoga-mobility', 'pilates'],
};

export function libraryKey(item: LibraryItem): string {
  return `lib:${item.id}`;
}

export function programToWorkout(p: LibraryProgram): WorkoutDef {
  return { name: p.name, duration: p.duration ?? `${minutesOf(p)} min`, exercises: p.content.exercises, category: p.category };
}

// Same even spread of training days the old generator used (Sun-Sat).
function trainingSlots(days: number): number[] {
  const used = new Set<number>();
  return Array.from({ length: days }, (_, i) => Math.round((i * 7) / days))
    .map((slot) => {
      let s = slot;
      while (used.has(s)) s = (s + 1) % 7;
      used.add(s);
      return s;
    })
    .sort((a, b) => a - b);
}

export interface BuiltWeek {
  weekPlan: PlanDay[];
  // Snapshot of every scheduled Library program, keyed by its plan key -
  // stored with the week so it resolves offline and on any device.
  workouts: Record<string, WorkoutDef>;
  // The programs used, in day order (for the plan reveal screen).
  sessions: { dayIndex: number; item: LibraryProgram }[];
}

export function buildWeek(programs: LibraryProgram[], s: TrainingSetup): BuiltWeek {
  const days = Math.max(2, Math.min(6, s.days));
  const main = onbSport(s.sport) ?? ONB_SPORTS[0];
  const roles: Role[] = SHAPES[main.shape].slice(0, days);
  // Each extra sport takes one non-main slot (from the end), never the first.
  s.extraSports.slice(0, Math.max(0, days - 1)).forEach((x, i) => {
    let idx = roles.length - 1 - i;
    while (idx > 0 && roles[idx] === 'main' && roles.filter((r) => r === 'main').length <= Math.ceil(days / 2)) idx--;
    if (idx > 0) roles[idx] = `extra:${x}`;
  });

  const ranked = (pool: (p: LibraryProgram) => boolean) =>
    programs.filter(pool).map((p) => ({ p, score: scoreProgram(p, s) })).sort((a, b) => b.score - a.score).map((x) => x.p);

  const used = new Set<string>();
  const seriesQueue: LibraryProgram[] = [];
  const pick = (list: LibraryProgram[]): LibraryProgram | undefined => list.find((p) => !used.has(p.id)) ?? list[0];

  const chosen: LibraryProgram[] = roles.map((role) => {
    let list: LibraryProgram[];
    if (role === 'main') {
      if (seriesQueue.length) return seriesQueue.shift()!;
      list = ranked((p) => main.lib.includes(p.sport ?? ''));
    } else if (role.startsWith('extra:')) {
      const xs = onbSport(role.slice(6));
      list = ranked((p) => !!xs && xs.lib.includes(p.sport ?? ''));
    } else {
      const r = role as 'strength' | 'conditioning' | 'mobility';
      const pool = ROLE_POOL[r];
      // The sport's own strength/conditioning programs come first (AFL
      // strength before generic strength), then the general pool.
      const ownCats = r === 'strength' ? ['gym'] : r === 'conditioning' ? ['run', 'fitness'] : [];
      const own = ownCats.length ? ranked((p) => main.lib.includes(p.sport ?? '') && ownCats.includes(p.category) && !used.has(p.id) && LEVEL_RANK[p.level] <= LEVEL_RANK[s.level]) : [];
      list = [...own, ...ranked((p) => pool.includes(p.sport ?? ''))];
    }
    const p = pick(list) ?? pick(ranked(() => true))!;
    used.add(p.id);
    // A multi-day series (GZCLP, 5/3/1, PPL...) continues on the next main days.
    if (role === 'main' && p.content.series) {
      programs
        .filter((q) => q.content.series === p.content.series && q.id !== p.id && !used.has(q.id))
        .sort((a, b) => (a.content.day ?? 0) - (b.content.day ?? 0))
        .forEach((q) => {
          seriesQueue.push(q);
          used.add(q.id);
        });
    }
    return p;
  });

  const slots = trainingSlots(days);
  const weekPlan: PlanDay[] = new Array(7).fill(null).map(() => ({ type: 'rest' as const }));
  const workouts: Record<string, WorkoutDef> = {};
  const sessions: BuiltWeek['sessions'] = [];
  slots.forEach((dayIndex, i) => {
    const p = chosen[i];
    if (!p) return;
    const key = libraryKey(p);
    weekPlan[dayIndex] = { type: 'train', key, label: p.name };
    workouts[key] = programToWorkout(p);
    sessions.push({ dayIndex, item: p });
  });
  return { weekPlan, workouts, sessions };
}
