# Generation learnings (append one line per rejection: item | failure | prompt change that fixed it)

Seeded from v1 run (2026-11-18):
- Pilates Hundred | drifted male | straight arms by hips (not fists at chest), torso visible, explicit female identity line
- one-arm overhead press (new-098, new-109, new-044) | red painted on the NON-pressing shoulder, repeatable | paintOn must name the pressing arm by in-image side; doNotPaint the other shoulder
- single-leg moves | both legs tinted | paintOn "only the standing/working leg (by role, e.g. 'the leg nearest the camera', never left/right)", doNotPaint the other leg
- small-range moves (shrug, calf raise, rotations, circles, taps) | identical panels | delta sentence, exaggerate end range
- lying / curled ab poses | gender drift | avoid fists, show torso, identity line
- static poses (savasana, mountain) | identical panels by nature | layout single
- crab/bear, archer/standard, dip on low bars | model draws the more common neighbour | canonical name + one-line "this is NOT <neighbour>" in mustNot
- dip | feet on the floor with hip-height bars | "bars at chest height, feet off the floor, knees bent behind"
- dumbbell moves | extra dumbbells appear | "exactly ONE/TWO dumbbells in total" in equipment
- generic plain prompt badges | filled discs / bare numerals | model draws no badges; postprocess.py draws them

Measured from v1 specs (58 first-try passes vs 56 failures), 2026-11-18:
- Say exactly how panel 2 differs: present in 66% of first-try passes vs 46% of failures -> mandatory, linted
- Avoid "left/right": present in 66% of failures vs 47% of passes (model mixes sides) -> linted; use "nearest the camera" / "the raised leg"
- Rotations/twists: 3 first-try passes vs 9 failures -> per-panel torso direction relative to the camera, linted
- Single-leg/balance: 6 passes vs 9 failures -> name the support leg by role ("standing leg") and give the free leg's exact height

v2 batch 1 (2026-11-18): 171/256 first-try passes (67%). The 85 failures, by cause -> rule:
- ~45 near-identical panels on small/foot/hand movements (all 9 calf-raise variants, toe raise, ankle, wall/ring/medball push-ups, shrug, battle ropes, golf turns, Pilates scissors/criss-cross/spine curl). A text "delta" is NOT enough. Rule: for foot/ankle moves use a camera at ankle height and state a measurable gap ("heels a full hand-width above the step, visible gap"); for swaps (feet/legs/arms) name which limb is where in EACH panel; prefer an edit of a good panel 1 over a fresh render.
- ~30 wrong pose / similar exercise: model defaults to the common neighbour (reverse wrist curl -> biceps curl, fire hydrant -> donkey kick, archer -> normal push-up/pull-up, ring support/false-grip hang -> standing on the floor, eagle arms -> arms overhead, couch stretch shin flat, sleeper stretch top arm up). Rule: state the distinguishing feature as a hard negative ("the elbow never moves - not a biceps curl", "feet clearly OFF the floor").
- 4 red on the non-working shoulder in one-arm presses (again, same as v1): "the pressing arm nearest the camera" still fails. Rule: describe the pressing arm by what it HOLDS ("the arm holding the dumbbell"), and fix by edit.
- 4 layout/text: model wrote "START/END" / "Panel 1 (start)", made a 2x2 grid or side-by-side panels.
- 1 equipment count (2 kettlebells for a pass-under).
- ~25 passes had stray light boxes/lines in the "leave top-left empty" corner -> cleaned in postprocess.py (clean_corner); arrow placed in a clear column (arrow_x); padding replicates edge pixels (fit_canvas).

2026-11-18 (owner, hard rule): NO prompt is written until I have LOOKED at a verified picture/video of BOTH positions of the exercise (program's own linked video/manual first, then ExRx / ACE / NASM exercise library), and that reference is sent with the request. Evidence: reference-guided items passed 7/9 first time; text-only fixes ~1 in 3. I skipped this for most failures - never again.
