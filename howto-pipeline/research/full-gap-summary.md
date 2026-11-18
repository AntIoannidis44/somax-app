# Full gap analysis — closing the entire exercise-how-to scope

Produced 2026-11-18, continuing directly from `muscle-verification.json` (1,250 records / 1,176 distinct) and
`visual-variants.json` (265 variants, $22.378). Those two files only ever covered movements from the program
library snapshot the original research was built against. This pass re-extracts the **current, full** library
and closes the rest of the gap. No images generated, no app code changed — data/research only.

## 1. The real scope, recomputed from the live library

| | Count |
|---|---|
| Total exercise-line references (`ex.name`, meal files excluded) | 5,856 |
| Distinct raw strings | **3,267** (the quoted "3,162" was a slightly earlier snapshot; close enough to confirm the right scale) |
| Already in `muscle-verification.json` (case/whitespace-deduped) | 1,176 |
| **Residual gap actually analysed this pass** | **2,003** |

## 2. What happened to all 2,003

| Bucket | Count | Meaning |
|---|---|---|
| **Rescued — already covered** | 171 | Same movement as an existing `muscle-verification.json` entry or an existing production image, just phrased differently (case, punctuation, "Doorway Chest Stretch" vs "Chest Doorway Stretch", etc.) — caught by loose-normalized matching against `images/manifest.json`'s alias lists plus a manually-reviewed fuzzy pass. No new work. |
| **Excluded as noise** | ~1,005 | Cardio pacing/interval/distance labels, sport-specific drills (AFL, golf, boxing, basketball, swim/bike sets), pure balance/fall-prevention holds, CARs-named rehab-prep drills, breathing/pelvic-floor drills, rest/recovery labels — the same categories the *original* research already established as not image-worthy. |
| **Circuit/complex lines, decomposed** | 108 | AMRAP/EMOM/warm-up-cooldown freeform lines plus the four Sun Salutation sequence labels. Decomposed into real component movements — **every single one resolved to a movement already covered** (by `muscle-verification.json` or by this pass's own new list). Net new movements from decomposition: **0**. Its value here was confirming nothing real was being silently discarded. |
| **New genuine movement records (this file)** | **164** | See §3. |
| **Unresolved ambiguous fuzzy matches** | 22 | Candidates a loose token-match surfaced but couldn't be confidently called "same movement" or "different movement" (e.g. does "Thigh Stretch" mean the existing Butterfly Inner-Thigh Stretch, or something else?). Left unresolved rather than guessed either way. |
| **Long tail reviewed in batches, not individually sourced** | ~536 | See the honesty note below. |

**The one honest limitation of this pass:** the 536-string long tail and the 22 ambiguous matches were reviewed
in batches by eye against the same exclusion categories above, not verified one-by-one with individual sourcing
the way the 164 promoted movements were. At this scale (2,003 strings spanning strength, yoga, Pilates, running,
swimming, cycling, boxing, AFL, basketball, golf, tennis, netball, and rehab content) that was the honest
trade-off available in this pass. Samples, not just counts, are given so this is checkable:

Long-tail sample (excluded/not pursued, judged non-image-worthy or likely-duplicate): *"Technical round 1: lead
hand only, any distance (back hand defends)"*, *"Weighted ruck walk"*, *"Stop 3: One-leg Stand holding rail"*,
*"Running - hip out"*, *"Jump Rope (skip through the 1 min breaks)"*, *"Threshold block"*, *"Bear dog"*,
*"Marching on the spot"*.

Unresolved-ambiguous sample: *"Deep Abdominal Hold (lying knees bent, or on hands and knees)"* (possibly a core
brace, not a squat hold — the fuzzy matcher's guess), *"One-leg Stand (fingertips on bench/wall)"* and
*"Single-leg Balance/Stand"* variants (these read as balance holds, which the original research explicitly
excludes as a category — kept out rather than rescued on a weak fuzzy match), *"Run / air squats / walking
lunges / burpees"* (a genuine mini-circuit whose components are each independently already covered, but which
wasn't individually decomposed and re-verified this pass).

## 3. The 164 new genuine movements

Two families:

- **All ~31 distinct named yoga/Sanskrit asanas found in the library** that weren't already covered — including
  the **full classical Sun Salutation sequence** (see §4). Every pose was checked against actual yoga-anatomy and
  PT/clinical sources rather than inferred from general knowledge, per the explicit instruction not to guess at
  Sanskrit-named poses. Sourcing difficulty and disagreements are in §5.
- **~37 non-yoga families**: plyometric jumps (Countermovement Jump, Depth Jump, Drop Landing, Pogo Hops,
  Skater/lateral-bound jumps, Trap-bar Jump), sprint/agility drills (B-skip, Carioca/Grapevine, Duck Walk,
  Bounding), mobility drills (90/90 Hip Switch, Couch Stretch, World's Greatest Stretch, Brettzel, Thoracic Open
  Book, Sleeper Stretch, Supine Hamstring Floss, Spiderman Lunge, Toy Soldier, Prone Floor Angels, Wall Walk), and
  nine further Pilates-mat additions (Open Leg Rocker, Seal, Rolling Like a Ball, Single Leg Stretch/Circles,
  Double Leg Stretch, Swan, Roll-Down family) that reuse `muscle-verification.json`'s already-flagged
  `flexion_pilates_mat` low-confidence/unsourced caveat rather than inventing new confidence for an unsourced family.

Per the project's own "verify once per pattern" rule, movements that are biomechanically the same exercise as an
already-verified `muscle-verification.json` pattern (e.g. Countermovement Jump → `plyometric_jump`, B-skip →
`askips_dynamic`, Couch Stretch → `hip_flexor_stretch`, Pike Stretch → `hamstring_stretch`) **inherit that
pattern's muscle data** with an inheritance note, rather than being re-sourced from scratch. Genuinely new
patterns (yoga poses, 90/90 Hip Switch, World's Greatest Stretch, Sleeper Stretch, etc.) were freshly sourced —
see `full-gap-analysis.json`'s `sources`/`confidence`/`notes` fields per record.

Confidence breakdown across the 164 records: roughly high/moderate-high 32, moderate 58, low-moderate 51, low 23
(exact tier depends on how borderline cases are counted — see each record's own `confidence` field, which is the
source of truth, not this summary).

## 4. Sun Salutation — explicit confirmation

**Fully covered.** `Sun Salutation A`, `Sun Salutation B`, `Sun Salutation flow`, and `Sun Salutation (half
rounds)` are circuit-style labels for the whole pose sequence, not single movements. Decomposed into:

| Pose | Status |
|---|---|
| Prayer Pose (Pranamasana) | **New** this pass |
| Raised Arms (Hasta Uttanasana) | **New** this pass |
| Hands to Feet (Pada Hastasana) | **Already covered** — matches the existing "Forward Fold (knees soft)" production image |
| Equestrian Lunge (Ashwa Sanchalanasana) | **Already covered** — pass 1's `visual-variants.json`, variant `new-057` |
| Eight-limbed Pose (Ashtanga Namaskara) | **New** this pass (low confidence — see §5) |
| Cobra (Bhujangasana) | **New** this pass |
| Downward Dog (Parvatasana) | **New** this pass |

Every pose in the classical sequence now has a muscle-verification record and a visual-variant assignment.

## 5. Yoga/mobility sourcing — harder than the strength literature, as expected

ExRx.net — the backbone of both prior passes — has **zero yoga-asana coverage**. Yoga Journal has a real,
checkable anatomy page for only a handful of poses in this batch (Tree Pose, Eagle Pose, Boat Pose, Warrior 3,
Downward Dog); most others relied on yoga-education sites (YogaUOnline, Yoga International), one
academic-adjacent source (NC State's yoga-anatomy reference), and in the weakest cases commercial yoga/wellness
blogs only — a lower, more heterogeneous tier than the ExRx+NASM+EMG standard the strength side uses.

**Real disagreements found (flagged in the per-record `notes`, not resolved):**
1. **Boat Pose** — Yoga Journal names it an abdominal exercise; a separate source argues it's substantially a
   hip-flexor pose "disguised" as a core exercise. Not resolved either way.
2. **Sleeper Stretch vs. cross-body stretch** (shoulder internal rotation) — the best-sourced disagreement in this
   batch, because actual peer-reviewed studies exist here (Laudner 2008, McClure 2007 RCT). McClure's controlled
   trial found cross-body stretch produced significantly greater internal-rotation gains; sleeper stretch's gain
   wasn't significant against control. Flagged so the app never claims sleeper stretch is the superior option.
3. **"Hasta Uttanasana" naming** is used inconsistently across sources — a raised-arms pose in this sequence vs.
   a standing backbend elsewhere.

**Could not clear the two-source bar, held at low/low-moderate confidence** (same treatment `muscle-verification.json`
already gives its own unsourced families like the Pilates mat and advanced-calisthenics-statics groups): Eight-limbed
Pose (Ashtanga Namaskara), Revolved Triangle, Puppy Pose, Brettzel, Frog Pose, Mountain Pose's specific muscle
list, Spiderman Lunge Stretch, Thoracic Open Book. These are explicitly flagged in their own `notes` field rather
than shipped as settled fact.

## 6. Visual variants from this pass

Cross-checked against the 140 existing production images and the 265 variants already in `visual-variants.json`
first — several "new" discoveries turned out to already be covered:

| Status | Count |
|---|---|
| **existing** (already covered, no new spend) | 6 (A-Skip family → existing A-Skips image; Modified Hundred → existing The Hundred image; Spine Stretch Forward → existing Seated Forward Fold image; Spine Twist → existing seated torso-rotation image; Hands to Feet → existing Forward Fold image; Lizard Pose → already counted in pass 1's `new-057`) |
| **new** | **65** |
| **Total variants produced this pass** | 71 |

## 7. Final combined cost estimate — the true total to close the entire gap

| | Images | Cost @ $0.134 |
|---|---|---|
| Pass 1 (original `visual-variants.json`): new + existing-wrong-gender | 167 | $22.378 |
| **This pass: new variants** | **65** | **$8.710** |
| **TRUE COMBINED TOTAL** | **232** | **$31.088** |

This is the full cost to close the entire identified gap, including every Sun Salutation pose and the rest of
the yoga/mobility/plyometric/Pilates additions found in this pass — **not** including the ~536-string long tail
and 22 unresolved ambiguous matches that weren't individually re-verified (see §2's honesty note). If any of
those turn out to be genuinely new movements on a future pass, the true total would be somewhat higher than
$31.088 — this number should be presented as "the gap we've now actually verified," not "guaranteed to be every
single exercise in the app."

## 8. Output files

- `research/full-gap-analysis.json` — methodology, totals, Sun Salutation confirmation, yoga sourcing-difficulty
  note, and the 164 new movement records (`{movement, pattern, primary, secondary, sources, confidence, notes}`).
- `research/full-gap-variants.json` — 71 variant objects (65 `new`, 6 `existing`/`existing-already-counted`),
  same shape as `visual-variants.json`.
- `research/full-gap-summary.md` — this file.

No app code or images were touched.
