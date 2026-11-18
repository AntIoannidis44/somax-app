import { supabase } from './supabase';

// Image-URL-to-exercise-name data for the Programs "how-to" feature. Fetched
// lazily as a static JSON asset (not bundled into app JS - this is pure
// data, same lesson as the Library's own program/meal data) and cached in
// memory once loaded. See exercise-howto/images/manifest.json (one level up
// from this repo) for how this was built and exercise-howto/research/ for
// the sports-science verification behind the muscle claims.
interface HowToEntry {
  url: string;
  primary: string;
  secondary: string | null;
  confidence: 'high' | 'moderate' | 'moderate-high' | 'low' | 'low-moderate';
  bestPractice: boolean;
}
interface HowToData {
  entries: HowToEntry[];
  lookup: Record<string, number>;
  // No picture of our own: link to the original program's demonstration
  // (video / manual / PDF) instead - only for exercises from outside programs.
  links?: Record<string, { link: string; linkLabel: string }>;
}

let dataPromise: Promise<HowToData | null> | null = null;

function loadData(): Promise<HowToData | null> {
  if (!dataPromise) {
    dataPromise = fetch('/data/exercise-howto.json')
      .then((r) => (r.ok ? r.json() : null))
      .catch(() => null);
  }
  return dataPromise;
}

function normalize(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ');
}

// User-typed and program names carry extras the exact lookup can't know:
// "Flat dumbbell bench press (drop set)", "Side plank, both sides",
// "Barbell or machine bicep curl". Try the exact name first, then the name
// without bracketed notes / after-comma notes, then each "X or Y" option.
// Never fuzzy on the movement itself - only removes trailing notes.
export function candidates(name: string): string[] {
  const out: string[] = [];
  const add = (n: string) => {
    const k = normalize(n);
    if (k && !out.includes(k)) out.push(k);
  };
  add(name);
  const noBrackets = name.replace(/\([^)]*\)/g, ' ');
  add(noBrackets);
  const noTail = noBrackets.split(/[,;:]| - | – /)[0];
  add(noTail);
  add(noTail.replace(/\b(both sides|each side|per side|each leg|each arm|left|right|drop set|warm ?up|light|heavy|slow|tempo)\b/gi, ' '));
  // "barbell or machine bicep curl" -> "barbell bicep curl", "machine bicep curl"
  const m = noTail.match(/^(.*?)\b(\w+) or (\w+)\b(.*)$/i);
  if (m) {
    add(`${m[1]}${m[2]}${m[4]}`);
    add(`${m[1]}${m[3]}${m[4]}`);
  }
  noTail.split(/\s+or\s+/i).forEach(add);
  // plural last word: "Crunches" -> "crunch", "Lunges" -> "lunge"
  for (const k of [...out]) {
    const sing = k.replace(/(ches|shes)$/, (x) => x.slice(0, -2)).replace(/([^s])s$/, '$1');
    if (sing !== k) add(sing);
  }
  return out;
}

function find(data: HowToData, name: string): number | undefined {
  for (const k of candidates(name)) {
    if (data.lookup[k] !== undefined) return data.lookup[k];
  }
  return undefined;
}

export interface ExerciseHowTo {
  imageUrl: string;
  primaryMuscle: string;
  secondaryMuscle: string | null;
  confidence: HowToEntry['confidence'];
  bestPracticeJudgment: boolean;
}

// Exact-name lookup against the 1,218 movement-name variants the research
// agent mapped to the 140 generated images - no fuzzy matching, so an
// exercise with a name the data doesn't recognise just has no how-to yet
// (shown as the dashed/pending button state) rather than a wrong match.
export async function getExerciseHowTo(exerciseName: string): Promise<ExerciseHowTo | null> {
  const data = await loadData();
  if (!data) return null;
  const idx = find(data, exerciseName);
  if (idx === undefined) return null;
  const e = data.entries[idx];
  const { data: pub } = supabase.storage.from('exercise-howto').getPublicUrl(e.url.replace(/^exercise-howto\//, ''));
  return {
    imageUrl: pub.publicUrl,
    primaryMuscle: e.primary,
    secondaryMuscle: e.secondary,
    confidence: e.confidence,
    bestPracticeJudgment: e.bestPractice,
  };
}

// For the Programs exercise list, which needs a yes/no per row up front
// (to show the real vs. dashed button) without awaiting a full lookup per
// row - cheap once the data file itself has loaded.
export async function hasExerciseHowTo(exerciseName: string): Promise<boolean> {
  const data = await loadData();
  if (!data) return false;
  return find(data, exerciseName) !== undefined;
}

// When there is no picture: the original program's own demonstration, if any.
export async function getExerciseSourceLink(exerciseName: string): Promise<{ link: string; linkLabel: string } | null> {
  const data = await loadData();
  if (!data?.links) return null;
  for (const k of candidates(exerciseName)) if (data.links[k]) return data.links[k];
  return null;
}
