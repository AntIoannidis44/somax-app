# Exercise how-to image generation - rulebook v2 (2026-11-18)

Bar: owner accepts zero errors and wants cost per usable image down. v1 (3 parallel workers) produced 115 usable images from 267 calls; 113 calls went to items that never passed. v2 fixes the causes found in that run, listed at the bottom.

## Hard process rules
1. **One agent, sequential, one image at a time.** No parallel workers. Lessons from item N must be applied to item N+1. After every rejection, add one line to `LEARNINGS.md` (what failed, the prompt change that fixed it) and reuse it for every later item of the same kind.
2. **Nothing is generated until its spec is verified** (step A). A wrong spec is the most expensive failure: it costs calls and still can't pass.
3. **Max 3 calls per item**: 1 fresh render + up to 2 edit-fixes. Fails after 3 -> park it with the reason, don't keep rerolling. Parked items come back to the coordinator, not to more spend.
4. Spend cap is set by the owner per run in `gen_v2.py` (`HARD_STOP`), counted in `cost_log_v2.json`. Check before every call.
5. Output to `../images/_pending/<variantId>.png`. Never touch manifest, app lookup or Supabase.

## A. Spec first (free) - `specs_v2.json`, one entry per item
Fill and sanity-check every field BEFORE any call:
- `canonicalName` - the plain exercise name to draw. Never pass a misleading representative name (v1: "Archer or Decline Push-up" for a plain push-up; "Court warm-up: jog, carioca..." for a lunge).
- `gender` - bodyweight / stretch / mobility / Pilates / yoga = female; everything else = male.
- `equipment` - exact item, plus what must NOT appear (e.g. "no band", "only ONE dumbbell").
- `cameraPreset` - one of: `standing`, `floor-supine`, `floor-prone`, `floor-side`, `quadruped`, `bench`, `machine`, `hanging`, `seated`. (v1 used one bench-oriented camera text for everything, which confused floor and standing poses.)
- `panel1`, `panel2` - body position in concrete joint terms, with left/right as seen IN THE IMAGE (e.g. "her LEFT leg, the one nearer the camera").
- `delta` - one sentence: the single most visible difference between panels, exaggerated for small-range moves. If there is no meaningful movement (savasana, mountain pose), set `layout: "single"` and draw ONE panel instead.
- `primary` / `secondary` - muscles from a credible source (verified muscle file), plus `paintOn`: exactly which body region and which side to tint, and `doNotPaint`: regions the model tends to wrongly tint (non-working leg, non-pressing shoulder, whole front of both thighs). Low confidence / best-practice -> primary only.
- Muscle sanity check: does every listed muscle actually move or lengthen in this exercise? v1 had 27 items with muscles copied from a neighbouring exercise (arm-curl muscles on a hamstring curl, quads on Reverse Nordic swapped, abs on Superman). Fix the spec, never draw a wrong spec.

## B. Prompt (built by `gen_v2.py` from the spec - do not freehand)
- Reference image: `ref_female.png` / `ref_male.png` (identity) - always first part.
- The model draws ONLY: two equal panels stacked vertically, separated by a thin white horizontal line at exactly half height, plain light-grey background, empty top-left corner in each panel. **NO numbers, NO arrow, NO text** - those are drawn in code by `postprocess.py` (v1: filled badges, bare numerals, red arrows, arrows inside a panel = rejections).
- Identity line for every female item: "the EXACT SAME FEMALE character from the reference - same face, feminine chest and waist through her fitted blue top, black leggings; do not change her gender". Male: "white t-shirt, grey shorts". Avoid boxer fists unless needed. Keep the torso visible, not foreshortened.
- Muscle tint: flat red primary, light orange secondary, ONLY on `paintOn`; explicitly list `doNotPaint`. Flat tint, not realistic skinned muscle.
- Name the `delta` explicitly as the last sentence: "The difference between panel 1 and panel 2 MUST be obvious: <delta>."

## C. Check every render yourself with Read (full size, not a thumbnail)
- [ ] Correct gender + outfit, matches reference identity
- [ ] It is `canonicalName`, both positions anatomically right, `delta` clearly visible
- [ ] Exact equipment, nothing extra (count dumbbells/kettlebells), props used correctly
- [ ] Tint only on `paintOn`, nothing on `doNotPaint`, correct side
- [ ] Two panels, same camera, nothing cropped, no text/logos/frames, divider roughly at half height

## D. Fix by EDIT, not by reroll
If one or two boxes fail, send the failed render back as the image input with a narrow instruction: "Keep everything in this image identical except: <exact fix>." (e.g. "remove the red from the right shoulder; tint only the left shoulder", "lift both feet clear of the mat in panel 2"). Edits keep everything that was already right; a full reroll throws it away and rolls new errors. Reroll only when the pose/exercise itself is wrong.

## E. Finish
Run `python3 postprocess.py <render> ../images/_pending/<id>.png` (fits 1696x2528 canvas, draws divider, outlined badges, arrow). View the finished file once more. Record in `results_v2.json`: `{variantId, status, calls, path, notes}`.

## v1 failure causes -> v2 fix
| v1 cause (72 drawn failures + 28 bad-data) | v2 fix |
|---|---|
| Wrong/copied muscle data (28 items, 0 drawable) | Step A muscle sanity check before any call |
| Wrong pose / wrong exercise (40) | Concrete joint-level panel spec, canonical name, camera preset per pose type |
| Muscle tint wrong place/side (24) | `paintOn` + `doNotPaint` with in-image left/right |
| Panels near-identical (23) | Mandatory `delta` sentence; single-panel layout for static poses |
| Equipment wrong/extra (10) | "exactly N" + "must NOT appear" list |
| Badge/arrow/frame (5 + 6 accepted with filled badges) | Drawn in code by postprocess.py |
| Gender drift (5) | Fixed identity line, no fists, torso visible |
| Retries rerolled from scratch | Edit-fix with the failed render as input |
| 3 parallel workers re-learning the same lessons | One sequential agent + LEARNINGS.md |
