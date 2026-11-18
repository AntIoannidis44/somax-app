import sys, os, re, json, collections
sys.path.insert(0, os.path.dirname(__file__))
from baseline_data import BASELINE
from tier2_data import TIER2

RESEARCH = "/Users/ngalnyaatkinson/claude project/fitness app/exercise-howto/research/muscle-verification.json"
IMG_DIR = "/Users/ngalnyaatkinson/claude project/fitness app/exercise-howto/images"

records = json.load(open(RESEARCH))
by_pattern = collections.OrderedDict()
for r in records:
    by_pattern.setdefault(r["pattern"], []).append(r["movement"])

def slug(name):
    s = name.lower()
    s = re.sub(r"[()/,']", "", s)
    s = re.sub(r"\s+", "-", s.strip())
    return s + ".png"

# keyword lists per (pattern, variant movement) used to partition the raw movement
# names between the baseline image and each tier-2 variant. Best-effort / approximate -
# a movement can legitimately match more than one bucket (e.g. "Dumbbell Reverse Lunge"
# reads as both a reverse-lunge and a dumbbell-lunge movement).
TIER2_KEYWORDS = {
 ("squat_pattern","Front Squat"): ["front squat"],
 ("squat_pattern","Dumbbell Goblet Squat"): ["goblet"],
 ("squat_pattern","Bodyweight Squat"): ["bodyweight squat","air squat","chair stand"],
 ("horizontal_press","Dumbbell Bench Press"): ["dumbbell bench press","dumbbell chest press","dumbbell floor press","flat dumbbell press","single-arm dumbbell bench press","dumbbell press"],
 ("horizontal_press","Push-up"): ["push-up","press-up","pushup"],
 ("horizontal_press","Incline Barbell Bench Press"): ["incline barbell press","incline bench press"],
 ("horizontal_press","Machine Chest Press"): ["machine chest press","chest press machine"],
 ("lunge_pattern","Bodyweight Reverse Lunge"): ["reverse lunge"],
 ("lunge_pattern","Bulgarian Split Squat"): ["bulgarian"],
 ("lunge_pattern","Dumbbell Lateral Lunge"): ["lateral lunge"],
 ("horizontal_row","Seated Cable Row"): ["seated cable row","seated machine row","seated row machine","seated band row","seated band rowing"],
 ("horizontal_row","Single-Arm Dumbbell Row"): ["single-arm dumbbell row","one-arm dumbbell row","single-arm row + dumbbell","bent-over dumbbell row","dumbbell bent-over row","dumbbell row","chest-supported dumbbell row"],
 ("horizontal_row","Inverted Row"): ["inverted row","table inverted row","table or bar inverted row","ring row","trx or ring row","feet-elevated inverted row"],
 ("hip_hinge_deadlift","Barbell Romanian Deadlift"): ["romanian deadlift","rdl"],
 ("hip_hinge_deadlift","Trap Bar Deadlift"): ["trap bar","trap-bar","hex bar"],
 ("hip_hinge_deadlift","Single-Leg Romanian Deadlift"): ["single-leg"],
 ("hip_extension_glute_isolation","Floor Glute Bridge"): ["glute bridge","bridge","shoulder bridge"],
 ("hip_extension_glute_isolation","Single-Leg Glute Bridge"): ["single-leg glute bridge","single-leg bridge","single-leg hamstring bridge"],
 ("plank_front","Straight-Arm Plank"): ["straight-arm plank","high plank","plank to push-up","plank to push up"],
 ("plank_front","Ab Wheel Rollout"): ["ab wheel"],
 ("vertical_pull","Lat Pulldown Machine"): ["pulldown"],
 ("vertical_press_overhead","Seated Dumbbell Shoulder Press"): ["seated","dumbbell overhead press","dumbbell shoulder press"],
 ("calf_raise","Seated Calf Raise Machine"): ["seated calf raise","seated calf extension"],
 ("elbow_flexion_curl","Cable Curl"): ["cable curl","cable hammer curl"],
 ("plank_side","Side Plank (straight arm)"): ["side plank leg lift","right side plank with arm raises","left side plank with arm raises"],
 ("core_rotation_woodchop_twist","Seated Russian Twist"): ["russian twist"],
 ("core_rotation_woodchop_twist","Landmine Rotation"): ["landmine"],
 ("dip","Bench Dip"): ["bench dip","chair dip","triceps dip"],
 ("elbow_extension_triceps","Cable Triceps Pushdown"): ["pushdown","push-down","push down","cable push-down"],
 ("flexion_hipflexor_legraise","Captain's Chair Leg Raise"): ["hanging knee","hanging leg raise","leg tuck","crunch or hanging"],
 ("loaded_carry","Suitcase Carry"): ["suitcase"],
 ("rear_delt_face_pull","Band Pull-Apart"): ["pull-apart","pull-aparts"],
 ("grip_forearm","Dead Hang"): ["dead hang","active hang","ring support hold"],
 ("hip_abduction","Standing Band Lateral Walk"): ["lateral walk"],
 ("glute_piriformis_stretch","Lying Figure-4 Glute Stretch"): ["lying)","figure-4 glute stretch (lying"],
 ("rotator_cuff_external","Band External Rotation at 90/90"): ["90/90"],
 ("back_extension_erector","Floor Back Extension"): ["floor back extension","floor or machine back extension"],
 ("leg_curl_machine","Seated Leg Curl Machine"): ["seated leg curl"],
 ("plank_antirotation_birddog","Dead Bug"): ["superman","contralateral limb raise"],
 ("shoulder_raise_isolation","Dumbbell Front Raise"): ["front raise"],
 ("flexion_crunch","Cable Crunch"): ["cable crunch","machine crunch"],
 ("chest_fly_pecs","Incline Dumbbell Fly"): ["incline dumbbell fly"],
 ("bear_crawl_crab_walk","Crab Walk"): ["crab walk"],
 ("chest_fly_reardelt","Reverse Pec Deck Machine"): ["pec deck"],
 ("hamstring_stretch","Standing Hamstring Reach"): ["standing forward reach"],
 ("olympic_clean_jerk_snatch","Single-Arm Dumbbell Snatch"): ["snatch"],
 ("thruster","Wall-Ball Thruster"): ["wall ball or db thruster","wall-ball"],
 ("standing_forward_fold_hamstring_lowback","Seated Forward Fold"): ["seated forward fold"],
 ("torso_lateral_flexion_mobility","Seated Side Bend"): ["seated side bend"],
 ("ankle_mobility","Standing Ankle Circles"): ["ankle circles"],  # falls back to remainder (see below, baseline used "Seated Ankle Circles")
 ("chest_stretch","Seated Chest Opener"): ["seated chest opener"],
 ("shrug_trapezius","Barbell Shrug"): ["shrug"],  # remainder handling below (generic "Shrug" assumed barbell)
 ("torso_rotation_mobility","Reclined Twist"): ["reclined twist"],
}

manifest = []
covered_by_pattern = collections.defaultdict(set)  # movement names claimed by tier2 variants, per pattern

# first pass: assign tier2 variants their matched movement names
tier2_matches = {}
for t in TIER2:
    pattern, gender, movement = t[0], t[1], t[2]
    all_moves = by_pattern.get(pattern, [])
    kws = TIER2_KEYWORDS.get((pattern, movement), [])
    matched = [m for m in all_moves if any(kw.lower() in m.lower() for kw in kws)]
    # special-cases where keyword matching is too weak/ambiguous: assign just the variant's own name
    if not matched:
        matched = [movement] if movement in all_moves else []
    tier2_matches[(pattern, movement)] = matched
    covered_by_pattern[pattern].update(matched)

for t in TIER2:
    pattern, gender, movement, setup, p1, p2, primary, secondary, conf, ubp, reasoning = t
    out = os.path.join(IMG_DIR, pattern, slug(movement))
    manifest.append({
        "pattern": pattern,
        "variant": movement,
        "gender": gender,
        "movementNamesCovered": tier2_matches[(pattern, movement)],
        "primaryMuscle": primary,
        "secondaryMuscle": secondary,
        "confidence": conf,
        "filePath": out,
        "usedBestPracticeJudgment": ubp,
        "tier": "variant",
        "variantReasoning": reasoning,
    })

for b in BASELINE:
    pattern, gender, movement, setup, p1, p2, primary, secondary, conf, ubp = b
    out = os.path.join(IMG_DIR, pattern, slug(movement))
    all_moves = by_pattern.get(pattern, [])
    claimed = covered_by_pattern.get(pattern, set())
    remainder = [m for m in all_moves if m not in claimed]
    if not remainder:
        remainder = all_moves  # pattern fully covered by variants' own names only; keep full list on baseline too
    manifest.append({
        "pattern": pattern,
        "variant": movement,
        "gender": gender,
        "movementNamesCovered": remainder,
        "primaryMuscle": primary,
        "secondaryMuscle": secondary,
        "confidence": conf,
        "filePath": out,
        "usedBestPracticeJudgment": ubp,
        "tier": "baseline",
    })

# horizontal_press baseline reused the existing approved bench-press sample (no new API cost)
manifest.append({
    "pattern": "horizontal_press",
    "variant": "Barbell Bench Press",
    "gender": "male",
    "movementNamesCovered": [m for m in by_pattern.get("horizontal_press", []) if m not in covered_by_pattern.get("horizontal_press", set())],
    "primaryMuscle": "Pectoralis Major, Sternal head (flat)",
    "secondaryMuscle": "Anterior Deltoid, Triceps Brachii, Coracobrachialis",
    "confidence": "high",
    "filePath": os.path.join(IMG_DIR, "horizontal_press", "barbell-bench-press.png"),
    "usedBestPracticeJudgment": False,
    "tier": "baseline",
    "note": "Reused the pre-existing approved sample image generated earlier with the same pipeline/ref character - no new API spend for this one.",
})

out_path = "/Users/ngalnyaatkinson/claude project/fitness app/exercise-howto/images/manifest.json"
json.dump(manifest, open(out_path, "w"), indent=1)
print("wrote", len(manifest), "entries to", out_path)

# sanity: confirm every file referenced actually exists
missing = [m["filePath"] for m in manifest if not os.path.exists(m["filePath"])]
print("missing files:", len(missing))
for m in missing: print(" ", m)
