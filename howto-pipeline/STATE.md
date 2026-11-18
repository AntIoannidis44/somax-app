# Exercise how-to images - state at pause (2026-11-18)

**Status: NOT shipping.** The feature is switched off in code (`HOWTO_ENABLED = false` in
`src/components/library/ExerciseHowTo.tsx`). TestFlight build 60 does not contain it. The owner expects this to
take a while before it is ready.

## What exists
- 479 pictures uploaded to Supabase storage, bucket `exercise-howto` (140 originals at `<pattern>/<file>.jpg`, 339 new
  at `v2/<id>.jpg`). All verified reachable. The full-size PNG originals live outside the repo in
  `../exercise-howto/images/` (`_pending/` v1, `_pending_v2/` v2), about 1 GB.
- Name -> picture lookup: `public/data/exercise-howto.json` (built by `howto-pipeline/tools/build_lookup.py`, which
  starts from `build/live_base.json` = the original 140-image lookup; never rebuild from its own output).
- App matcher `candidates()` in `src/lib/exerciseHowTo.ts` handles "(drop set)", ", both sides", "X or Y", plurals.

## Audit - where to resume
Owner found pictures attached to the wrong exercises (pelvic tilt on a bridge; leg slides and others on The Hundred;
incline press on the flat press). A name-by-name text pass removed or moved 173 wrong names
(`build/audit_fixes.json`). The visual audit was paused at sheet 3 of 60.

**Owner's instruction for the audit:** many pictures are fine but are attached to the wrong exercise. Judge every
name against the picture it opens: equipment, seated vs standing, one arm vs two, incline vs flat, machine type. Also
check that panels 1 and 2 really differ, that the right machine is drawn, and look at a verified reference whenever
unsure. Don't rely on the owner to find these.

To rerun: `AUDIT_LOOKUP=../exercise-howto/build/lookup_preview.json npx vitest run tests/howto-audit.test.ts` ->
`audit_resolved.json` (every name in every program + user programs, resolved exactly as the app does), then build
the sheets (picture + all names that open it) and review all 60.

Already spotted, not yet fixed:
- Seated Calf Raise Machine picture shows the wrong machine
- Straight-Arm Plank panel 1 is kneeling
- "Standing Dumbbell Overhead Press" opens the seated press
- "Single-arm Cable Row" opens the two-arm row
- Near-identical panels: The Hundred, shoulder cross-body stretch, standing quad stretch (see `build/panel_diffs.json`)
- Owner's Full Body program: "Barbell standing row" and "Barbell inverted row, standing" (ask what these are),
  "Fly (machine)", "Toe touches" have no picture
- 127 real exercises currently have no picture (mostly ones whose wrong picture was removed)

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
