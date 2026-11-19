// Builds public/data/exercise-catalog.json - the exercise list the program builder picks from.
// Run on demand: BUILD_CATALOG=1 npx vitest run tests/tools/exercise-catalog.build.test.ts
//
// One entry per movement, using the standard picture names (476 pictured + the planned ones from
// howto-pipeline/plan/planned_images.json), so a picked exercise matches its how-to picture.
//  - sports: from the Library programs / built-in workouts whose exercises resolve to that movement
//  - muscles: ONLY from the researched how-to data (planned movements get none until verified)
//  - movement pattern + equipment: from the standard name (and the audit catalog for pictured ones)
import fs from 'node:fs';
import path from 'node:path';
import { it } from 'vitest';
import { findHowToIndex } from '../../src/lib/exerciseHowTo';
import { WORKOUTS } from '../../src/data/workouts';
import type { CatalogData, CatalogExercise } from '../../src/lib/exerciseCatalog';

const SPORT: Record<string, string> = {
  'strength-training': 'Gym', bodybuilding: 'Gym', powerlifting: 'Gym', gym: 'Gym',
  running: 'Running', run: 'Running', swimming: 'Swimming', swim: 'Swimming', cycling: 'Cycling', ride: 'Cycling',
  boxing: 'Boxing', afl: 'AFL', soccer: 'Soccer', tennis: 'Tennis', golf: 'Golf', basketball: 'Basketball',
  'yoga-mobility': 'Yoga & mobility', yoga: 'Yoga & mobility', mobility: 'Yoga & mobility', pilates: 'Pilates',
  calisthenics: 'Calisthenics', hiit: 'HIIT & conditioning', hybrid: 'HIIT & conditioning', hyrox: 'HIIT & conditioning',
};
const sportName = (s?: string) => (s ? SPORT[s] ?? (s === 'general' || s === 'other' || s === 'fitness' ? null : s.replace(/(^|-)\w/g, (m) => m.replace('-', ' ').toUpperCase())) : null);

// first match wins
const PATTERNS: [string, RegExp][] = [
  ['Core', /pallof|double leg lift/i],
  ['Legs', /band leg press/i],
  ['Stretch & mobility', /chest opener|arm opening|side reach|arm raise with breath|reach-back|shoulder rolls|overhead reach with club|address position|pelvic turns|prone ball roll/i],
  ['Core', /toe taps|swan dive|roll-back|diagonal lift|cable lift|band running|golf takeaway|overhead hold/i],
  ['Pull', /pulling straps/i],
  ['Push', /support hold|around the world/i],
  ['Legs', /inner thigh|side splits|lateral walk/i],
  ['Conditioning', /speed skiers|step toe taps/i],
  ['Balance', /finish-position hold/i],
  ['Stretch & mobility', /stretch|\bpose\b|cars\b|mobili|roll down|foam roll|child'?s pose|savasana|cat-cow|thread the needle|open book|circles|dead hang|false-grip hang|dislocates|90\/90|pigeon|figure-4|happy baby|legs up|lizard|couch|brettzel|pancake|puppy|sphinx|cobra|downward dog|warrior|triangle|half moon|eagle arms|garland|neck|chin tuck|reach-through|reach back|angel|wall slide|reclined|supine twist|side-lying supported twist|lat stretch|forward (bend|fold|reach)|raised arms|prayer|mountain pose|extended side angle|crescent|low lunge|world'?s greatest|thoracic|ankle mobil|knee-to-wall|squat-to-stand|deep squat hold|rock-back|spine stretch|spine twist|tree pose|eight-limbed|crow pose|boat pose|chair pose|revolved|dolphin|front split|wheel/i],
  ['Plyometrics', /jump|\bhop|bound|skip|pogo|depth|drop landing|plyo|star jump|skater|line hops|snap-down|dot the i|ankle dribble|lateral jumps|cross jumps/i],
  ['Conditioning', /burpee|mountain climber|jumping jack|half jacks|jump rope|battle rope|sled|skierg|rowing machine|shuffle|high knees|butt kicks|bear (crawl|dog)|crab|carioca|strides|wall ball|thruster|man-maker|squat thrust|inchworm|fast feet|punches|8-count|turn and lunge|duck walk|spiderman ball/i],
  ['Carry', /carry/i],
  ['Lunge & step', /lunge|split squat|split jump|step-up|step-over|step up|stepping|side step/i],
  ['Squat', /squat|sit-to-stand|wall sit|leg press|pistol|mini squat|chair stand/i],
  ['Hinge', /deadlift|\brdl\b|good morning|swing|hip thrust|glute bridge|\bbridge|back extension|reverse hyper|nordic|hamstring (curl|walkout|pump|switch)|leg curl|clean|snatch|jefferson|hip hinge|kickback|superman|reverse nordic|90\/90 hip extension/i],
  ['Pull', /\brow\b|pull-up|pull up|chin-up|pulldown|face pull|pull-apart|pullover|rear-delt|reverse pec|shrug|front lever|y raise|y-t-w|y-w raise|i-raise|external rotation|internal rotation|heel hook|pull\b/i],
  ['Push', /press|push-up|dip\b|fly\b|pec deck|chaturanga|handstand|wall walk|planche|lateral raise|front raise|landmine rotation|chest pass|throw|slam|chest expansion/i],
  ['Arms', /curl|triceps|skull crusher|pushdown|wrist|grip|finger|pronation|deviation/i],
  ['Core', /plank|crunch|sit-up|v-up|hollow|dead bug|bird dog|leg raise|toes-to-bar|russian twist|woodchop|chop|pallof|anti-rotation|rollout|fallout|hundred|teaser|criss cross|criss-cross|scissors|flutter|bicycle|knee raise|l-sit|dragon flag|jackknife|roll up|roll over|\bsaw\b|rotation|twist|side bend|heel touches|toe touch|leg circles|leg stretch|leg kicks|knee folds|swimming|rolling like|seal|control balance|neck pull|leg lower|pelvic tilt|fall out|leg slides|deep abdominal|compression|tuck|copenhagen|ball squeeze|footwork|frog|semi-circle|leg pull|rocker|boomerang|hip twist|mermaid|side kick|leg criss|open-close|bent-leg raise|hip rolls|lateral rocks|knee hug|single leg bend|oblique|halo|get-up|turkish/i],
  ['Legs', /leg extension|calf|tibialis|heel (drop|raise|digs)|abduction|adductor|clam|kick\b|leg lift|leg raise|ankle|knee curl|leg swing|hip flexor|march|knee extension|quad set|hip circle|hip ir|side leg|heel squeeze|toe raise|leg (circles|lift)/i],
  ['Balance', /balance|\bstand\b|stance|tandem|heel-to-toe|sideways walk|semi-tandem|feet-together|floor get-up/i],
];
const MUSCLES: [string, RegExp][] = [
  ['Chest', /chest|pec/i], ['Back', /\blats?\b|latissimus|upper back|mid back|lower back|rhomboid|traps?|trapezius|erector|back muscles|spinal/i],
  ['Shoulders', /shoulder|delt|rotator cuff|infraspinatus|supraspinatus|teres/i], ['Biceps', /biceps(?! femoris)|brachialis/i], ['Triceps', /triceps/i],
  ['Forearms', /forearm|grip|wrist|finger/i], ['Core', /\babs?\b|abdominal|core|oblique|rectus|transverse|trunk/i], ['Glutes', /glute/i],
  ['Quads', /quad/i], ['Hamstrings', /hamstring/i], ['Calves & shins', /calf|calves|soleus|gastrocnemius|tibialis|shin/i],
  ['Hips', /hip flexor|adductor|abductor|groin|inner thigh|hip rotator|piriformis|\bhips?\b/i], ['Neck', /neck/i],
];
const EQUIP: [string, RegExp][] = [
  ['Band', /\bband/i],
  ['Barbell', /barbell|ez-bar|trap-bar|trap bar|landmine/i], ['Dumbbell', /dumbbell/i], ['Kettlebell', /kettlebell/i], ['Cable', /cable/i],
  ['Machine', /machine|pec deck|leg press|hack squat|skierg|rowing machine/i], ['Medicine ball', /med-ball|medicine ball|wall ball/i],
  ['Bench / box / step', /bench|box|\bstep\b/i], ['Bar / rings', /pull-up|chin-up|hanging|\brings?\b|parallel bar|toes-to-bar|dead hang|lever/i],
];
const BODYWEIGHT = new Set(['bodyweight', 'mat', 'wall', 'support', 'chair', 'floor', 'towel', 'doorway', 'stool', 'pole']);
const equipLabel = (e?: string) => (!e ? '' : BODYWEIGHT.has(e) ? 'Bodyweight' : /^(bench|box|step)$/.test(e) ? 'Bench / box / step' : e.replace(/^\w/, (c) => c.toUpperCase()));
const groups = (text: string | null | undefined) => (text ? MUSCLES.filter(([, re]) => re.test(text)).map(([g]) => g) : []);
const norm = (n: string) => n.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

it.runIf(!!process.env.BUILD_CATALOG)('build exercise catalog', () => {
  const howto = JSON.parse(fs.readFileSync('public/data/exercise-howto.json', 'utf8'));
  const audit = JSON.parse(fs.readFileSync('howto-pipeline/audit/catalog.json', 'utf8')) as Record<string, { canon: string; equip: string }>;
  const planned = JSON.parse(fs.readFileSync('howto-pipeline/plan/planned_images.json', 'utf8')) as Record<string, { names: string[]; labels: string[] }>;
  const plannedByName = new Map<string, string>();
  for (const [img, p] of Object.entries(planned)) for (const n of [...p.names, ...p.labels]) plannedByName.set(norm(n), img);

  // every exercise name the app ships, with the sport of its program
  const uses: { name: string; sport: string | null }[] = [];
  const walk = (dir: string) => {
    for (const f of fs.readdirSync(dir)) {
      const p = path.join(dir, f);
      if (fs.statSync(p).isDirectory()) { walk(p); continue; }
      if (!f.endsWith('.json')) continue;
      const d = JSON.parse(fs.readFileSync(p, 'utf8'));
      for (const it2 of Array.isArray(d) ? d : d.items || d.programs || []) {
        const sport = sportName(it2.sport) ?? sportName(it2.category);
        for (const e of it2.exercises || it2.content?.exercises || []) if (e.name) uses.push({ name: e.name, sport });
      }
    }
  };
  walk('src/data/library');
  for (const w of Object.values(WORKOUTS) as { category?: string; exercises: { name: string }[] }[]) for (const e of w.exercises) uses.push({ name: e.name, sport: sportName(w.category) });

  const byKey = new Map<string, { name: string; aka: Set<string>; equip?: string; prim: string | null; sec: string | null; sports: Set<string>; uses: number }>();
  const get = (key: string, name: string) => {
    let v = byKey.get(key);
    if (!v) { v = { name, aka: new Set(), prim: null, sec: null, sports: new Set(), uses: 0 }; byKey.set(key, v); }
    return v;
  };
  // pictured movements (skip pictures nothing opens - e.g. broken ones whose names were all removed)
  const used = new Set<number>();
  for (const u of uses) {
    const i = findHowToIndex(howto.lookup, u.name);
    if (i !== undefined) {
      used.add(i);
      const e = howto.entries[i];
      const v = get('p' + i, e.name);
      v.uses++; if (u.sport) v.sports.add(u.sport);
      continue;
    }
    const img = plannedByName.get(norm(u.name));
    if (img) { const v = get('n' + img, img); v.uses++; if (u.sport) v.sports.add(u.sport); }
  }
  for (const i of used) {
    const e = howto.entries[i], v = byKey.get('p' + i)!;
    (e.aka ?? []).forEach((a: string) => v.aka.add(a));
    v.prim = e.primary; v.sec = e.secondary; v.equip = audit[String(i)]?.equip;
  }
  // every planned movement is pickable (some are only used in members' own programs, e.g. Lying Toe Touch)
  for (const [img, p] of Object.entries(planned)) { const v = get('n' + img, img); p.labels.forEach((a) => v.aka.add(a)); }

  // display name: the standard name without its bracketed note, unless two movements would then share a name
  const stripped = (n: string) => n.replace(/\s*\([^)]*\)/g, '').trim();
  const clash = new Map<string, number>();
  for (const v of byKey.values()) clash.set(norm(stripped(v.name)), (clash.get(norm(stripped(v.name))) ?? 0) + 1);
  const exercises: CatalogExercise[] = [...byKey.values()].map((v) => {
    const base = (clash.get(norm(stripped(v.name)))! > 1 ? v.name : stripped(v.name));
    return {
      name: base.trim(),
      aka: [...v.aka].filter((a) => norm(a) !== norm(base)).slice(0, 12),
      pattern: PATTERNS.find(([, re]) => re.test(v.name))?.[0] ?? 'Other',
      // shown only when actually known: from the name, else the picture audit's record; unknown stays ''
      equip: EQUIP.find(([, re]) => re.test(v.name))?.[0] ?? equipLabel(v.equip),
      primary: groups(v.prim),
      secondary: groups(v.sec).filter((g) => !groups(v.prim).includes(g)),
      sports: [...v.sports].sort(),
      uses: v.uses,
    };
  });
  // two pictures can share a display name once notes are stripped - keep the more used one's name unique
  const seen = new Map<string, number>();
  for (const e of exercises.sort((a, b) => b.uses - a.uses)) { const k = norm(e.name); seen.set(k, (seen.get(k) ?? 0) + 1); }
  const data: CatalogData = {
    exercises: exercises.sort((a, b) => a.name.localeCompare(b.name)),
    sports: [...new Set(exercises.flatMap((e) => e.sports))].sort(),
    patterns: ['Push', 'Pull', 'Squat', 'Hinge', 'Lunge & step', 'Core', 'Arms', 'Legs', 'Carry', 'Plyometrics', 'Conditioning', 'Balance', 'Stretch & mobility', 'Other'].filter((p) => exercises.some((e) => e.pattern === p)),
    muscles: MUSCLES.map(([m]) => m).filter((m) => exercises.some((e) => e.primary.includes(m) || e.secondary.includes(m))),
  };
  fs.writeFileSync('public/data/exercise-catalog.json', JSON.stringify(data));
  const dup = [...seen].filter(([, n]) => n > 1).map(([k]) => k);
  console.log('exercises', data.exercises.length, '| sports', data.sports.join(', '), '| patterns', data.patterns.map((p) => `${p} ${exercises.filter((e) => e.pattern === p).length}`).join(', '), '| Other', exercises.filter((e) => e.pattern === 'Other').map((e) => e.name).join(' / '), '| no muscles', exercises.filter((e) => !e.primary.length).length, '| duplicate names', dup.join(' / '));
});
