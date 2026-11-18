// Name gate for exercise how-to pictures: does an exercise name describe the picture it opens?
// Every picture carries its own exercise name (+ reviewed alternative names). An exercise name
// passes when, after dropping notes ("(drop set)", "Station 3:", ", both sides"), its movement
// words equal a picture name's movement words. Equipment / position / angle / one-arm words may be
// left out, but must never contradict the picture (a "Seated" name can't open a standing picture).

const PHRASES: [RegExp, string][] = [
  [/\bpress[- ]?ups?\b/g, 'push up'], [/\bpush[- ]?ups?\b/g, 'push up'], [/\bpull[- ]?ups?\b/g, 'pull up'],
  [/\bchin[- ]?ups?\b/g, 'chin up'], [/\bsit[- ]?ups?\b/g, 'sit up'], [/\bstep[- ]?ups?\b/g, 'step up'],
  [/\bpull[- ]?downs?\b/g, 'pulldown'], [/\bmed(icine)?[- ]?balls?\b/g, 'medicine ball'],
  [/\bdb\b/g, 'dumbbell'], [/\bkb\b/g, 'kettlebell'], [/\bbb\b/g, 'barbell'], [/\brdl\b/g, 'romanian deadlift'],
  [/\bbiceps?\b/g, 'biceps'], [/\btriceps?\b/g, 'triceps'], [/\b(hex|trap)[- ]?bar\b/g, 'trapbar'],
  [/\bez[- ]?bar\b/g, 'ezbar'], [/\bcambered bar\b/g, 'ezbar'], [/\b(1|one|single)[- ]arm(ed)?\b/g, 'onearm'],
  [/\b(1|one|single)[- ]leg(ged)?\b/g, 'oneleg'], [/\bhalf[- ]kneeling\b/g, 'halfkneeling'],
  [/\btall[- ]kneeling\b/g, 'kneeling'], [/\bside[- ]lying\b/g, 'sidelying'], [/\bbanded\b/g, 'band'],
  [/\b90\s*[/-]\s*90\b/g, 'ninetyninety'], [/\bbody ?weight\b/g, 'bodyweight'], [/\broll[- ]outs?\b/g, 'rollout'], [/\b(push|press)[- ]?downs?\b/g, 'pushdown'],
  [/\bdead ?bugs?\b/g, 'dead bug'], [/\bswiss[- ]?ball\b/g, 'stability ball'], [/\bt[- ]spine\b/g, 'thoracic'], [/\bwarm[- ]?ups?\b/g, ' '], [/\bcool[- ]?downs?\b/g, ' '],
];

// Words that never change which exercise it is.
const NOISE = new Set(('a an the with and of to on in at for your each both per if needed you can as ' +
  'hold holds rep reps set sets light heavy slow fast easy steady max optional alternating alternate basic ' +
  'simple standard regular controlled explosive paused pause tempo competition speed progression practice ' +
  'finisher work only version beginner intermediate advanced modified supported assisted gentle ' +
  'exercise drill round rounds minute min station block every single volume pose flow holding from cm m kg s onto along against using nearby hard second static dynamic eccentric planned').split(' '));

// Attribute words: may be missing from the exercise name, must not contradict the picture.
const CATEGORY: Record<string, string> = {};
const cat = (c: string, words: string) => words.split(' ').forEach((w) => (CATEGORY[w] = c));
cat('equip', 'barbell dumbbell kettlebell cable band machine ezbar trapbar sandbag landmine ring rings trx smith bodyweight');
cat('pos', 'standing seated sitting kneeling halfkneeling lying supine prone sidelying');
cat('angle', 'flat incline decline');
cat('limb', 'onearm oneleg');
const POS_EQUIV: Record<string, string> = { sitting: 'seated', supine: 'lying', prone: 'lying', sidelying: 'lying' };

// Props/support words: an exercise may name them without the picture doing so.
const SOFT = new Set('chair wall step box mat bed couch table desk rail support counter kitchen partner anchored anchor held'.split(' '));

function words(s: string): string[] {
  let t = ' ' + s.toLowerCase().replace(/[’']/g, '') + ' ';
  for (const [re, rep] of PHRASES) t = t.replace(re, rep);
  return t.replace(/[^a-z0-9]+/g, ' ').trim().split(/\s+/).filter(Boolean)
    .map((w) => (/(ch|sh|x)es$/.test(w) ? w.slice(0, -2) : w.length > 3 && /[^s]s$/.test(w) ? w.slice(0, -1) : w));
}

interface Form { move: Set<string>; attrs: Set<string>; opt: Set<string> }

function form(pictureName: string): Form {
  const inside = (pictureName.match(/\(([^)]*)\)/g) || []).join(' ');
  const outside = pictureName.replace(/\([^)]*\)/g, ' ');
  const move = new Set<string>(), attrs = new Set<string>(), opt = new Set<string>();
  for (const w of words(outside)) {
    if (NOISE.has(w)) continue;
    (CATEGORY[w] ? attrs : move).add(w);
  }
  for (const w of words(inside)) (CATEGORY[w] ? attrs : opt).add(w);
  return { move, attrs, opt };
}

function variants(name: string): string[] {
  const out = new Set<string>();
  const noBr = name.replace(/\([^)]*\)/g, ' ');
  const afterColon = noBr.includes(':') ? noBr.slice(noBr.lastIndexOf(':') + 1) : noBr;
  const beforeColon = noBr.split(':')[0];
  for (const base of [noBr, afterColon, beforeColon]) {
    const cut = base.split(/[,;]| - | – | — /)[0];
    for (const v of [base, cut]) {
      out.add(v);
      const m = v.match(/^(.*?)\b(\w+) or (\w+)\b(.*)$/i);
      if (m) { out.add(`${m[1]}${m[2]}${m[4]}`); out.add(`${m[1]}${m[3]}${m[4]}`); }
      v.split(/\s+or\s+|\s*\/\s*|\s+\+\s+/i).forEach((x) => out.add(x));
    }
  }
  return [...out].filter((v) => v.trim());
}

function passesForm(exWords: string[], f: Form): boolean {
  const ex = new Set(exWords.filter((w) => !NOISE.has(w)));
  if (f.move.size === 0 || ex.size === 0) return false;
  for (const w of f.move) if (!ex.has(w)) return false; // includes numbers in the picture name: Warrior 1 is not Warrior 2
  const pictureAttrs = new Set([...f.attrs].map((w) => POS_EQUIV[w] ?? w));
  for (const w of ex) {
    if (f.move.has(w) || f.opt.has(w) || SOFT.has(w)) continue;
    if (/^\d+$/.test(w)) continue; // set/rep/time numbers in an exercise name don't change the movement
    const c = CATEGORY[w];
    if (!c) return false; // an extra movement word: a different exercise
    const norm = POS_EQUIV[w] ?? w;
    if (pictureAttrs.has(norm)) continue;
    // stated attribute the picture doesn't have
    if (c === 'limb') return false;
    if (c === 'equip' && norm === 'bodyweight') return false;
    const sameCat = [...pictureAttrs, ...f.opt].some((p) => CATEGORY[p] === c && (POS_EQUIV[p] ?? p) !== norm);
    if (sameCat || c === 'angle' || c === 'equip' || c === 'pos') return false;
  }
  return true;
}

/** True when the exercise name matches the picture's name or one of its reviewed alternative names. */
export function nameMatchesPicture(exerciseName: string, pictureName: string, aka: string[] = []): boolean {
  // The main name's equipment/position/angle facts are true of the picture, so they apply to every alternative name too.
  const main = form(pictureName);
  const forms = [main, ...aka.map((a) => {
    const f = form(a);
    return { move: f.move, attrs: new Set([...f.attrs, ...main.attrs]), opt: new Set([...f.opt, ...main.opt]) };
  })];
  return variants(exerciseName).some((v) => forms.some((f) => passesForm(words(v), f)));
}
