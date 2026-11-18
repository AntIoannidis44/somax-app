# Exercise how-to image: visual-variant audit

Source of truth: `research/muscle-verification.json` (1,250 raw records; re-derived and
confirmed **1,176** truly-distinct movements after case/whitespace normalization, 74 exact
duplicate collisions removed). Cross-referenced against `images/manifest.json` (140 existing
images) and `somax-app/public/data/exercise-howto.json`.

All 1,176 movements were re-grouped by **visual similarity** (equipment + actual body
position/motion), not by shared muscle pattern and not by the `pattern` field in
muscle-verification.json, per the two confirmed bugs that started this audit:
Roll Over Prep (on ball) vs. The Hundred, and Dumbbell Romanian Deadlift vs. Dumbbell Deadlift.
Both are correctly split apart in the current manifest/output.

## Headline numbers

| Status | Count | Meaning |
|---|---|---|
| **existing** | 98 | Already covered by one of the 140 images, correct gender under the new rule. No spend. |
| **existing-wrong-gender** | 39 | Already covered, but the image needs to be **regenerated** because it depicts a bodyweight (no-equipment) movement, or a stretch/mobility/Pilates movement, currently rendered in the wrong gender. |
| **new** | 128 | Genuinely new visual variant, not covered by any existing image. Needs a fresh generation. |
| **Total true visual variants** | **265** | |

(3 manifest entries — `Side Plank (straight arm)` #24, `Captain's Chair Leg Raise` #29,
`Dumbbell Front Raise` #39 — have an empty `movementNamesCovered` list in manifest.json itself,
so no movement from the 1,176 maps to them; they don't appear in the output. This looks like a
pre-existing manifest data gap, not something this audit caused.)

## Cost estimate

Only **new** + **existing-wrong-gender** require new spend (existing, correctly-gendered images
cost nothing further):

- New: 128 × $0.134 = **$17.152**
- Existing-wrong-gender (regeneration): 39 × $0.134 = **$5.226**
- **Total: 167 images × $0.134 = $22.378**

## The gender-rule finding (biggest sanity-check item)

Applying "bodyweight (no equipment) → female; everything else keeps its current category
assignment" **literally** flags 39 of the 140 existing images as wrong-gender — almost all of
them plain bodyweight calisthenics currently rendered male: Push-up, Bodyweight Squat, Burpee,
Plank (forearm/straight-arm/side), Crunch, Sit-up, V-up, Mountain Climber, Dead Bug, Bird-Dog,
Pull-Up, Dip (bench/parallel-bar), Box Jump, Bear Crawl, Crab Walk, A-Skips, Butt Kicks, High
Knees, Lateral Shuffle, Build-Up Sprint Strides, Dead Hang, Flutter Kicks, Nordic Hamstring Curl,
Copenhagen Plank, Inverted Row, Bulgarian Split Squat, Tibialis Raise, Wall Handstand Hold, plus
one stretch (`Overhead Triceps/Lat Stretch` #133, already in the "stretch = female" category but
currently rendered male, independent of the bodyweight rule).

**This is a large, costly implication (39 regenerations) from one rule statement — please
confirm this is actually what you want before spending anything.** A handful of these are
genuinely ambiguous about whether "equipment" should count a supporting bar/bench/box (e.g.
Bulgarian Split Squat's bench, Captain's Chair, Box Jump's box, 45-Degree Back Extension bench,
Parallel Bar Dip bars) — I treated all of these as "no equipment" (bodyweight) since nothing is
being lifted/loaded, but a looser reading could exclude apparatus-based moves from the flag.

## Judgment calls that need a sanity-check

**48 individual movement names** were mapped to an existing image by my own visual-similarity
judgment rather than being literally listed in manifest.json's (audited) `movementNamesCovered`.
Most are either (a) an "X or Y" ambiguous program name where I defaulted to the more common/first
interpretation, (b) a multi-exercise warm-up/circuit/complex description where I picked the
single most representative movement, or (c) a near-duplicate wording I judged visually identical
to an existing image (e.g. "Deadbugs" → Dead Bug, "Stiff-legged Deadlift" → Barbell Romanian
Deadlift). Full list: `judgment_flags.txt` (scratchpad). Representative examples:

- `Station 2: Straight-leg Deadlift` / `Stiff-legged Deadlift` → merged into the existing
  **Barbell Romanian Deadlift** image (near-identical pose: straight legs, hip hinge).
- `Inverted Hamstring` → merged into the existing bodyweight **Single-Leg Romanian Deadlift**.
- Several "X or Y" program names (`Pull-up or TRX Row`, `Lat work (chin-ups or rows)`,
  `Triceps Pushdown or Dip`, `Front plank or wheelbarrow hold`, `Sled Drag or Farmer Carry`,
  `Nordic Curl Negative or Sliding Leg Curl`, etc.) defaulted to one side of the "or" — the other
  interpretation might be intended in some program contexts.
- Multi-exercise descriptions (`Barbell Complex: 6 deadlifts, 6 rows, 6 hang cleans...`,
  `Preparation Drill: bend and reach, rear lunge...`, `Body Armour circuit...`) were reduced to
  their single most representative movement for image purposes.

## Judgment calls on the 128 new variants (biggest "did I over/under-split" risks)

- **`cardio_rowing_machine`** (13 names folded in): muscle-verification.json tagged ~13 movements
  as `pattern: horizontal_row` (a strength pulling pattern), but names like `Buy-in: row (men
  500m / women 400m)`, `Row sprint (90s rest)`, `Easy row or bike`, `Run or row` clearly describe
  **cardio rowing-machine (ergometer) work**, not a horizontal-pull strength exercise — visually
  a seated sliding-seat machine, nothing like a seated cable row or dumbbell row. This is the same
  class of error that started this whole audit (pattern-field grouping ≠ visual grouping). **Please
  confirm this reclassification is correct** before it's treated as a single new image.
- **`pistol_squat`**: bundles assisted/weighted/negative pistol squat together with `Weighted
  Pistol or Shrimp Squat` — a shrimp squat's rear leg is bent behind rather than extended forward,
  arguably a different silhouette. Sanity-check.
- **`low_lunge_mega`** (9 names folded in): Dragon pose, Lizard Lunge, Equestrian Lunge (Ashwa
  Sanchalanasana), plain Low Lunge, Low Lunge Twist, Low Lunge with reach, plus two warm-up combo
  descriptions, all folded into one "deep low-lunge yoga stretch" variant. These are closely
  related poses but Lizard Lunge in particular (forearms often down) could arguably be its own
  variant. Sanity-check if this is too aggressive a merge.
- **`front_lever_hold`**: tuck / straddle / "progression" front-lever phrasings bundled into one
  variant even though leg position (tucked vs. straight) visibly changes the silhouette.
- **`teaser_pilates`**: folds `Teaser with band` into the plain Teaser hold (band would be visible
  in the photo) — flagged as a deliberate "don't over-split near-duplicates" call per your
  instructions, but worth a glance.
- **`clamshell`**: `"Clamshell or Fire Hydrant"` defaulted into the side-lying Clamshell group
  rather than the quadruped Fire Hydrant group (kept as its own, separate new variant) — confirm
  the default direction is the one you want.
- Four of the 128 new variants need **less-common gym machines** not yet used anywhere else in
  the existing 140 images: belt-squat rig (`belt_squat`), angled hack-squat sled
  (`hack_squat_machine`), reverse-hyper bench (`reverse_hyper`), and a glute-ham developer/GHD
  (`glute_ham_raise`). Worth confirming your target gyms actually have this equipment before
  spending on images for it.

## Output files

- `research/visual-variants.json` — 265 variant objects, one per true visual variant, covering
  all 1,176 movements exactly once (`{variantId, equipment, movementDescription, gender, movementNamesCovered, status, existingImagePath}`).
- `research/visual-variants-summary.md` — this file.
