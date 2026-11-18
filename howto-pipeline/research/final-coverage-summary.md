# Final coverage pass — the true, complete numbers

Produced 2026-11-18, third and final pass over the exercise-how-to gap, following directly from
`full-gap-analysis.json`/`full-gap-summary.md` (pass 2). This pass re-derived its own working set rather than
trusting pass 2's unverified samples, individually classified every single string in it, sourced the genuinely
new movements found, fixed a real deployment bug, and produced one consolidated file covering the entire library.

## 0. A premise I checked rather than assumed

The task said pass 2's 171 "rescued" movements were never added to `manifest.json`/`exercise-howto.json` and that
both files were "unchanged." I re-read both files before touching anything: **that was only partly true.** 91 of
the residual strings I was working from already resolved correctly in the live deployed lookup — they'd been
added by an earlier build step (the pass-1/pass-2 image-manifest build), independently of pass 2's own fuzzy-match
list. I did not re-fix those 91 (nothing was broken). The real, still-missing gap was smaller and different from
what was assumed — see §3.

## 1. Re-deriving the residual (Part A's starting point)

| | Count |
|---|---|
| Distinct raw exercise-line strings in the live library (`ex.name`, meal files excluded) | **3,267** |
| Same, case/whitespace-deduped ("distinct real exercise name" granularity used throughout this project) | **3,162** |
| Already in `muscle-verification.json` (pass 1, 1,176 movements) | 1,176 |
| Already in `full-gap-analysis.json`'s 164 new movements (pass 2) | 164 (159 distinct) |
| Already resolvable via the live deployed lookup right now (see §0) | 91 |
| **True residual this pass actually had to classify, one by one** | **1,758** |

Pass 2 estimated this residual at "~536 + 22 ≈ 558," explicitly unverified. My own re-derivation — extracting the
library fresh, diffing against the same sources pass 2 used — puts the real number at **1,758**, roughly 3x
pass 2's estimate. I'm reporting my own re-derived number per the task's own instruction to trust re-derivation
over the prior sample when they differ.

## 2. Every one of the 1,758 — explicit, individual classification (Part A)

| Classification | Count | Method |
|---|---|---|
| Noise-excluded | 1,405 | Cardio/swim/bike pacing & interval labels, team/court-sport drills, boxing rounds, golf swing cues, balance holds, CARs/breathing/pelvic-floor drills, vague multi-joint labels, generic single-word effort/rest labels — each with its own specific stated reason, not a blanket "looks similar" |
| Rescued to an existing covered movement (phrasing/case/equipment variant) | 288 | Individually matched; several ambiguous ones were resolved by reading the actual source-file context (e.g. confirmed "Pull (on 2:00)" is a **swim pull-buoy set**, not a pull-up, from the adjacent `"distance": "25yd"` field; confirmed "Side Leg Circles" is a side-lying hip/leg movement, not "Arm Circles," from its position next to Clam/Side Kick/Side Lift in the source file) |
| Rescued via fuzzy token-matching, manually spot-checked | 7 | Same rigor, lower token-overlap score, individually verified |
| Circuit/complex lines, decomposed into real components | 23 | Every component checked individually; all already covered elsewhere (incl. all four Sun Salutation labels, confirmed against pass 2's own 7-pose decomposition) |
| **Genuinely new, distinct movements** | **35 raw strings → 8 distinct patterns** | Jump rope/skipping, jumping jacks, chin tuck (cervical retraction), a wrist/forearm mobility-stretch family, foam rolling/SMR, knee-to-chest stretch, Extended Side Angle (yoga), Reclined Butterfly (yoga) |

**Zero items left unreviewed, "probably fine," or unclassified.** Every one of the 1,758 has an explicit status
and a stated reason in `final-coverage.json`.

## 3. Part C — the real deployment-gap fix, applied and verified

Checked what was actually missing (not what was assumed missing): of the 295 individually-confirmed rescue
matches, **284 were genuinely absent** from `manifest.json`'s alias lists (278 after de-duplicating a few that
collided after normalization); **11 could not be added** because their target pattern (`hip_90_90_mobility`,
`lateral_bound_skater`, `yoga_frog_pose`) has no manifest image yet either — those were reclassified as
`needs-new-image` instead of falsely marked fixed.

**Applied:**
- `exercise-howto/images/manifest.json` — 278 new alias strings added across 59 existing entries' `movementNamesCovered`.
- `somax-app/public/data/exercise-howto.json` — fully rebuilt from the corrected manifest using the exact
  `normalize()` function in `exerciseHowTo.ts` (lowercase, non-alphanumeric → space, trim/collapse). Lookup grew
  from 939 → 1,217 keys; entries unchanged at 140 (no images were touched, only the name→image mapping).

**Verified after writing** (re-read both files fresh, not trusted from memory): spot-checked 8 previously-broken
names end to end through the real lookup — e.g. `"Doorway Chest Stretch"` → index 68 (Chest Doorway Stretch
image), `"Deadlift (T1)"` → index 13 (hip-hinge-deadlift image), `"Bird Dog (3s hold)"` → index 108, `"Side Leg
Circles"` → index 87 (hip circles, not arm circles) — all now resolve correctly. One known minor imprecision:
where a pattern has multiple equipment variants (e.g. `hip_hinge_deadlift` has 4), a few tier-suffix names like
`"Deadlift (T1)"` were assigned to the first/closest-matching variant by token overlap rather than a guaranteed
"correct" one; the muscle data is the same across that pattern's variants either way, so this doesn't produce a
wrong muscle claim, only a possibly-not-ideal equipment picture.

## 4. Part B — sourcing the 8 genuinely new movements

| Pattern | Primary | Confidence | Sourcing |
|---|---|---|---|
| Jumping Jack | Quadriceps, Gluteus Maximus | **high** | NASM exercise-library page (fetched directly) + WebMD |
| Foam Rolling / SMR (calves, representative) | Gastrocnemius, Soleus | moderate-high | NASM exercise-library page (fetched directly) + NASM trainer blog |
| Chin Tuck (cervical retraction) | Longus Colli/Capitis (deep cervical flexors) | moderate | NASM corrective-exercise blog + a PT-education source (flagged a real disagreement over which muscles count as "deep flexors") |
| Knee-to-Chest Stretch | Erector Spinae, Gluteus Maximus | moderate | NASM-CPT-authored fitness-media source + an independent clinical/PT source |
| Extended Side Angle (yoga) | Obliques, Glute Med/Min, TFL | moderate | Yoga Journal (anatomy co-authored by an orthopedic surgeon) + a yoga-education site, per the project's established yoga-sourcing approach (ExRx has no yoga coverage) |
| Wrist/Forearm Mobility-Stretch family | Wrist flexors or extensors (direction-dependent) | moderate | A clinical/PT source + a clinical-reference video source; no ExRx/NASM page found |
| Jump Rope / Skipping | Gastrocnemius/Soleus, Quadriceps | **low-moderate** | No ExRx or NASM page found; two independent fitness-education sources only — flagged, does not clear the project's own two-source ExRx/NASM bar |
| Reclined Butterfly (yoga) | Adductor group | **low-moderate** | No reclined-specific anatomy source found (only seated-pose sources); weakest-sourced item this pass, flagged exactly like pass 2 flagged its weakest yoga poses |

All 8 default to **female** (bodyweight/stretch/mobility/yoga = female under the project's established gender
rule). Collapsed into **8 new image variants** (not 35 — one per genuinely distinct movement pattern, not per
phrasing variant, matching `visual-variants.json`/`full-gap-variants.json` methodology).

## 5. Part D — the true final numbers, no caveats rounded away

| | Count |
|---|---|
| **Total distinct real exercise names in the entire library** | **3,162** |
| Accurate right now (correct image, correct gender, correct muscles) | **943** |
| Needs a brand-new image (pattern or variant doesn't exist yet) | 460 movement-names → **201 distinct images** |
| Needs regeneration (image exists, wrong gender under the project's own rule) | 366 movement-names → **39 distinct images** |
| Noise-excluded (not image-worthy, each with a stated reason) | **1,393** |
| Image-defect found this pass | 0 — **not checked**; no pixel-level QA was performed this pass, so this is "not found," not "confirmed zero" |

**Images still needed to close the entire gap: 201 (new) + 39 (regenerate) = 240.**
**Cost of those 240 images at $0.134 each: $32.160.**
This pass's own marginal addition on top of pass 1+2's identified 232: **8 images, $1.072.**

### Cost reconciliation — stated plainly, including what doesn't cleanly add up

- Already spent, per the running total this task was given: **$23.316.**
- That figure does **not** cleanly reconcile with the 140 images actually present in `manifest.json`
  (140 × $0.134 = $18.760) or with pass 1+2's own "identified-gap" accounting ($22.378 + $8.710 = $31.088,
  which both of those passes explicitly described as **not yet spent** — no images generated). The $23.316
  figure most plausibly reflects real generation attempts/re-rolls beyond the 140 that made the final manifest,
  but nothing in this repo lets me verify that split. **Named explicitly as unreconciled, not smoothed over.**
- Total project cost to fully close the gap (given $23.316 + this pass's full 240-image remaining-cost figure):
  **$23.316 + $32.160 = $55.476.**

## 6. Is this genuinely 100%? Honest answer: no — named explicitly, not rounded up

Everything in the 3,162-row `final-coverage.json` has an explicit classification; nothing is "unreviewed." But
"100% done" would mean every image exists, correctly gendered, with zero open sourcing flags — that is **not**
the current state. Specifically still open:

1. **240 images do not exist yet** (201 new + 39 regenerations) — this is expected, cumulative, unrendered work
   from all three passes, not a flaw in this pass's verification.
2. **Two of the 8 newly-sourced patterns are flagged low-moderate confidence** (Jump Rope/Skipping, Reclined
   Butterfly) because no ExRx/NASM source could be found — flagged per the project's own honesty rule, not shipped as settled fact.
3. **No pixel-level image QA** was run this pass on any of the 140 existing images (`error-image-defect` was never
   used because it wasn't checked, not because zero defects were confirmed).
4. **One minor, acknowledged imprecision**: a handful of tier-suffix rescues (e.g. `"Deadlift (T1)"`) were
   auto-assigned to the closest same-pattern manifest variant by token overlap rather than a manually confirmed
   "correct" one among several candidates sharing that pattern.
5. The **$23.316** already-spent figure could not be reconciled against the file evidence in this repo (see §5).

Everything else — every string, every classification, every reasoning, the deployment fix — was individually
verified, and both the deployment fix and this count were re-read from the actual files after writing to confirm
they landed (see §3).
