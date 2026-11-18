# Exercise how-to imagery — muscle sourcing & design research

Researched 2026-11-18, before any production image generation (see `feedback_verify_fitness_content` /
`project_exercise_howto_imagery` memory). No images generated, no code changed as part of this research.

## 1. Sourcing methodology

No site exposes a public API or bulk-downloadable muscle dataset. ExRx.net is the strongest *structured*
source - it classifies every exercise's muscles into **Target** (prime mover), **Synergist** (assists), and
**Stabilizer** (dynamic/static/antagonist-stabilizer) - but pages have to be read individually; there's no
export. ACE's library is photo/description-based with body-part filtering, not a structured muscle field.
Below that tier, everything is prose on fitness-media sites of wildly varying quality - usable as
corroboration, not a sole source.

**Standard to use per exercise:** state Primary (target) + Secondary (synergist) muscles, cite ExRx's
classification where checkable, corroborate with at least one other reputable source (NASM, a peer-reviewed
EMG study, or a second independent fitness-education site). Where sources disagree, say so rather than
picking one.

**Confirmed disagreement to flag, not resolve as settled fact:** gym lore holds the Romanian deadlift
"isolates" hamstrings/glutes more than the conventional deadlift. Lee et al. 2018 (*J Exercise Science &
Fitness*, EMG + 3D motion, n=21) found the conventional deadlift actually produces *higher* rectus femoris
and gluteus maximus EMG, with hamstring (biceps femoris) activation not significantly different between the
two lifts. An RDL how-to must not claim it uniquely targets hamstrings over the conventional lift.

## 2. Verified seed set

| Exercise | Primary | Secondary | Confidence |
|---|---|---|---|
| Barbell bench press | Pectoralis major (sternal head) | Anterior deltoid, triceps brachii | High, strong agreement |
| Back squat | Gluteus maximus, quadriceps | Hamstrings (synergist/stabilizer), erector spinae, abdominals (stabilizers) | High on target; moderate on exact stabilizer split |
| Conventional deadlift | Glutes, hamstrings, quads, adductor magnus | Lats (pulls bar in), erector spinae/spinal stabilizers, forearms/grip | High |
| Romanian deadlift | Glutes, hamstrings | Erector spinae | High target; **do not claim it beats conventional for hamstring/glute activation** |
| Overhead press | Anterior deltoid | Triceps, trapezius, upper chest, core (standing) | High |
| Bent-over barbell row | Latissimus dorsi | Rhomboids, mid/lower trapezius, posterior deltoid, biceps | High on target; secondary ranking varies by source |
| Pull-up / lat pulldown | Latissimus dorsi | Biceps brachii | High - EMG shows near-identical lat activation between the two; pull-up adds more core. Brachialis claim is weakly sourced - don't state as fact |
| Barbell curl | Biceps brachii | Brachialis, brachioradialis | High, uncontroversial |
| Triceps pushdown | Triceps brachii | Anconeus | High, uncontroversial |
| Plank | Rectus abdominis, transverse abdominis | Obliques, shoulder stabilizers (serratus anterior, rotator cuff) | High, uncontroversial |
| Hip thrust | Gluteus maximus | Hamstrings | High on target. "Beats glute bridge" claims are mostly Contreras blog-sourced (small n) - phrase as "generally understood to," not a settled RCT finding |
| Glute bridge | Gluteus maximus | Hamstrings | Same caveat; foot-elevated variants shift toward hamstrings per Contreras |
| Doorway/chest stretch | Pectoralis major (lengthened) | - | High |
| Hip flexor stretch | Iliopsoas (lengthened) | Tensor fasciae latae, obliques, quadratus lumborum | High |
| Hamstring stretch | Hamstrings (lengthened) | - | High - needs hip flexion with the knee near-straight to be a real hamstring stretch |

**Stretching needs different copy from strength exercises**: "lengthens/stretches X," never "works/activates
X" - different physiological claim, different literature. Conflating the two is itself a false-information
risk.

## 3. Design findings

- Only one real industry-adjacent precedent with a defined color code: **Muscle & Motion** (paid 3D-anatomy
  platform, 1,000+ exercises) uses **red = primary/target muscle, pink = synergist/assisting muscle**. No
  gym-sticker manufacturer standard exists beyond individual decals - "gym stickers all look the same" isn't
  actually true, it's vendor-specific.
- Our current red/orange pairing (darker/more saturated = primary, lighter = secondary) is directionally
  right and close enough to the one real precedent - keep it rather than switch hue families.
- **"Muscle reveal" technique** worth a v2 look: only highlighting a muscle at the point in the movement it's
  actually activating, rather than static-highlighting it identically in both panels regardless of phase. Our
  2-panel (start/finish) format is a simplification of this - not required for v1.
- Couldn't find usable public detail on Strong/Jefit/Nike Training Club's own demonstration-image design
  specifically. If visual parity with a specific competitor matters, that needs a direct screenshot look, not
  web search.

## 4. Real scale of "every single exercise"

Counted directly from `somax-app/src/data/library/**/*.json` (780 programs, excluding meal files):
- 5,708 total exercise-line references, 3,122 raw distinct strings - inflated by noise, not a real count.
- After stripping set/tier suffixes ("(T1)", "- BBB", "(easy)") and separating out warm-up/cool-down
  freeform multi-exercise lines (165 of those, e.g. "cool-down: walk and stretch (hips, hamstrings,
  calves, chest)" - not single movements): **2,467 distinct movement strings**, 1,865 of which appear only
  once (long tail of near-duplicate phrasing and sport-drill names).
- Rough split of those 2,467: **~728 strength/calisthenics movements**, **~121 stretch/mobility movements**,
  **~1,618 "other"** - mostly sport-specific drills (AFL, golf, tennis, running/swim/cycle interval labels
  like "recovery," "effort," "choice") that either don't need a how-to image at all (cardio pacing labels) or
  need sport-specific triage, not a generic strength-exercise prompt template.
- **No existing muscle-group field** - `ExerciseDef` in `src/types.ts` has no muscle data today; this is
  being built from nothing, not extending something.

**Practical takeaway:** "every single exercise" is realistically **~700-900 real movements worth a how-to
image** (strength/calisthenics + stretch/mobility combined) once sport-drill and cardio-interval noise is
excluded, plus manual triage of the "other" bucket for any real missed movements. Plan the
verification-and-generation pipeline against that number, not the raw ~3,000 string count.

## 5. Recommendation for scaling verification

No bulk-scrapable structured dataset exists - this is exercise-by-exercise, but doesn't have to be fully
manual per movement:
1. Build the ~700 against a shared library of maybe 60-100 underlying muscle groups/movement patterns -
   verify each pattern pairing once (e.g. "any horizontal press -> pecs/front delts/triceps") rather than
   treating every named variation as a fresh research task.
2. The many named variations in the library (e.g. "bench press (T1)", "incline dumbbell press", "close-grip
   bench press") mostly inherit the same primary/secondary muscles as their base pattern with minor,
   well-documented shifts (grip width, bench angle) - cite the shift once per pattern, not once per
   variation.
3. Flag genuine disagreements (like the RDL case) explicitly in whatever data structure stores this, so the
   app can soften or omit a contested comparison rather than presenting it as settled fact.
