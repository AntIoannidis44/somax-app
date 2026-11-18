# Exercise how-to images - state at pause (2026-11-18)

**Status: NOT shipping. Visual audit complete 2026-11-19 (see below).** The feature is switched off in code (`HOWTO_ENABLED = false` in
`src/components/library/ExerciseHowTo.tsx`). TestFlight build 60 does not contain it. The owner expects this to
take a while before it is ready.

## What exists
- 479 pictures uploaded to Supabase storage, bucket `exercise-howto` (140 originals at `<pattern>/<file>.jpg`, 339 new
  at `v2/<id>.jpg`). All verified reachable. The full-size PNG originals live outside the repo in
  `../exercise-howto/images/` (`_pending/` v1, `_pending_v2/` v2), about 1 GB.
- Name -> picture lookup: `public/data/exercise-howto.json` (built by `howto-pipeline/tools/build_lookup.py`, which
  starts from `build/live_base.json` = the original 140-image lookup; never rebuild from its own output).
- App matcher `candidates()` in `src/lib/exerciseHowTo.ts` handles "(drop set)", ", both sides", "X or Y", plurals.

## Audit - visual pass COMPLETE (2026-11-19)
All 60 sheets / 476 pictures were reviewed, and every name was judged against the picture it opens.
- `../exercise-howto/audit/catalog.json`: one record per picture (standard name, equipment, position, one arm/leg, grip,
  ok or issue).
- `../exercise-howto/build/audit_fixes.json`: 386 fixes (337 names removed, 49 moved to the right picture).
- A removed name is stored as **-1** in the lookup, and `findHowToIndex()` in `src/lib/exerciseHowTo.ts` stops there. Before
  this, the matcher fell back to a shorter name, e.g. "Cable Fly (low to high)" opened the high-pulley fly. Covered by
  `tests/exerciseHowTo.test.ts`.
- `../exercise-howto/audit/conflicts.py` checks every name's equipment, bench angle, position, one arm/leg and chin-up
  grip against its picture. After the fixes, everything it flags has been checked by eye as acceptable.
- Standard names: `../exercise-howto/audit/canonical_names.json` gives one name per good picture ("Equipment
  Position/Angle Movement (variation)"). They are added to the lookup only where the name is not already mapped or
  blocked, and no existing program name changed picture. Program text itself was NOT renamed (needs owner sign-off;
  credited programs keep their wording).
- `public/data/exercise-howto.json` was rewritten from this audit. The feature is still OFF (`HOWTO_ENABLED = false`).

Pictures with defects (no regeneration, by owner's instruction):
- Identical or near-identical panels: Barbell Shrug, Dumbbell Shrug, Standing Calf Raise (barbell, 9 names), A-Skip,
  The Hundred, Standing Quad Stretch, Cross-body Shoulder Stretch, Flutter Kicks, Single-leg Hop, Band Ankle Eversion,
  Ankle Dribble, Dolphin.
- Wrong movement: Band External Rotation and Control Balance (all names removed); Arm Circles; Split Pogo; Planche
  Lean; Archer Push-up; Child's Pose Side Reach; Cobra/Double Leg Lift; Straight-arm Plank (panel 1 kneeling); Seated
  Calf Raise machine; "Crab walk" picture is a bear crawl.

Still open:
- Owner: what are "Barbell standing row" and "Barbell inverted row, standing"? "Fly (machine)" and "Toe touches" have
  no picture.
- Owner's plain "Squat" now opens the bodyweight squat, because most programs using it are bodyweight (7-Minute,
  NHS). Change it to "Barbell Back Squat" if a barbell is meant.
- No chin-up (underhand) picture exists. Chin-up names were removed from the overhand pull-up.

## Name gate (2026-11-19, second verification layer)
Every picture now carries its own exercise name and a list of reviewed alternative names (`aka`) in
`public/data/exercise-howto.json`. The source files are `../exercise-howto/audit/picture_names.json` and
`name_gate_decisions.json` (every approval and removal is listed there).

`tests/howto-name-gate.test.ts` runs with the normal test suite. It FAILS if any exercise name opens a picture whose
name it doesn't match. The rules are in `src/lib/howtoNameMatch.ts`:
- Movement words must be identical.
- Equipment, position, angle and one-arm/one-leg words may be omitted, but must never contradict the picture.
- Notes such as "(drop set)", "Station 3:" and ", both sides" are ignored.

The first run failed 639 names. The review turned about 390 of them into alternative names for the same exercise
(e.g. "Swimming Prep" = Bird Dog) and unlinked about 80 that showed a different movement (hanging knee raise on the
straight-leg raise, neutral/close-grip pulldowns on the wide-grip picture, TRX/ring row on the bar row, shoulder taps
on a plain plank, weighted dips, multi-area foam-rolling on quads only, etc.). Now 0 failures. 1,525 of 3,291 names
have a picture.

To add a new name -> picture link: the gate must pass, either because the name matches or because a reviewed `aka`
was added.

## Exact image gap (2026-11-19) - no generation approved
`../exercise-howto/plan/image_gap.xlsx` (tabs: Summary, Images required, Every name, Owner) and `planned_images.json`
(each planned image plus every exercise name and label it must be linked to).
- 1,723 exercise names have no picture: 1,343 need none (cardio, swim, session instructions, multi-move lines,
  sport drills, breathing), 18 were linked to existing pictures, 359 are covered by planned images, and 3 wait on
  the owner.
- **222 images required = 201 new movements + 21 redraws** (17 defective pictures still in use + 4 broken ones:
  straight-arm plank, band external rotation, Control Balance, Cobra/Double Leg Lift).
- Verified by: every name classified once; the app's name test passes for every planned and existing link
  (`tests/plan-verify.test.ts`, on demand); each planned image was checked against all 476 existing pictures and
  against each other; and every name was reviewed by eye. Rules and decisions: `plan/clusters.py`, `manual.py`,
  `noimg_rules.json`.
- Name gate fixed: numbers count (Warrior 1 is not Warrior 2), and floor/bench are no longer optional props.

## Generation (if more images are ever made)
Read `SKILL.md`, `concepts/GEN_BRIEF.md`, `concepts/LEARNINGS.md` first. Hard rules:
- Look at a verified photo or video of BOTH positions before writing any prompt, and send it as a pose reference.
  Reference-guided images passed 7 of 9; text-only fixes passed about 1 in 3.
- One pose per call (`concepts/split_gen.py`).
- One sequential agent, Batch API.
- `gen_batch.py` enforces a hard AUD budget and refuses to submit while any earlier batch is unfinished.
- Never trust a cancel. A batch that was confirmed cancelled was run and billed anyway; see `BATCH_DISPUTE_EVIDENCE.md`.

Spend so far: about US$53 + US$34 (disputed cancelled batch) + US$17 + US$5.2 + US$5.8 + US$0.4. The owner has no
credit left to add for a long time.

Copies of the audit and plan working files (originals are in ../exercise-howto/audit, build, plan) are kept in `howto-pipeline/audit/` and `howto-pipeline/plan/`.

Owner answers (2026-11-19, corrected): "Barbell standing row" was renamed in the owner's Full Body program to "Barbell
upright row" and opens the upright row picture. "Barbell inverted row, standing" is its own exercise, an underhand
(reverse-grip) barbell bent-over row, and needs 1 new image. "Toe touches" is a core lying toe touch and needs 1 new
image. (A first rename hit the wrong exercise and was reverted to the exact original; backups of the program row are
in ../backups/.)
