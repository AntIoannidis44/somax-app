"""Generate expansion/mb-somax.json: original Somax golf / pilates / yoga-mobility programs.

Designed from the credited programs in expansion/mb-sourced.json + sourced-programs.json and the
rules in playbooks/sports.json (golf) and playbooks/general.json (pilates, mobility, older-adults).
Gap-filling only: see the coverage table in expansion/mb-notes.md.

Run:  python3 tools/gen_mb_somax.py expansion/mb-somax.json
"""
import json
import sys

OUT = sys.argv[1]
P = []


def E(name, sets, reps, weight=None, distance=None, group=None):
    d = {"name": name, "sets": sets, "reps": str(reps)}
    if weight:
        d["weight"] = weight
    if distance:
        d["distance"] = distance
    if group:
        d["group"] = group
    return d


def add(id, name, category, level, sport, goals, minutes, dpw, equipment, lifestyle, who, how, description,
        exercises, basedOn, series=None, day=None, days=None):
    assert len(how) == 4, id
    d = {"id": "x-mb-somax-" + id, "name": name}
    if series:
        d.update(series=series, day=day, daysInSeries=days)
    d.update(category=category, level=level, sport=sport, goals=goals, duration=f"{minutes} min",
             daysPerWeek=dpw, sessionMinutes=minutes, equipment=equipment, lifestyle=lifestyle,
             whoItsFor=who, howToRun=how, description=description, exercises=exercises,
             credit="Somax", sourceUrl="", sourceNote="Original Somax program.", verified=False, basedOn=basedOn)
    P.append(d)


# shared IDs (credited sources this work learned from)
GRIPP = "x-mb-gripp-golf-warm-up"
BLISS = "x-mb-bliss-bodyweight-potentiated-golf-warm-up"
UT1, UT2, UT3 = "x-mb-utah-golf-day-1-strength-mobility", "x-mb-utah-golf-day-2-mobility-power", "x-mb-utah-golf-day-3-strength-balance"
PJ1, PJ2, PJ3 = "x-mb-peerj-youth-golf-phase-1-max-strength", "x-mb-peerj-youth-golf-phase-2-explosive", "x-mb-peerj-youth-golf-phase-3-golf-specific"
TG1, TG2 = "x-mb-togu-golf-core-week-1", "x-mb-togu-golf-core-weeks-2-4"
GOLFSHAKE = "golfshake-5-minute-golf-warm-up"
LPT = "x-mb-lpt-physio-based-pilates"
CLASSICAL = "classical-mat-pilates-first-fifteen"
NHS_SIT = "x-mb-nhs-sitting-exercises"
NHS_POST = "x-mb-nhs-stretch-after-exercising"
BHFT = "x-mb-bhft-low-back-pain-exercises"
LIVELIGHTER = "x-mb-livelighter-office-worker-routine"
EMORY = "x-mb-emory-ten-stretches-as-you-age"
SUN = "sun-salutation-flow"
NHS_FLEX = "nhs-flexibility-exercises"
NHS_STRENGTH = "nhs-home-strength-exercises"
STRONG_A = "stronglifts-5x5-workout-a"
WENDLER = "wendler-531-beginners-day-1"
FIFA = "fifa-11-plus-warm-up"

GOLF_GYM_WU = [E("Warm-up: easy bike or brisk walk", 1, "5 min"), E("Warm-up: Cat-Cow", 1, "8"),
               E("Warm-up: World's Greatest Stretch", 1, "4/side"), E("Warm-up: Bodyweight Squats", 1, "10")]
HOME_WU = [E("Warm-up: march on the spot", 1, "2 min"), E("Warm-up: arm circles", 1, "10 each way"),
           E("Warm-up: hip circles", 1, "8 each way")]

# ================================================================================ GOLF
add("golf-back-care-10", "Somax Golfer's Back-Care 10", "other", "beginner", "golf",
    ["mobility", "general-fitness"], 10, 5, ["mat"], ["home", "older-adults", "time-efficient", "minimal-equipment", "busy"],
    "Golfers who get a stiff or sore lower back after a round (with no red-flag symptoms) and want a short daily routine that moves the hips and upper back so the lower back doesn't have to.",
    ["Most days, and again the evening after a round.",
     "Slow and controlled; stay in a comfortable range and breathe out on each effort.",
     "Add 2 reps per exercise each week up to 15, then add the 90/90 hip switch from Somax Golf Hip Mobility 15.",
     "Leg numbness or weakness, bladder or bowel changes, or night pain - see a doctor, don't train through it."],
    "Gentle knee rolls, bridges and bird-dogs for back comfort, plus open books and a hip-flexor stretch to free up the joints golf is meant to rotate through.",
    [E("Pelvic Tilts", 1, "10"), E("Knee Rolls", 1, "10/side"), E("Glute Bridge (2s squeeze)", 2, "10"),
     E("Bird-Dog", 2, "6/side"), E("Open Book (side-lying T-spine rotation)", 1, "8/side"),
     E("Half-kneeling Hip Flexor Stretch", 1, "30s/side"), E("Child's Pose", 1, "45s")],
    [BHFT, UT1, GOLFSHAKE])

add("golf-hip-mobility-15", "Somax Golf Hip Mobility 15", "other", "beginner", "golf",
    ["mobility", "sport-performance"], 15, 4, ["mat", "golf club"], ["home", "minimal-equipment", "time-efficient", "older-adults"],
    "Golfers who struggle to turn into the trail hip or clear the lead hip - often desk workers - and want 15 minutes of hip rotation work at home.",
    ["3-5 times a week; it also works as a pre-range warm-up.",
     "Move slowly and own the end of each range for 2 seconds; hip work should never pinch.",
     "Re-check your hip turn every 4 weeks (e.g. the pelvic rotation test in golf posture).",
     "Pair with Somax Thoracic Turn 10 if your upper-back rotation is also limited."],
    "Internal and external hip rotation in several positions, finishing with a golf-posture hip turn using the club across your hips.",
    [E("90/90 Hip Switches", 2, "8/side"), E("90/90 Hold with forward lean", 1, "30s/side"),
     E("Seated Hip Internal Rotation Lifts", 2, "6/side"), E("Quadruped Hip CARs", 1, "4 each way/side"),
     E("Adductor Rock-backs", 2, "8/side"), E("Half-kneeling Hip Flexor Stretch", 1, "30s/side"),
     E("Golf-posture Pelvic Turns (club across hips)", 2, "10/side")],
    [UT1, GRIPP, GOLFSHAKE])

add("golf-thoracic-turn-10", "Somax Thoracic Turn 10", "other", "beginner", "golf",
    ["mobility", "sport-performance"], 10, 5, ["mat", "golf club", "foam roller"], ["home", "minimal-equipment", "time-efficient", "busy"],
    "Golfers with a short or 'armsy' backswing who sit a lot and need more upper-back rotation and extension.",
    ["Daily or 5 times a week; 10 minutes is enough.",
     "Keep the pelvis still in every drill - the aim is to turn the ribcage, not the lower back.",
     "Exhale as you rotate and pause 2 seconds at the end.",
     "Retest seated trunk rotation with a club across your chest every 4 weeks."],
    "Foam-roller extensions, open books, reach-backs and seated club rotations for a fuller shoulder turn without lower-back twisting.",
    [E("T-spine Extension over Foam Roller", 1, "10"), E("Open Book", 2, "8/side"),
     E("Quadruped Reach-back (hand behind head)", 2, "8/side"), E("Thread the Needle", 1, "6/side"),
     E("Seated Rotation with club across chest", 2, "10/side"), E("Half-kneeling Rotation with club (hips still)", 1, "8/side")],
    [UT2, GRIPP, SUN])

add("golf-post-round-recovery", "Somax Post-Round Recovery Stretch", "other", "beginner", "golf",
    ["mobility", "general-fitness"], 12, 2, ["mat", "golf club"], ["outdoor", "older-adults", "time-efficient", "minimal-equipment"],
    "Every golfer - especially older players - who stiffens up in the car or the clubhouse after 18 holes.",
    ["Within an hour of finishing, while you're still warm.",
     "Hold static stretches 30 seconds (older golfers 30-60 seconds); breathe slowly.",
     "Rotate both ways but spend a little extra time on the side you turn to less (usually the lead side).",
     "Static stretching belongs after golf - before the round use a dynamic warm-up instead."],
    "Calf, hamstring, hip, trunk and shoulder stretches you can do beside the car or at home after a round.",
    [E("Standing Calf Stretch (car or wall)", 1, "30s/side"), E("Standing Hamstring Stretch (heel forward)", 1, "30s/side"),
     E("Standing Figure-4 Glute Stretch (hold car or cart)", 1, "30s/side"), E("Club-overhead Side Bend", 1, "5/side"),
     E("Standing Trunk Rotation with club", 1, "8/side"), E("Cross-body Shoulder Stretch", 1, "30s/side"),
     E("Wrist Flexor & Extensor Stretch", 1, "20s each way/side"), E("Lying Knee Hugs (at home)", 1, "45s")],
    [NHS_POST, GRIPP, EMORY])

add("golf-home-strength-a", "Somax Golf Home Strength - Day A", "fitness", "beginner", "golf",
    ["strength", "sport-performance"], 30, 2, ["bands", "mat", "dumbbells"], ["home", "minimal-equipment", "time-efficient"],
    "Beginner golfers with no gym who want two short home strength sessions a week to swing more consistently and enjoy the back nine more.",
    ["Alternate Day A and Day B, two or three days a week with a rest day between.",
     "Pick a band or dumbbell that leaves 2 reps in reserve; when every set hits the top of the range, go heavier.",
     "Rest 45-60 seconds between rounds of each superset.",
     "After 8-12 weeks move on to the Somax Golf Gym Strength series or the Utah Health program."],
    "Lower body, pulling and anti-rotation: squats, hinges, rows, Pallof presses and a side plank.",
    HOME_WU + [E("Goblet Squat (dumbbell or backpack)", 3, "10-12", group="A"), E("Band Row", 3, "12-15", group="A"),
               E("Dumbbell Romanian Deadlift", 3, "10-12", group="B"), E("Band Pallof Press", 3, "10/side", group="B"),
               E("Glute Bridge", 2, "15"), E("Side Plank (knees or feet)", 2, "20-30s/side")],
    [UT1, UT3, NHS_STRENGTH], series="Somax Golf Home Strength", day=1, days=2)

add("golf-home-strength-b", "Somax Golf Home Strength - Day B", "fitness", "beginner", "golf",
    ["strength", "sport-performance"], 30, 2, ["bands", "mat", "dumbbells"], ["home", "minimal-equipment", "time-efficient"],
    "Beginner golfers with no gym who want two short home strength sessions a week to swing more consistently and enjoy the back nine more.",
    ["Alternate Day A and Day B, two or three days a week with a rest day between.",
     "Pick a band or dumbbell that leaves 2 reps in reserve; when every set hits the top of the range, go heavier.",
     "Rest 45-60 seconds between rounds of each superset.",
     "After 8-12 weeks move on to the Somax Golf Gym Strength series or the Utah Health program."],
    "Single-leg strength, pressing and rotation: split squats, push-ups, band chops, bird-dogs and balance.",
    HOME_WU + [E("Split Squat", 3, "8-10/side", group="A"), E("Push-up (incline or floor)", 3, "8-12", group="A"),
               E("Single-leg Romanian Deadlift (hand on wall)", 3, "8/side", group="B"), E("Half-kneeling Band Chop", 3, "10/side", group="B"),
               E("Bird-Dog (2s hold)", 2, "8/side"), E("Single-leg Balance", 2, "30s/side")],
    [UT3, UT1, NHS_STRENGTH], series="Somax Golf Home Strength", day=2, days=2)

add("golf-senior-strength-balance", "Somax Senior Golfer Strength & Balance", "fitness", "beginner", "golf",
    ["strength", "general-fitness", "sport-performance"], 30, 3, ["chair", "bands", "golf club"], ["home", "older-adults", "minimal-equipment"],
    "Golfers in their 60s, 70s and beyond who want to keep walking 18 holes, stay steady through the swing and get up off the green easily.",
    ["Three times a week on non-consecutive days, plus walking the course counts as your aerobic work.",
     "Have a chair or bench beside you for balance drills; progress from holding on to fingertip support to hands-free.",
     "Add reps before you add band tension; fast sit-to-stands should be quick up, slow down.",
     "Had a fall in the last year, or dizziness? See your GP first and keep all balance work supported."],
    "Chair stands for leg power, band rows and chops for the swing muscles, plus heel-to-toe and single-leg balance.",
    [E("March on the spot", 1, "2 min"), E("Sit-to-Stand (fast up, slow down)", 3, "8"),
     E("Band Row", 3, "12"), E("Step-ups onto low step (rail nearby)", 2, "8/side"),
     E("Wall Push-up", 2, "10-12"), E("Half-kneeling or Seated Band Chop", 2, "10/side"),
     E("Heel-to-toe Walk", 2, "10 steps"), E("Single-leg Stand (hold support if needed)", 2, "10-20s/side"),
     E("Club-assisted Trunk Rotation", 1, "8/side")],
    [GRIPP, NHS_SIT, EMORY, UT3])

add("golf-18-hole-stamina", "Somax 18-Hole Stamina Builder", "other", "beginner", "golf",
    ["endurance", "general-fitness"], 40, 3, ["bodyweight", "golf bag (optional)"], ["outdoor", "older-adults", "minimal-equipment"],
    "Golfers who fade on the back nine or want to swap the cart for walking, and need to build walking stamina and leg endurance.",
    ["Three days a week; one of them can be a walked 9 holes instead.",
     "Walk at a pace where you can talk but not sing; add 5 minutes to the walk each week up to 60.",
     "Do the leg circuit straight after the walk, two rounds.",
     "Carrying your bag? Build up with a light bag first and use both straps."],
    "A brisk hilly walk followed by a short leg and trunk circuit, so 4-5 hours on your feet feels easy.",
    [E("Brisk walk (include hills or stairs)", 1, "25-30 min"), E("Walking Lunges", 2, "8/side", group="A"),
     E("Calf Raises", 2, "15", group="A"), E("Squat to Chair", 2, "12", group="A"),
     E("Standing Trunk Rotation", 2, "10/side", group="A"), E("Post-walk Calf and Hamstring Stretch", 1, "30s/side")],
    [UT2, NHS_POST, GRIPP])

add("golf-gym-strength-a", "Somax Golf Gym Strength - Day A Lower & Rotation", "gym", "intermediate", "golf",
    ["strength", "sport-performance"], 50, 3, ["trap bar", "dumbbells", "cables", "bench"], ["full-gym"],
    "Regular golfers with some gym experience who want an off-season 3-day strength block (8-10 weeks) to build the base for more clubhead speed.",
    ["Run Day A, B and C on three non-consecutive days for 8-10 weeks in the off-season.",
     "Main lifts at RPE 7-8 (2-3 reps in reserve); add 2.5-5kg when all sets hit the top of the range.",
     "Rest 2-3 minutes on main lifts, 60-90 seconds on accessories.",
     "In season drop to 1-2 sessions a week and never the day before a competition round."],
    "Trap-bar deadlift, single-leg work and cable chops: hip strength and rotation in one session.",
    GOLF_GYM_WU + [E("Trap-bar Deadlift", 4, "5-6"), E("Rear-foot Elevated Split Squat", 3, "8/side"),
                   E("Lateral Lunge", 3, "6/side", group="A"), E("Half-kneeling Cable Chop", 3, "8/side", group="A"),
                   E("Single-leg Hip Thrust", 3, "10/side", group="B"), E("Pallof Press", 3, "10/side", group="B")],
    [UT1, UT3, PJ1, STRONG_A], series="Somax Golf Gym Strength", day=1, days=3)

add("golf-gym-strength-b", "Somax Golf Gym Strength - Day B Upper & Anti-Rotation", "gym", "intermediate", "golf",
    ["strength", "sport-performance"], 50, 3, ["dumbbells", "cables", "landmine", "bench"], ["full-gym"],
    "Regular golfers with some gym experience who want an off-season 3-day strength block (8-10 weeks) to build the base for more clubhead speed.",
    ["Run Day A, B and C on three non-consecutive days for 8-10 weeks in the off-season.",
     "Main lifts at RPE 7-8 (2-3 reps in reserve); add weight when all sets hit the top of the range.",
     "Rest 2 minutes on presses and rows, 60-90 seconds on accessories.",
     "Shoulder or elbow pain on a lift: swap to a pain-free variation rather than pushing through."],
    "Pulling-biased upper body for shoulder balance, landmine pressing and anti-rotation core.",
    GOLF_GYM_WU + [E("Single-arm Dumbbell Row", 4, "8/side"), E("Half-kneeling Landmine Press", 3, "8/side"),
                   E("Chin-up or Lat Pulldown", 3, "6-10", group="A"), E("Dumbbell Bench Press", 3, "8-10", group="A"),
                   E("Face Pull", 3, "12-15", group="B"), E("Split-stance Pallof Press", 3, "10/side", group="B"),
                   E("Farmer's Carry", 3, "30m")],
    [UT1, UT3, PJ1], series="Somax Golf Gym Strength", day=2, days=3)

add("golf-gym-strength-c", "Somax Golf Gym Strength - Day C Power & Single-Leg", "gym", "intermediate", "golf",
    ["sport-performance", "strength"], 45, 3, ["medicine ball", "dumbbells", "plyo box", "cables"], ["full-gym"],
    "Regular golfers with some gym experience who want an off-season 3-day strength block (8-10 weeks) to build the base for more clubhead speed.",
    ["Run Day A, B and C on three non-consecutive days for 8-10 weeks in the off-season.",
     "Throws and jumps first while you're fresh: maximum intent, full rest (60-90s), stop if speed drops.",
     "Throw from both sides with equal effort.",
     "Keep the med ball light (2-4kg) - speed is the goal, not load."],
    "Jumps and rotational med-ball throws for speed, then goblet squats and single-leg RDLs.",
    GOLF_GYM_WU + [E("Box Jump (step down)", 3, "5"), E("Rotational Med-ball Scoop Toss", 3, "5/side", weight="2-4kg"),
                   E("Med-ball Shot-put Throw", 3, "4/side", weight="2-4kg"),
                   E("Goblet Squat", 3, "8-10", group="A"), E("Single-leg Romanian Deadlift", 3, "8/side", group="A"),
                   E("Cable Lift (low to high)", 3, "8/side")],
    [UT2, BLISS, PJ2], series="Somax Golf Gym Strength", day=3, days=3)

add("golf-rotational-power-home", "Somax Rotational Power at Home", "fitness", "intermediate", "golf",
    ["sport-performance"], 25, 2, ["medicine ball", "bands", "wall"], ["home", "minimal-equipment", "time-efficient"],
    "Golfers with a solid strength base who want to add rotational speed using a med ball against a brick wall or into a garden.",
    ["Two sessions a week, at least 48 hours apart and not the day before a round.",
     "Every rep is maximum intent; rest 60-90 seconds between sets so speed stays high.",
     "Progress sets before ball weight (weeks 1-4: 3 sets, weeks 5-8: 4 sets), then deload a week.",
     "Pass the Somax Golf Hip Mobility and Thoracic Turn routines first if rotation feels blocked."],
    "Split-stance, half-kneeling and full rotational med-ball throws plus band speed rotations, both sides.",
    HOME_WU + [E("Half-kneeling Med-ball Rotational Throw", 3, "5/side", weight="2-3kg"),
               E("Split-stance Scoop Toss", 3, "5/side", weight="2-3kg"),
               E("Step-behind Rotational Throw", 3, "4/side", weight="2-3kg"),
               E("Band Speed Rotations (golf posture)", 3, "8/side"),
               E("Countermovement Jump", 3, "5")],
    [UT2, BLISS, PJ2, TG2])

add("golf-clubhead-speed-session", "Somax Clubhead Speed Session", "other", "intermediate", "golf",
    ["sport-performance"], 25, 3, ["golf club", "light training club or alignment stick", "medicine ball"], ["outdoor", "time-efficient"],
    "Golfers who want more distance, have no current back or elbow pain and can already swing hard with good contact.",
    ["Up to three short sessions a week on the range or in the garden, with full rest between swings.",
     "Swing from both sides: dominant side at full speed, non-dominant side to balance the body.",
     "Measure with a radar or launch monitor every 4 weeks; track ball speed and strike, not just club speed.",
     "Overspeed protocols are common practice but not proven on their own - keep the strength work going too."],
    "Jumps and med-ball throws to prime, then light, normal and heavy speed swings from both sides.",
    [E("Dynamic warm-up (GRIPP or Somax hip/T-spine drills)", 1, "6 min"), E("Countermovement Jump", 2, "5"),
     E("Rotational Med-ball Throw", 2, "4/side", weight="2-3kg"),
     E("Light-stick Speed Swings (dominant side)", 3, "5", group="A"), E("Light-stick Speed Swings (non-dominant side)", 3, "5", group="A"),
     E("Normal-club Speed Swings", 2, "5"), E("Heavy-club or Two-club Swings (smooth)", 2, "5"),
     E("Full-effort Drives with feedback", 1, "5")],
    [BLISS, PJ3, GRIPP])

add("golf-anti-rotation-core", "Somax Golf Anti-Rotation Core", "fitness", "intermediate", "golf",
    ["sport-performance", "strength"], 20, 2, ["bands", "mat"], ["home", "minimal-equipment", "time-efficient", "travel"],
    "Golfers who lose their posture through impact or feel their lower back after hitting balls, and want a core session that trains resisting rotation.",
    ["Twice a week after mobility or strength work.",
     "Brace like you're about to be nudged; nothing below the ribs should twist.",
     "Rest 45 seconds between rounds; add a band or a second set when you hold every rep cleanly.",
     "Progress kneeling to split stance to standing as each version becomes easy."],
    "Pallof presses in three stances, plank variations that resist twisting, and dead bugs.",
    [E("Dead Bug", 2, "8/side"), E("Tall-kneeling Pallof Press", 2, "10/side", group="A"),
     E("Split-stance Pallof Press", 2, "10/side", group="A"), E("Standing Pallof Press with Overhead Raise", 2, "8/side", group="A"),
     E("Plank Shoulder Taps (feet wide)", 3, "8/side", group="B"), E("Side Plank", 2, "30s/side", group="B"),
     E("Bird-Dog Row (band)", 2, "8/side")],
    [UT3, TG1, PJ2])

add("golf-balance-ground-force", "Somax Golf Balance & Ground Force", "fitness", "intermediate", "golf",
    ["sport-performance", "strength"], 25, 2, ["mat", "bands", "golf club", "cushion (optional)"], ["home", "minimal-equipment"],
    "Golfers who sway, lose balance in the finish or can't hold a single-leg stand for 30 seconds with eyes closed.",
    ["Twice a week, ideally after a short warm-up.",
     "Single-leg moves: knee over second toe, hips level; use a wall for fingertip support at first.",
     "Progress from eyes open, to eyes closed, to standing on a cushion.",
     "Re-test the eyes-closed single-leg stand every 4 weeks."],
    "Single-leg balance, mini-band lateral work and lateral bounds to steady the weight shift and push off the ground.",
    [E("Single-leg Stand (eyes open, then closed)", 2, "30s/side"), E("Mini-band Lateral Walk", 2, "10 steps each way"),
     E("Single-leg RDL Reach", 3, "8/side"), E("Lateral Lunge to Balance", 3, "6/side"),
     E("Skater Bound (stick the landing)", 3, "5/side"), E("Finish-position Hold on lead leg (club)", 2, "20s/side")],
    [UT3, TG2, BLISS])

add("golf-shoulder-elbow-wrist-care", "Somax Golf Shoulder, Elbow & Wrist Care", "fitness", "intermediate", "golf",
    ["strength", "mobility"], 20, 3, ["bands", "dumbbells", "wall"], ["home", "minimal-equipment", "travel", "time-efficient"],
    "Golfers who hit a lot of balls, play on hard ground or mats, or have had niggly elbows or shoulders and want to build tissue tolerance.",
    ["Three times a week; light enough to do after golf.",
     "Slow lowering (3 seconds) on wrist and forearm work.",
     "Mild effort only - 2-3 reps in reserve every set.",
     "Pain that lasts into the next day or a sore, swollen elbow needs a physio, not more sets."],
    "Rotator-cuff band work, scapular wall slides and slow wrist and forearm strengthening for the joints golf loads most.",
    [E("Band External Rotation (elbow at side)", 2, "12-15/side"), E("Band Internal Rotation", 2, "12-15/side"),
     E("Scapular Wall Slides", 2, "10"), E("Band Pull-apart", 2, "15"),
     E("Wrist Curl (slow lower)", 2, "12-15", weight="1-4kg"), E("Reverse Wrist Curl (slow lower)", 2, "12-15", weight="1-4kg"),
     E("Forearm Rotation with hammer or dumbbell", 2, "10 each way"), E("Cross-body Shoulder Stretch", 1, "30s/side")],
    [UT1, GRIPP, BLISS])

add("golf-in-season-maintenance", "Somax In-Season Golf Maintenance", "gym", "intermediate", "golf",
    ["strength", "sport-performance"], 35, 1, ["dumbbells", "medicine ball", "bands"], ["full-gym", "time-efficient", "busy"],
    "Golfers in the playing season who want to hold onto off-season strength and speed in one or two short sessions a week.",
    ["One or two sessions a week, never the day before a competition round.",
     "Keep loads close to your off-season working weights but cut the sets - you should finish fresh.",
     "Throws first, then strength, then a quick mobility finisher.",
     "Back to 3 sessions a week in the off-season (Somax Golf Gym Strength)."],
    "A short full-body hit: med-ball throws, a squat, a hinge, a row and a press, then hips and T-spine mobility.",
    GOLF_GYM_WU[:2] + [E("Rotational Med-ball Throw", 2, "5/side", weight="2-4kg"), E("Goblet Squat", 2, "6-8"),
                       E("Dumbbell Romanian Deadlift", 2, "6-8"), E("Single-arm Row", 2, "8/side"),
                       E("Half-kneeling Press", 2, "8/side"), E("90/90 Hip Switches", 1, "6/side"),
                       E("Open Book", 1, "6/side")],
    [UT1, UT2, PJ1])

add("golf-travel-hotel", "Somax Golf Trip Hotel Workout", "fitness", "intermediate", "golf",
    ["mobility", "strength", "sport-performance"], 20, 3, ["bodyweight", "bands"], ["travel", "minimal-equipment", "time-efficient", "busy"],
    "Golfers on a golf trip or work travel who want to stay loose and strong between rounds with just a band in the suitcase.",
    ["On rest days or the evening after a round - keep it easy before early tee times.",
     "Two rounds of the circuit, 45 seconds rest between rounds.",
     "Finish with the mobility drills even if you skip the circuit.",
     "Long flight or drive? Do the hip flexor stretch and open books as soon as you arrive."],
    "Hotel-room circuit of squats, split squats, band rows and presses, then hip and T-spine mobility.",
    [E("Hotel-room warm-up: march + arm circles", 1, "3 min"), E("Bodyweight Squat", 2, "15", group="A"),
     E("Split Squat", 2, "10/side", group="A"), E("Band Row (door anchor)", 2, "15", group="A"),
     E("Push-up", 2, "10", group="A"), E("Band Pallof Press", 2, "10/side", group="A"),
     E("90/90 Hip Switches", 1, "8/side"), E("Open Book", 1, "8/side"), E("Half-kneeling Hip Flexor Stretch", 1, "30s/side")],
    [UT1, UT3, GOLFSHAKE])

add("golf-offseason-power-a", "Somax Golf Off-Season Power - Day A", "gym", "advanced", "golf",
    ["sport-performance", "strength"], 60, 2, ["barbell", "trap bar", "medicine ball", "plyo box", "cables"], ["full-gym"],
    "Low-handicap or competitive golfers with a strength base (e.g. trap-bar deadlift around 1.5x bodyweight) chasing more clubhead speed in a 6-8 week off-season power block.",
    ["Two sessions a week (Day A and B) for 6-8 weeks after a strength block; deload every 4th week.",
     "Contrast pairs: one heavy set, rest 60-90s, then the fast movement with maximum intent; full 3 minutes between pairs.",
     "Throws and jumps stop as soon as speed drops.",
     "Re-test driver clubhead speed every 4 weeks on the same radar."],
    "Heavy-to-fast contrast pairs: trap-bar deadlift into jumps, landmine press into rotational throws, then single-leg strength.",
    GOLF_GYM_WU + [E("Trap-bar Deadlift", 4, "3", weight="~85% 1RM", group="A"), E("Countermovement Jump", 4, "3", group="A"),
                   E("Landmine Rotational Press", 3, "5/side", group="B"), E("Med-ball Step-behind Throw", 3, "4/side", weight="3-4kg", group="B"),
                   E("Rear-foot Elevated Split Squat", 3, "6/side"), E("Cable Chop (fast)", 3, "6/side")],
    [PJ2, PJ1, BLISS, UT2], series="Somax Golf Off-Season Power", day=1, days=2)

add("golf-offseason-power-b", "Somax Golf Off-Season Power - Day B", "gym", "advanced", "golf",
    ["sport-performance", "strength"], 55, 2, ["barbell", "medicine ball", "dumbbells", "plyo box", "cables"], ["full-gym"],
    "Low-handicap or competitive golfers with a strength base (e.g. trap-bar deadlift around 1.5x bodyweight) chasing more clubhead speed in a 6-8 week off-season power block.",
    ["Two sessions a week (Day A and B) for 6-8 weeks after a strength block; deload every 4th week.",
     "Contrast pairs: one heavy set, rest 60-90s, then the fast movement with maximum intent; full 3 minutes between pairs.",
     "Throws and jumps stop as soon as speed drops.",
     "Re-test driver clubhead speed every 4 weeks on the same radar."],
    "Squat into broad jumps, bench into plyo push-ups, rotational throws and heavy pulls.",
    GOLF_GYM_WU + [E("Back or Front Squat", 4, "3", weight="~85% 1RM", group="A"), E("Broad Jump", 4, "3", group="A"),
                   E("Bench Press", 3, "4", weight="~80% 1RM", group="B"), E("Plyometric Push-up", 3, "5", group="B"),
                   E("Rotational Med-ball Scoop Toss", 3, "5/side", weight="3-4kg"), E("Chest-supported Row", 3, "6-8"),
                   E("Single-leg Hip Thrust", 2, "8/side")],
    [PJ2, PJ1, BLISS], series="Somax Golf Off-Season Power", day=2, days=2)

add("golf-advanced-speed-contrast", "Somax Advanced Speed Day", "other", "advanced", "golf",
    ["sport-performance"], 30, 2, ["medicine ball", "speed training sticks or light/heavy clubs", "golf club"], ["outdoor", "time-efficient"],
    "Advanced golfers already doing strength training who want a dedicated speed session in the 6-8 weeks before the season.",
    ["Two sessions a week, at least 48 hours apart and separate from heavy leg days.",
     "Maximum intent, full rest (20-30s between swings, 2 minutes between sets).",
     "Log club speed for each set; end the session if speed falls more than ~3% from your best.",
     "In season, keep one short session a week; overspeed alone hasn't been proven to give lasting gains, so keep lifting."],
    "Jumps and heavy throws to potentiate, then heavy-normal-light speed swings from both sides and full-effort drives.",
    [E("Dynamic warm-up and progressive swings", 1, "8 min"), E("Countermovement Jump", 3, "3"),
     E("Heavy Med-ball Rotational Throw", 2, "3/side", weight="4-5kg"),
     E("Heavy-stick Swings (dominant side)", 2, "5"), E("Normal-stick Swings (dominant side)", 2, "5"),
     E("Light-stick Swings (dominant side)", 2, "5"), E("Light-stick Swings (non-dominant side)", 2, "5"),
     E("Full-effort Drives measured", 1, "5")],
    [BLISS, PJ3, PJ2])

# ============================================================================= PILATES
PIL_SAFE = "Osteoporosis, pregnancy, a recent back injury or pelvic-floor symptoms? Skip rolling and deep curl-up moves and get a physio's OK first."

add("pilates-breath-neutral-15", "Somax Pilates Breath & Neutral 15", "fitness", "beginner", "pilates",
    ["mobility", "general-fitness"], 15, 3, ["mat"], ["home", "older-adults", "minimal-equipment", "time-efficient"],
    "Complete beginners - including people who can't yet hold a 20-second plank or do a Roll Up - who want to learn the Pilates basics before a full class.",
    ["Three times a week for 2-4 weeks.",
     "Learn the set-up: lateral rib breathing, neutral spine, shoulder blades down and relaxed, long neck.",
     "Breathe out on the effort; quality matters more than reps.",
     "When you can do every move with control, go to Somax Mat Pilates Beginner 20."],
    "The foundation layer of Pilates: breathing, pelvic neutral and imprint, small leg movements and gentle spine mobility.",
    [E("Lateral Rib Breathing", 1, "8 breaths"), E("Pelvic Tilts (neutral to imprint)", 1, "10"),
     E("Knee Folds (table top, one leg)", 1, "6/side"), E("Leg Slides", 1, "6/side"),
     E("Bent-knee Fall Out", 1, "6/side"), E("Bridge (articulating)", 1, "8"),
     E("Cat-Cow", 1, "6"), E("Rest Position (child's pose)", 1, "30s")],
    [LPT, CLASSICAL])

add("pilates-mat-beginner-20", "Somax Mat Pilates Beginner 20", "fitness", "beginner", "pilates",
    ["general-fitness", "mobility"], 20, 3, ["mat"], ["home", "minimal-equipment", "time-efficient", "busy"],
    "Beginners who have the basics and want a 20-minute mat session to build core endurance and flexibility at home.",
    ["Two or three times a week - the dose used in research that improved abdominal endurance and hamstring flexibility.",
     "Move slowly, keep your lower back steady on the mat during abdominal work, and breathe out on effort.",
     "Add 2 reps per exercise every couple of weeks, then lengthen levers (straighter legs).",
     PIL_SAFE],
    "A short mat sequence of modified classical moves: Hundred, half roll-back, leg circles, single-leg stretch, bridge, side kicks and swimming.",
    [E("Breathing in table top", 1, "5 breaths"), E("Modified Hundred (legs table top, head down if needed)", 1, "50 pumps"),
     E("Half Roll-back", 1, "6"), E("Single Leg Circles (bent knee)", 1, "5 each way/leg"),
     E("Single Leg Stretch (head down)", 1, "8/side"), E("Bridge with arm raise", 1, "8"),
     E("Side Kick Front/Back (small range)", 1, "8/side"), E("Swimming Prep (opposite arm and leg)", 1, "8/side"),
     E("Spine Stretch Forward", 1, "5")],
    [LPT, CLASSICAL])

add("pilates-back-care-20", "Somax Back-Friendly Pilates 20", "fitness", "beginner", "pilates",
    ["mobility", "general-fitness"], 20, 3, ["mat", "pillow or folded towel"], ["home", "older-adults", "minimal-equipment"],
    "People with everyday, non-specific back stiffness (cleared by a clinician if it's been going on a while) who want gentle, controlled Pilates to stay moving.",
    ["Two or three times a week; little and often beats one long session.",
     "Stay in a comfortable range - mild discomfort that settles within 2 hours is OK.",
     "Pilates is a good option for back pain but not proven better than other exercise - keep walking too.",
     "Red flags (leg numbness or weakness, bladder or bowel changes, night pain) mean see a doctor first."],
    "No curl-ups or rolling: pelvic tilts, articulating bridges, cat-cow, bird-dog, clams, a gentle swan and spine stretch.",
    [E("Pelvic Tilts", 1, "10"), E("Knee Rolls", 1, "8/side"), E("Bridge (articulating)", 2, "8"),
     E("Cat-Cow", 1, "8"), E("Bird-Dog / Swimming Prep", 2, "6/side"), E("Side-lying Clam", 2, "10/side"),
     E("Swan Prep (prone chest lift)", 1, "6"), E("Seated Spine Stretch Forward", 1, "5"), E("Child's Pose", 1, "45s")],
    [LPT, BHFT, CLASSICAL])

add("pilates-chair-older-adults-20", "Somax Chair Pilates for Older Adults", "fitness", "beginner", "pilates",
    ["general-fitness", "mobility", "strength"], 20, 3, ["chair", "small ball or cushion", "bands"], ["home", "older-adults", "minimal-equipment"],
    "Older adults, or anyone who finds getting down to the floor hard, who want Pilates-style core, posture-muscle and leg work from a chair.",
    ["Two or three times a week; it counts towards your strength days.",
     "Sit tall on the front of a sturdy chair without wheels; feet flat.",
     "Breathe out on the effort and keep shoulders relaxed away from the ears.",
     "Add a standing sit-to-stand set when the seated moves feel easy."],
    "Seated breathing, spine curls and twists, ball squeezes, knee lifts, band rows and sit-to-stands.",
    [E("Seated Lateral Breathing", 1, "6 breaths"), E("Seated Pelvic Tilts", 1, "10"),
     E("Seated Spine Curl (roll down and up)", 1, "6"), E("Seated Spine Twist", 1, "6/side"),
     E("Ball Squeeze between knees (5s)", 1, "10"), E("Seated Knee Lift (tummy drawn in)", 2, "8/side"),
     E("Seated Band Row", 2, "12"), E("Seated Side Reach", 1, "6/side"), E("Sit-to-Stand", 2, "8")],
    [NHS_SIT, LPT, EMORY])

add("pilates-pelvic-floor-friendly-core", "Somax Pelvic-Floor-Friendly Core", "fitness", "beginner", "pilates",
    ["general-fitness", "strength"], 20, 3, ["mat", "exercise ball (optional)", "wall"], ["home", "minimal-equipment"],
    "People with (or at risk of) pelvic-floor symptoms - postnatal after clearance, around menopause or after prostate surgery - who still want core training.",
    ["Two or three times a week.",
     "Lift your pelvic floor first, keep it lifted through the effort, then fully relax; never hold your breath or strain.",
     "Start with 1-2 sets of 10; stop the set when your pelvic floor tires.",
     "Skips crunches, the Hundred, double leg lowers and full planks on purpose. A women's or men's health physio can tailor it further."],
    "Core work that keeps pressure off the pelvic floor: supported leg extensions, knee sways, modified planks, wall push-ups, bridges and all-fours lifts.",
    [E("Pelvic Floor Lift & Release", 1, "8 slow + 8 quick"), E("Supported Single Leg Extension", 2, "8/side"),
     E("Knees Side to Side (feet on ball or floor)", 2, "8/side"), E("Modified Plank on Knees", 2, "15-20s"),
     E("Wall Push-up", 2, "10"), E("Bridge", 2, "10"), E("Arm and Leg Lift on All Fours", 2, "6/side"),
     E("Side-lying Clam", 1, "10/side")],
    [LPT, BHFT])

add("pilates-standing-15", "Somax Standing Pilates 15", "fitness", "beginner", "pilates",
    ["general-fitness", "mobility"], 15, 3, ["chair"], ["home", "older-adults", "minimal-equipment", "time-efficient", "travel"],
    "Anyone who wants Pilates without lying on the floor - older adults, people short on space, or a quick session at work or in a hotel.",
    ["Three times a week, or as a break from sitting.",
     "Stand tall with weight spread evenly between heels and toes; hold a chair if balance is shaky.",
     "Breathe out on the effort and keep the pelvis level.",
     "Progress by adding the arm movements and then trying single-leg moves without support."],
    "Standing footwork, knee bends, roll downs, toy soldier and single-leg balance from the NHS Pilates warm-up tradition.",
    [E("Standing Alignment & Breathing", 1, "5 breaths"), E("Heel Raises with arm raise", 2, "10"),
     E("Knee Bends (mini squat) with arms forward", 2, "10"), E("Standing Roll Down", 1, "5"),
     E("Toy Soldier (alternating heel & arm)", 1, "8/side"), E("Single Leg Bend (knee to hip height)", 1, "8/side"),
     E("Standing Side Leg Lift (hold chair)", 1, "10/side"), E("Bow and Arrow Rotation", 1, "6/side")],
    [LPT, NHS_SIT])

add("pilates-desk-break-15", "Somax Desk-Worker Pilates 15", "fitness", "beginner", "pilates",
    ["mobility", "general-fitness"], 15, 5, ["chair", "mat"], ["busy", "time-efficient", "minimal-equipment", "home"],
    "Office and home-office workers who sit most of the day and want a short Pilates session for the upper back, hips and core.",
    ["Most workdays - at lunch or straight after work.",
     "Half seated, half on the mat; skip the mat moves if you're at the office.",
     "Move with your breath and keep your shoulders away from your ears.",
     "Feeling better at your desk is a fair goal; Pilates hasn't been shown to change posture itself."],
    "Seated spine mobility and shoulder-blade work, then a short mat block of bridges, swimming and the swan.",
    [E("Seated Lateral Breathing", 1, "6 breaths"), E("Seated Spine Twist", 1, "6/side"),
     E("Seated Cat-Cow", 1, "8"), E("Chin Tucks", 1, "10"), E("Seated Arm Openings (cactus)", 1, "10"),
     E("Bridge (articulating)", 1, "10"), E("Swimming Prep", 1, "8/side"), E("Swan Prep", 1, "6"),
     E("Half-kneeling Hip Flexor Stretch", 1, "30s/side")],
    [LIVELIGHTER, LPT, NHS_SIT])

add("pilates-plank-builder-beginner", "Somax Plank Builder (Beginner)", "fitness", "beginner", "pilates",
    ["strength", "general-fitness"], 12, 3, ["mat"], ["home", "minimal-equipment", "time-efficient", "busy"],
    "Beginners whose goal is core endurance - e.g. a 60-second plank - and who want a short add-on after a Pilates or walking session.",
    ["2-3 times a week, after a mat session or on its own.",
     "Hold 60-70% of your current best plank, perfect form; stop when your hips sag or your back arches.",
     "Add about 10% hold time per week for six weeks, then about 5%.",
     "Milestones: 30s, then 60s, then 90s - re-test every 3-4 weeks."],
    "Front planks, side planks and leg-pull prep at a fraction of your max, with timed rests.",
    [E("Dead Bug", 1, "6/side"), E("Forearm Plank (knees or feet)", 3, "60-70% of max hold", group="A"),
     E("Side Plank (knees or feet)", 2, "half front-plank time/side", group="A"),
     E("Leg Pull Front Prep (plank with leg lift)", 2, "5/side"), E("Rest between sets", 3, "45-60s"),
     E("Child's Pose", 1, "45s")],
    [LPT, CLASSICAL])

add("pilates-mat-intermediate-30", "Somax Mat Pilates Intermediate 30", "fitness", "intermediate", "pilates",
    ["general-fitness", "mobility", "strength"], 30, 3, ["mat"], ["home", "minimal-equipment"],
    "People who can do the beginner mat moves and a few controlled Roll Ups and want a fuller 30-minute flowing session.",
    ["Two or three times a week; this is the 12-week block where research saw core endurance and flexibility gains.",
     "Reps start at the bottom of each range; move up when the last rep looks like the first.",
     "Flow from one move to the next with as little rest as possible.",
     PIL_SAFE],
    "The Hundred, Roll Up, the five-move abdominal series, Saw, side kicks, single-leg kicks and swan.",
    [E("The Hundred (legs table top or 45 degrees)", 1, "100 pumps"), E("Roll Up", 1, "5"),
     E("Single Leg Circles", 1, "5 each way/leg"), E("Single Leg Stretch", 1, "8/side"),
     E("Double Leg Stretch", 1, "6"), E("Single Straight Leg Stretch", 1, "8/side"), E("Criss Cross", 1, "8/side"),
     E("Spine Stretch Forward", 1, "5"), E("Saw", 1, "4/side"), E("Side Kick Series (front/back, up/down, circles)", 1, "8 each/side"),
     E("Single Leg Kicks", 1, "6/side"), E("Swan", 1, "5"), E("Rest Position", 1, "30s")],
    [CLASSICAL, LPT])

add("pilates-core-endurance-30", "Somax Pilates Core Endurance 30", "fitness", "intermediate", "pilates",
    ["strength", "general-fitness"], 30, 3, ["mat"], ["home", "minimal-equipment"],
    "Intermediate Pilates users who want to build abdominal and trunk endurance - longer planks, steadier side planks, better control.",
    ["Two or three times a week, not on consecutive days.",
     "Work in timed rounds: 40 seconds on, 20 seconds off, two rounds of each block.",
     "Keep the ribs knitted and the pelvis level - end the set when form breaks, not the clock.",
     "Re-test your plank every 3-4 weeks."],
    "Timed Pilates core blocks: Hundred, abdominal series, plank and leg-pull work, side-plank series and back extension.",
    [E("The Hundred", 1, "100 pumps"), E("Single Leg Stretch", 2, "40s", group="A"), E("Criss Cross", 2, "40s", group="A"),
     E("Forearm Plank", 2, "40s", group="B"), E("Leg Pull Front (alternating leg lift)", 2, "40s", group="B"),
     E("Side Plank with hip dips", 2, "30s/side", group="C"), E("Side Plank Leg Lift", 2, "20s/side", group="C"),
     E("Swimming", 2, "40s"), E("Swan", 1, "5"), E("Rest Position", 1, "45s")],
    [CLASSICAL, LPT])

add("pilates-glutes-side-kick-20", "Somax Pilates Glutes & Side Kick 20", "fitness", "intermediate", "pilates",
    ["strength", "general-fitness"], 20, 3, ["mat", "mini band (optional)"], ["home", "minimal-equipment", "time-efficient"],
    "Pilates users, runners and walkers who want stronger, more enduring hips and glutes from a short lying-down session.",
    ["Two or three times a week.",
     "Keep the hips stacked and still - the leg moves, the pelvis doesn't.",
     "Add a mini band above the knees once all reps feel controlled.",
     "Swap sides in the middle of each block so both sides get the same work."],
    "Bridges, clams, side-lying leg series and prone heel squeezes for the glutes and outer hips.",
    [E("Bridge with march", 2, "6/side"), E("Single-leg Bridge", 2, "8/side"),
     E("Clam (band optional)", 2, "12/side"), E("Side Kick Front/Back", 1, "10/side"),
     E("Side Lift and Lower", 1, "10/side"), E("Side Leg Circles", 1, "8 each way/side"),
     E("Inner Thigh Lift", 1, "10/side"), E("Prone Heel Squeeze", 2, "10"), E("Figure-4 Glute Stretch", 1, "30s/side")],
    [LPT, CLASSICAL])

add("pilates-spine-mobility-20", "Somax Pilates Spine Mobility 20", "fitness", "intermediate", "pilates",
    ["mobility", "general-fitness"], 20, 3, ["mat"], ["home", "minimal-equipment", "time-efficient"],
    "People who feel stiff through the back and want to move the spine through bending, extending, side-bending and twisting with control.",
    ["Two to four times a week; a good recovery day option.",
     "Articulate one segment at a time and breathe into the stiff spots.",
     "Never force range - smooth control is the point.",
     PIL_SAFE],
    "Roll downs, bridges, spine stretch, saw, spine twist, mermaid side bends, swan and cat-cow.",
    [E("Standing Roll Down", 1, "5"), E("Bridge (articulating)", 1, "8"), E("Spine Stretch Forward", 1, "5"),
     E("Saw", 1, "4/side"), E("Spine Twist (seated)", 1, "5/side"), E("Mermaid Side Bend", 1, "4/side"),
     E("Swan", 1, "5"), E("Cat-Cow", 1, "8"), E("Thread the Needle", 1, "5/side"), E("Rest Position", 1, "45s")],
    [CLASSICAL, LPT, SUN])

add("pilates-band-reformer-free-30", "Somax Reformer-Free Band Pilates 30", "fitness", "intermediate", "pilates",
    ["strength", "general-fitness"], 30, 3, ["mat", "long resistance band"], ["home", "minimal-equipment", "travel"],
    "Reformer fans without studio access who want spring-style resistance at home using a long band.",
    ["Two or three times a week.",
     "Pick a band that lets you control both the push and the return - the slow return is half the exercise.",
     "Breathe out on the push, in on the return; keep the pelvis steady.",
     "Swap to a stronger band when every set feels smooth."],
    "Band versions of reformer staples: footwork, leg circles, frog, rowing, chest expansion and hamstring curls, plus the Hundred.",
    [E("Band Footwork (lying, band around feet)", 2, "10"), E("Band Leg Circles", 1, "5 each way/leg"),
     E("Band Frog", 2, "10"), E("The Hundred with band (arms pump against band)", 1, "100 pumps"),
     E("Seated Band Rowing", 2, "10"), E("Kneeling Chest Expansion (band anchored)", 2, "8"),
     E("Side-lying Band Leg Press", 2, "10/side"), E("Prone Band Hamstring Curl", 2, "10"),
     E("Band Mermaid Stretch", 1, "4/side")],
    [CLASSICAL, LPT])

add("pilates-small-ball-20", "Somax Small Ball Pilates 20", "fitness", "intermediate", "pilates",
    ["general-fitness", "strength"], 20, 3, ["mat", "small pilates ball"], ["home", "minimal-equipment", "time-efficient"],
    "Pilates users who want extra core and inner-thigh challenge and feedback using a soft 20-25cm ball.",
    ["Two or three times a week.",
     "Squeeze the ball gently - enough to keep it, not so hard you grip with your neck.",
     "Use the ball under your head or sacrum when you need support.",
     "Progress by taking the support away or lengthening the levers."],
    "Ball squeezes in bridge and curl-up, supported roll-back, oblique curls, side-lying ball lifts and prone work.",
    [E("Bridge with ball squeeze", 2, "10"), E("Curl-up with ball between knees", 2, "8"),
     E("Roll-back with ball behind lower back", 1, "6"), E("Oblique Curl (ball squeeze)", 1, "8/side"),
     E("Single Leg Stretch (ball under sacrum)", 1, "8/side"), E("Side-lying Ball Lift (ball between ankles)", 1, "10/side"),
     E("Prone Ball Roll (swan prep)", 1, "8"), E("Seated Spine Twist (ball between knees)", 1, "5/side")],
    [CLASSICAL, LPT])

add("pilates-for-runners-25", "Somax Pilates for Runners", "fitness", "intermediate", "pilates",
    ["sport-performance", "strength", "mobility"], 25, 2, ["mat", "mini band"], ["home", "minimal-equipment"],
    "Runners who want Pilates-style hip, glute and trunk control plus hip mobility to complement their running week.",
    ["Twice a week on easy-run or rest days, not before a hard session.",
     "Focus on a level pelvis in all single-leg work.",
     "Add the mini band once clams and side kicks feel easy.",
     "Pair with the Somax Runner's Post-Run Stretch after your runs."],
    "Single-leg bridges, side kick series, swimming, standing balance and hip-flexor and hamstring mobility.",
    [E("Single-leg Bridge", 2, "8/side"), E("Clam with mini band", 2, "12/side"), E("Side Kick Front/Back", 1, "10/side"),
     E("Swimming", 2, "20s"), E("Single Leg Stretch", 1, "8/side"), E("Standing Single-leg Balance with knee drive", 2, "8/side"),
     E("Spine Twist", 1, "5/side"), E("Half-kneeling Hip Flexor Stretch", 1, "30s/side"), E("Lying Hamstring Stretch with band", 1, "30s/side")],
    [LPT, CLASSICAL, NHS_POST])

add("pilates-for-golfers-20", "Somax Pilates for Golfers", "fitness", "intermediate", "pilates",
    ["mobility", "sport-performance"], 20, 2, ["mat", "golf club"], ["home", "minimal-equipment", "time-efficient"],
    "Golfers who like Pilates and want a session focused on trunk control and rotation to complement golf.",
    ["Twice a week, away from your gym or speed days.",
     "Keep the pelvis still in the rotation moves so the upper back does the turning.",
     "Breathe out as you rotate.",
     "Pair with Somax Golf Hip Mobility 15 if your hips are the stiffer link."],
    "Spine twists, saws, side-lying openings, side planks and swimming for rotation and anti-rotation control.",
    [E("Breathing in table top", 1, "5 breaths"), E("Bridge (articulating)", 1, "8"), E("Criss Cross", 1, "8/side"),
     E("Side-lying Arm Opening", 1, "6/side"), E("Saw", 1, "4/side"), E("Spine Twist with club across shoulders", 1, "6/side"),
     E("Side Plank (knees or feet)", 2, "20s/side"), E("Swimming", 1, "20s"), E("Mermaid Side Bend", 1, "4/side")],
    [CLASSICAL, LPT, GRIPP])

add("pilates-full-mat-45", "Somax Full Mat Pilates 45", "fitness", "intermediate", "pilates",
    ["general-fitness", "mobility", "strength"], 45, 2, ["mat"], ["home", "minimal-equipment"],
    "Experienced mat Pilates users who want a complete 45-minute class at home with warm-up, full mat sequence and stretch.",
    ["Two or three times a week (max 3-4 Pilates sessions); fill other days with walking or cardio.",
     "Flow through the order with control; rest only when form slips.",
     "Skip any move you're not ready for rather than reshuffle the order.",
     PIL_SAFE],
    "Standing warm-up, the classical abdominal series, rolling, side kicks, teaser prep, back extension and a stretch to finish.",
    [E("Standing Roll Down", 1, "4"), E("Pelvic Tilts and Bridge", 1, "8"), E("The Hundred", 1, "100 pumps"),
     E("Roll Up", 1, "5"), E("Single Leg Circles", 1, "5 each way/leg"), E("Rolling Like a Ball", 1, "6"),
     E("Single Leg Stretch", 1, "8/side"), E("Double Leg Stretch", 1, "6"), E("Criss Cross", 1, "8/side"),
     E("Spine Stretch Forward", 1, "4"), E("Saw", 1, "4/side"), E("Side Kick Series", 1, "8 each/side"),
     E("Teaser Prep (one leg)", 1, "4/side"), E("Swimming", 1, "30s"), E("Swan", 1, "5"),
     E("Seal", 1, "6"), E("Child's Pose and Hamstring Stretch", 1, "2 min")],
    [CLASSICAL, LPT])

add("pilates-advanced-mat-45", "Somax Advanced Mat Pilates 45", "fitness", "advanced", "pilates",
    ["strength", "mobility", "general-fitness"], 45, 3, ["mat"], ["home", "minimal-equipment"],
    "Advanced Pilates practitioners who complete the intermediate order with control and want the demanding classical material.",
    ["Two or three times a week (no more than four Pilates sessions).",
     "Each rep is precise and controlled - drop to the intermediate version if momentum creeps in.",
     "Warm up thoroughly; the Roll Over, Jackknife and Corkscrew load the neck and spine.",
     "Not suitable with osteoporosis, neck problems or during pregnancy."],
    "Advanced classical mat work: Roll Over, Corkscrew, Teaser 1-3, Jackknife, Scissors and Bicycle, Shoulder Bridge, Control Balance and more.",
    [E("The Hundred (legs low)", 1, "100 pumps"), E("Roll Up", 1, "5"), E("Roll Over", 1, "5"),
     E("Single Leg Circles", 1, "5 each way/leg"), E("Open Leg Rocker", 1, "6"), E("Corkscrew", 1, "3/side"),
     E("Saw", 1, "4/side"), E("Swan Dive", 1, "5"), E("Double Leg Kicks", 1, "3/side"), E("Neck Pull", 1, "5"),
     E("Scissors", 1, "6/side"), E("Bicycle", 1, "5 each way"), E("Shoulder Bridge", 1, "5/side"),
     E("Spine Twist", 1, "5/side"), E("Jackknife", 1, "4"), E("Teaser 1-3", 1, "3 each"),
     E("Control Balance", 1, "3/side"), E("Push-up (Pilates)", 1, "3")],
    [CLASSICAL])

add("pilates-advanced-core-power-30", "Somax Advanced Pilates Core Power 30", "fitness", "advanced", "pilates",
    ["strength", "sport-performance"], 30, 2, ["mat", "small pilates ball (optional)"], ["home", "minimal-equipment", "time-efficient"],
    "Advanced Pilates users and athletes who want a hard, short core session built from Pilates' toughest abdominal and plank work.",
    ["Twice a week, not on consecutive days.",
     "Two rounds; rest 60 seconds between rounds.",
     "Stop each exercise at the first loss of control rather than chasing reps.",
     "Not for anyone with current back pain, osteoporosis or pelvic-floor symptoms."],
    "Teaser variations, leg pull front and back, side bend, boomerang prep and hip twist.",
    [E("Teaser (hold top 3s)", 2, "5"), E("Leg Pull Front", 2, "4/side"), E("Leg Pull Back", 2, "4/side"),
     E("Side Bend (Pilates star prep)", 2, "4/side"), E("Hip Twist with Stretched Arms", 2, "3 each way"),
     E("Boomerang Prep", 2, "4"), E("Double Leg Stretch (low levers)", 2, "8"), E("Swimming", 2, "40s")],
    [CLASSICAL])

add("pilates-band-advanced-45", "Somax Reformer-Free Band Pilates 45 (Advanced)", "fitness", "advanced", "pilates",
    ["strength", "general-fitness"], 45, 2, ["mat", "long resistance band", "heavy resistance band"], ["home", "travel"],
    "Experienced reformer clients who want a tough, spring-style home session with bands when they can't get to the studio.",
    ["Two sessions a week alongside mat work.",
     "Heavy band for leg work, lighter band for arms - control the return every rep.",
     "Hold 2-3 seconds at the end of each long-lever move.",
     "Anchor bands to something solid (closed door anchor or sturdy post) and check them for wear."],
    "Band versions of advanced reformer work: running footwork, long stretch series, knee stretches, semi-circle, rowing series, side splits and teaser with band.",
    [E("Band Footwork (single leg)", 2, "10/side"), E("Band Running (alternating heels)", 1, "60s"),
     E("Long Stretch Plank with band press", 2, "6"), E("Knee Stretches (band behind, kneeling)", 2, "10"),
     E("Band Semi-circle (bridge with band)", 1, "6"), E("Band Rowing Series", 2, "8 each"),
     E("Standing Side Splits with band", 2, "8/side"), E("Teaser with band", 2, "5"),
     E("Band Long Box Pulling Straps (prone)", 2, "8"), E("Band Mermaid", 1, "4/side")],
    [CLASSICAL, LPT])

# ======================================================================= YOGA-MOBILITY
add("yoga-morning-wake-up-10", "Somax Morning Wake-Up Flow 10", "other", "beginner", "yoga-mobility",
    ["mobility", "general-fitness"], 10, 5, ["mat"], ["home", "travel", "time-efficient", "busy", "minimal-equipment"],
    "Anyone who wakes up stiff and wants a 10-minute flow to move every joint before the day starts.",
    ["Most mornings, before breakfast or after a shower.",
     "One breath per movement; slow the breath down as you go.",
     "Use cat-cow instead of cobra if your back or wrists complain.",
     "Add a round of Sun Salutation once this feels easy."],
    "Breathing, neck and shoulder rolls, cat-cow, low lunge, down dog and a gentle standing side stretch.",
    [E("Seated Breathing", 1, "6 breaths"), E("Neck Half-circles", 1, "5 each way"), E("Shoulder Rolls", 1, "5 each way"),
     E("Cat-Cow", 1, "8"), E("Low Lunge with reach", 1, "4 breaths/side"), E("Downward Dog with pedalling", 1, "6 breaths"),
     E("Forward Fold (knees soft)", 1, "5 breaths"), E("Standing Side Stretch", 1, "3 breaths/side"), E("Mountain Pose", 1, "5 breaths")],
    [SUN, NHS_FLEX])

add("yoga-bedtime-wind-down-15", "Somax Bedtime Wind-Down 15", "other", "beginner", "yoga-mobility",
    ["mobility", "general-fitness"], 15, 7, ["mat or bed", "pillow"], ["home", "travel", "older-adults", "minimal-equipment"],
    "Anyone wanting a quiet, low-effort stretch and breathing routine to switch off in the evening.",
    ["Nightly, in dim light, 30-60 minutes before bed - it can be done on the bed.",
     "Nothing should feel effortful; hold each position for slow breaths.",
     "Breathe out a little longer than you breathe in.",
     "Relaxing routines can help you unwind; persistent poor sleep is worth discussing with your GP."],
    "Floor or bed-based stretches with long exhales: child's pose, knees to chest, supine twist, figure-4, legs up the wall and body scan.",
    [E("Child's Pose", 1, "8 breaths"), E("Cat-Cow (slow)", 1, "6"), E("Knees to Chest", 1, "8 breaths"),
     E("Supine Twist", 1, "6 breaths/side"), E("Figure-4 Stretch (lying)", 1, "6 breaths/side"),
     E("Happy Baby or Reclined Butterfly", 1, "8 breaths"), E("Legs up the Wall", 1, "2-3 min"),
     E("Long-exhale Breathing (4 in, 6 out)", 1, "10 breaths")],
    [NHS_POST, EMORY, SUN])

add("yoga-desk-reset-10", "Somax Desk Reset 10", "other", "beginner", "yoga-mobility",
    ["mobility", "general-fitness"], 10, 5, ["chair", "wall"], ["busy", "time-efficient", "minimal-equipment", "travel"],
    "Desk workers who want a 10-minute standing-and-seated break to undo hours of sitting - a step up from a 5-minute chair stretch.",
    ["Once or twice per workday; set a reminder.",
     "Stand up for the second half - the change of position matters as much as the stretch.",
     "Move gently and keep breathing; no forcing.",
     "Combine with standing or walking breaks every 30-60 minutes."],
    "Seated neck, shoulder and spine moves, then standing hip-flexor, chest and calf stretches and a wall angel.",
    [E("Seated Neck Rotation", 1, "3/side"), E("Chin Tucks", 1, "10"), E("Seated Cat-Cow", 1, "8"),
     E("Seated Twist", 1, "20s/side"), E("Seated Figure-4 Hip Stretch", 1, "30s/side"),
     E("Standing Hip Flexor Stretch (split stance)", 1, "30s/side"), E("Doorway Chest Stretch", 1, "30s"),
     E("Wall Angels", 1, "8"), E("Wall Calf Stretch", 1, "30s/side")],
    [LIVELIGHTER, NHS_SIT, NHS_FLEX])

add("yoga-chair-older-adults-20", "Somax Chair Yoga for Older Adults", "other", "beginner", "yoga-mobility",
    ["mobility", "general-fitness"], 20, 3, ["chair"], ["home", "older-adults", "minimal-equipment"],
    "Older adults and anyone with limited mobility who want a gentle yoga-style routine done entirely from (or holding) a chair.",
    ["Two or three times a week, on top of walking and strength work.",
     "Hold stretches 30-60 seconds - older adults benefit from the longer holds.",
     "Sit tall at the front of a sturdy chair without wheels; stand only for moves you feel steady in, holding the chair back.",
     "Hip or back surgery? Check with your doctor before twists and forward bends."],
    "Seated breathing, arm raises, cat-cow, side bends, twists and hamstring stretch, then supported standing warrior and tree.",
    [E("Seated Breathing", 1, "6 breaths"), E("Seated Arm Raises with breath", 1, "6"), E("Seated Cat-Cow", 1, "8"),
     E("Seated Side Bend", 1, "30s/side"), E("Seated Twist", 1, "30s/side"), E("Seated Hamstring Stretch (heel forward)", 1, "30-60s/side"),
     E("Seated Ankle Circles", 1, "8 each way/side"), E("Supported Warrior 2 (hold chair back)", 1, "5 breaths/side"),
     E("Supported Tree Pose (toe down)", 1, "5 breaths/side"), E("Seated Rest with eyes closed", 1, "1 min")],
    [NHS_SIT, EMORY, NHS_FLEX])

add("yoga-hips-hamstrings-beginner-20", "Somax Hips & Hamstrings 20", "other", "beginner", "yoga-mobility",
    ["mobility"], 20, 5, ["mat", "strap or towel", "yoga block (optional)"], ["home", "minimal-equipment", "busy"],
    "Beginners who can't touch their toes or feel tight through the hips and hamstrings and want a plan that measurably improves it.",
    ["5 or more days a week - weekly stretching time matters most (aim for 5+ minutes per muscle group per week).",
     "Hold 30 seconds per stretch to mild tightness, not pain; no bouncing.",
     "Weeks 1-2: 2 holds each. Weeks 3-6: 3 holds or add a 5-second contract-relax.",
     "Test your toe-touch (or sit-and-reach) every 2 weeks at the same time of day after a warm-up."],
    "Lying strap hamstring stretches, seated fold, figure-4, low lunge and calf stretch - the posterior-chain plan for touching your toes.",
    [E("Gentle warm-up: march and leg swings", 1, "3 min"), E("Supine Hamstring Stretch with strap", 2, "30s/leg"),
     E("Hamstring Contract-Relax (press 5s, relax deeper)", 2, "1/leg"), E("Seated Forward Fold", 2, "30s"),
     E("Figure-4 Glute Stretch", 2, "30s/side"), E("Low Lunge Hip Flexor Stretch", 2, "30s/side"),
     E("Wall Calf Stretch", 1, "30s/leg"), E("Cat-Cow", 1, "8")],
    [NHS_POST, EMORY, NHS_FLEX])

add("yoga-neck-shoulders-10", "Somax Neck & Shoulder Release 10", "other", "beginner", "yoga-mobility",
    ["mobility"], 10, 5, ["chair", "towel", "wall"], ["busy", "time-efficient", "minimal-equipment", "travel", "home"],
    "People who carry tension in the neck and shoulders from screens, driving or stress.",
    ["Daily or most days; also good as a mid-afternoon break.",
     "Small, slow movements; never crank the neck.",
     "Hold stretches 20-30 seconds and breathe into the area.",
     "Pins and needles or pain down the arm - stop and get it checked."],
    "Gentle neck turns and tilts, chin tucks, shoulder rolls, towel shoulder stretch, thread the needle and wall slides.",
    [E("Neck Rotation", 1, "3/side, 5s hold"), E("Neck Side Tilt", 1, "20s/side"), E("Chin Tucks", 2, "8"),
     E("Shoulder Rolls", 1, "8 each way"), E("Towel Shoulder & Upper-arm Stretch", 1, "20-30s/side"),
     E("Cross-body Shoulder Stretch", 1, "20-30s/side"), E("Thread the Needle", 1, "5 breaths/side"),
     E("Wall Slides", 1, "8"), E("Eagle Arms", 1, "5 breaths/side")],
    [NHS_FLEX, EMORY, LIVELIGHTER])

add("yoga-runners-post-run-15", "Somax Runner's Post-Run Stretch 15", "other", "beginner", "yoga-mobility",
    ["mobility", "endurance"], 15, 3, ["mat", "wall"], ["home", "outdoor", "time-efficient", "minimal-equipment"],
    "Runners of any level who want a slightly longer post-run routine than a quick 5-minute cool-down, focused on calves, hamstrings, hips and quads.",
    ["After runs, once you've walked for a few minutes and your breathing has settled.",
     "Hold 30 seconds per side; take two holds on whatever feels tightest.",
     "Stretching hasn't been shown to prevent injuries - do it because it feels good and keeps range.",
     "Add Somax Runner's Mobility 25 on a rest day for deeper work."],
    "Wall calf and soleus stretches, standing quad, lying hamstring, figure-4, low lunge, down dog and child's pose.",
    [E("Wall Calf Stretch (straight knee)", 1, "30s/leg"), E("Wall Soleus Stretch (bent knee)", 1, "30s/leg"),
     E("Standing Quad Stretch", 1, "30s/leg"), E("Lying Hamstring Stretch", 1, "30s/leg"),
     E("Figure-4 Glute Stretch", 1, "30s/side"), E("Low Lunge Hip Flexor Stretch", 1, "30s/side"),
     E("Downward Dog", 1, "5 breaths"), E("Child's Pose", 1, "5 breaths")],
    [NHS_POST, SUN, EMORY])

add("yoga-lifters-warm-up-10", "Somax Lifter's Mobility Warm-Up 10", "other", "beginner", "yoga-mobility",
    ["mobility", "strength"], 10, 3, ["mat", "bands"], ["full-gym", "time-efficient", "busy"],
    "Gym-goers who want a quick dynamic routine before squats, deadlifts and presses instead of static stretching.",
    ["Before every lifting session, after 3-5 minutes on a bike or rower.",
     "Dynamic only - move in and out of each position, no long holds before lifting.",
     "Then do 2-3 light warm-up sets of your first lift.",
     "Save long static stretching for after training or rest days."],
    "Cat-cow, world's greatest stretch, hip airplanes, goblet squat pry, band pull-aparts and dislocates, glute bridges.",
    [E("Cat-Cow", 1, "8"), E("World's Greatest Stretch", 1, "4/side"), E("90/90 Hip Switches", 1, "6/side"),
     E("Goblet Squat Pry (light)", 1, "5 breaths"), E("Band Pull-apart", 1, "15"), E("Band Shoulder Dislocates", 1, "10"),
     E("Glute Bridge", 1, "12"), E("Inchworm to Down Dog", 1, "5")],
    [SUN, STRONG_A, FIFA])

add("yoga-gentle-back-15", "Somax Gentle Back Mobility 15", "other", "beginner", "yoga-mobility",
    ["mobility", "general-fitness"], 15, 5, ["mat", "pillow"], ["home", "older-adults", "minimal-equipment", "time-efficient"],
    "People with an everyday stiff or achy lower back (no red-flag symptoms) who want a calm daily mobility routine.",
    ["Daily or most days - little and often.",
     "Mild discomfort is fine; it shouldn't increase your symptoms afterwards.",
     "Keep walking and doing normal activities - rest makes backs stiffer.",
     "Leg numbness or weakness, bladder or bowel changes, or worsening pain: see a doctor."],
    "Knee rolls, pelvic tilts, knee hugs, bridges, cat-cow, child's pose with side reach, prone press-ups and standing side bends.",
    [E("Pelvic Tilts", 1, "10"), E("Knee Rolls", 1, "10/side"), E("Single Knee Hug", 1, "20s/side"),
     E("Bridge", 1, "10"), E("Cat-Cow", 1, "8"), E("Child's Pose with side reach", 1, "30s/side"),
     E("Prone Press-up (to comfort)", 1, "8"), E("Standing Side Bend", 1, "5/side")],
    [BHFT, EMORY, NHS_FLEX])

add("yoga-restorative-30", "Somax Restorative Yoga 30", "other", "beginner", "yoga-mobility",
    ["mobility", "general-fitness"], 30, 2, ["mat", "pillows or bolster", "blanket", "yoga blocks"], ["home", "older-adults"],
    "Anyone who needs a calm, fully supported session - after a hard training week, a stressful day or as a gentle rest-day practice.",
    ["Once or twice a week, or on rest days.",
     "Everything is propped so muscles can let go; you should feel almost no effort.",
     "Stay 2-5 minutes in each shape with slow breathing.",
     "Come out slowly, rolling to your side before sitting up."],
    "Long, propped holds: supported child's pose, reclined butterfly, supported bridge, side-lying twist, legs up the wall and rest.",
    [E("Supported Child's Pose (bolster)", 1, "3 min"), E("Supported Reclined Butterfly", 1, "4 min"),
     E("Supported Bridge (block under sacrum)", 1, "3 min"), E("Side-lying Supported Twist", 1, "2 min/side"),
     E("Supported Forward Fold (seated)", 1, "3 min"), E("Legs up the Wall", 1, "5 min"),
     E("Final Relaxation (Savasana)", 1, "5 min")],
    [SUN, NHS_POST])

add("yoga-balance-mobility-older-25", "Somax Balance & Mobility for Older Adults", "other", "beginner", "yoga-mobility",
    ["mobility", "general-fitness"], 25, 3, ["chair", "wall", "mat"], ["home", "older-adults", "minimal-equipment"],
    "Over-60s who want to stay steady on their feet and keep their joints moving, mixing gentle yoga poses with balance drills.",
    ["Three times a week, plus walking on other days.",
     "Always have a chair back or kitchen bench within reach for the balance moves.",
     "Progress balance: two hands, one hand, fingertip, hands-free.",
     "Fallen in the last 12 months or feel dizzy? See your GP first and keep balance work supported."],
    "Standing mountain and warrior poses, heel-toe stance and walking, one-leg stands, chair squats and long-hold stretches.",
    [E("Mountain Pose with breathing", 1, "5 breaths"), E("Heel Raises (hold chair)", 2, "10"),
     E("Chair Squat (sit-to-stand)", 2, "8"), E("Tandem Stance (heel-to-toe)", 2, "10s/side"),
     E("Heel-to-toe Walk", 2, "10 steps"), E("One-leg Stand (hold support)", 2, "10s/side"),
     E("Supported Warrior 1", 1, "5 breaths/side"), E("Standing Calf Stretch at wall", 1, "30-60s/side"),
     E("Seated Hamstring Stretch", 1, "30-60s/side"), E("Seated Chest Stretch", 1, "30s")],
    [EMORY, NHS_SIT, NHS_FLEX])

add("yoga-runners-mobility-25", "Somax Runner's Mobility 25", "other", "intermediate", "yoga-mobility",
    ["mobility", "sport-performance"], 25, 2, ["mat", "foam roller", "wall"], ["home", "minimal-equipment"],
    "Regular runners who want a rest-day session for ankle, hip and upper-back mobility that carries over to stride and posture on the run.",
    ["Twice a week on rest or easy days.",
     "Dynamic drills first, then the longer holds.",
     "Ankle rockers: knee tracks over the toes, heel stays down.",
     "Track ankle range with the knee-to-wall test every 4 weeks."],
    "Ankle rockers, hip CARs, 90/90, couch stretch, pigeon, thoracic rotations and a hamstring flow.",
    [E("Foam Roll Calves and Quads", 1, "2 min"), E("Knee-to-wall Ankle Rockers", 2, "10/side"),
     E("Standing Hip CARs", 1, "4 each way/side"), E("90/90 Hip Switches", 2, "8/side"),
     E("Couch Stretch (rear foot on wall)", 1, "45s/side"), E("Pigeon Pose", 1, "45s/side"),
     E("Open Book", 1, "8/side"), E("Pyramid Pose (hamstring)", 1, "30s/side"), E("Lizard Lunge", 1, "30s/side")],
    [NHS_POST, SUN, UT2])

add("yoga-lifters-squat-depth-20", "Somax Lifter's Squat-Depth Mobility", "other", "intermediate", "yoga-mobility",
    ["mobility", "strength"], 20, 3, ["mat", "kettlebell or dumbbell", "wall", "small plate"], ["full-gym", "home"],
    "Lifters who can't squat to depth without heels lifting, knees caving or the back rounding, and want targeted ankle, hip and adductor work.",
    ["Three times a week - after training or as a standalone session.",
     "Loaded stretches (goblet hold, Cossack) use light weight as a counterbalance, not a load.",
     "Breathe into the bottom positions and spend time there.",
     "Film your squat from the side every 4 weeks to see changes."],
    "Ankle rockers, adductor rock-backs, frog, Cossack squats, goblet squat holds, deep squat with reach and pigeon.",
    [E("Knee-to-wall Ankle Rockers", 2, "10/side"), E("Adductor Rock-backs", 2, "8/side"),
     E("Frog Stretch", 1, "60s"), E("Cossack Squat (light counterweight)", 3, "5/side"),
     E("Goblet Squat Hold with pry", 3, "30s", weight="light kettlebell"), E("Deep Squat with thoracic reach", 1, "5/side"),
     E("Pigeon Pose", 1, "45s/side"), E("Elevated-heel Squat (plate) for comparison", 1, "8")],
    [STRONG_A, SUN, NHS_POST])

add("yoga-lifters-overhead-shoulders-20", "Somax Lifter's Overhead & Shoulder Mobility", "other", "intermediate", "yoga-mobility",
    ["mobility", "strength"], 20, 3, ["mat", "bands", "foam roller", "light dumbbell"], ["full-gym", "home"],
    "Lifters whose lower back arches or elbows bend when pressing overhead, or who feel tight in the lats and chest.",
    ["Three times a week, after upper-body training or as a standalone.",
     "Keep the ribs down in every overhead position - if the back arches, you've run out of shoulder range.",
     "Hold the end of each stretch and breathe; add the strength drills only once range improves.",
     "Shoulder pinching or clicking with pain - reduce range and get it assessed."],
    "T-spine extensions, lat and pec stretches, band dislocates, wall slides and a light overhead carry.",
    [E("T-spine Extension over Foam Roller", 1, "10"), E("Open Book", 1, "8/side"),
     E("Kneeling Lat Stretch (elbows on bench)", 2, "30s"), E("Doorway Pec Stretch", 2, "30s/side"),
     E("Band Shoulder Dislocates", 2, "10"), E("Wall Slides (ribs down)", 2, "10"),
     E("Puppy Pose", 1, "6 breaths"), E("Half-kneeling Overhead Carry Hold (light)", 2, "20s/side"),
     E("Prone Y-T Raises", 2, "8 each")],
    [STRONG_A, NHS_FLEX, EMORY])

add("yoga-vinyasa-flow-30", "Somax Vinyasa Flow 30", "other", "intermediate", "yoga-mobility",
    ["mobility", "general-fitness", "strength"], 30, 3, ["mat", "yoga blocks"], ["home", "minimal-equipment", "travel"],
    "People with some yoga experience who want a flowing 30-minute practice for mobility, strength and focus.",
    ["Two or three times a week.",
     "One breath, one movement; hold standing poses for 5 breaths.",
     "Take child's pose whenever you need to - the breath leads, not the clock.",
     "Use blocks under the hands in lunges and triangle if the floor feels far away."],
    "Sun Salutations, a warrior and triangle standing series, balance, then seated forward folds and twists.",
    [E("Sun Salutation A", 3, "1 round"), E("Warrior 1", 1, "5 breaths/side"), E("Warrior 2", 1, "5 breaths/side"),
     E("Extended Side Angle", 1, "5 breaths/side"), E("Triangle Pose", 1, "5 breaths/side"),
     E("Tree Pose", 1, "5 breaths/side"), E("Chair Pose", 2, "5 breaths"), E("Low Lunge Twist", 1, "4 breaths/side"),
     E("Seated Forward Fold", 1, "8 breaths"), E("Seated Twist", 1, "5 breaths/side"), E("Savasana", 1, "3 min")],
    [SUN, NHS_FLEX])

add("yoga-hip-opener-30", "Somax Hip Opener Flow 30", "other", "intermediate", "yoga-mobility",
    ["mobility"], 30, 3, ["mat", "yoga blocks", "strap"], ["home", "minimal-equipment"],
    "People who sit a lot, runners and lifters who want a deeper session for all directions of hip movement.",
    ["Two or three times a week.",
     "Warm up with the flow before the long holds.",
     "Use blocks under hips in pigeon and lizard so the lower back stays comfortable.",
     "Knee pain in pigeon? Swap for figure-4 on your back."],
    "Low lunge, lizard, pigeon, frog, happy baby, reclined butterfly and 90/90, with a warm-up flow.",
    [E("Sun Salutation (half rounds)", 2, "1 round"), E("Low Lunge", 1, "6 breaths/side"), E("Lizard Pose", 1, "6 breaths/side"),
     E("Pigeon Pose", 1, "8 breaths/side"), E("Frog Pose", 1, "8 breaths"), E("90/90 Hold with lean", 1, "6 breaths/side"),
     E("Garland Squat (Malasana)", 1, "6 breaths"), E("Happy Baby", 1, "6 breaths"), E("Reclined Butterfly", 1, "2 min")],
    [SUN, NHS_POST, EMORY])

add("yoga-hamstring-builder-20", "Somax Touch-Your-Toes Builder", "other", "intermediate", "yoga-mobility",
    ["mobility"], 20, 5, ["mat", "strap", "step"], ["home", "minimal-equipment", "busy"],
    "People who've done some stretching and want a focused 6-12 week plan to finally touch their toes or improve sit-and-reach.",
    ["5+ days a week; on busy days just do the 5-minute micro version (first three exercises).",
     "Weeks 1-2: 2 x 30s holds. Weeks 3-6: 3 x 30s plus contract-relax. Weeks 7+: add the Jefferson curl with a light weight.",
     "Mild tightness only - flexibility gains come from total weekly time, not intensity.",
     "Measure every 2 weeks after warming up; expect visible change within about 6 weeks."],
    "Supine strap hamstring stretches with contract-relax, step hamstring stretch, ragdoll fold, pyramid and a light loaded stretch.",
    [E("Supine Strap Hamstring Stretch", 3, "30s/leg"), E("Hamstring Contract-Relax (5s press, 20s stretch)", 2, "1/leg"),
     E("Standing Hamstring Stretch (heel on step)", 2, "30s/leg"), E("Ragdoll Forward Hang (knees soft)", 2, "30s"),
     E("Pyramid Pose (blocks)", 1, "30s/side"), E("Seated Forward Fold", 2, "30s"),
     E("Jefferson Curl (weeks 7+)", 2, "5", weight="2-5kg"), E("Calf Stretch", 1, "30s/leg")],
    [NHS_POST, EMORY, NHS_FLEX])

add("yoga-strength-flow-45", "Somax Yoga Strength Flow 45", "other", "intermediate", "yoga-mobility",
    ["strength", "mobility", "general-fitness"], 45, 3, ["mat", "yoga blocks"], ["home", "minimal-equipment"],
    "Yoga practitioners who want more strength from their practice - longer holds, chaturangas, chair and warrior 3.",
    ["Two or three times a week; alternate with a gentler flow.",
     "Hold strength poses 5-8 breaths and keep the breath smooth.",
     "Lower chaturanga from the knees until you can keep a straight line from the toes.",
     "Rest in child's pose between standing sequences as needed."],
    "Sun Salutation B rounds, warrior 3, chair twist, crescent lunge, plank-to-chaturanga, side plank, boat and bridge.",
    [E("Sun Salutation A", 2, "1 round"), E("Sun Salutation B", 3, "1 round"), E("Crescent Lunge", 1, "6 breaths/side"),
     E("Warrior 3", 1, "5 breaths/side"), E("Chair Pose Twist", 1, "5 breaths/side"), E("Plank to Chaturanga", 3, "5"),
     E("Side Plank", 1, "5 breaths/side"), E("Boat Pose", 3, "5 breaths"), E("Bridge Pose", 2, "6 breaths"),
     E("Seated Twist and Forward Fold", 1, "2 min"), E("Savasana", 1, "4 min")],
    [SUN, NHS_STRENGTH])

add("yoga-active-recovery-30", "Somax Active Recovery Day 30", "other", "intermediate", "yoga-mobility",
    ["mobility", "general-fitness"], 30, 1, ["mat", "foam roller"], ["home", "minimal-equipment"],
    "People training 4+ days a week who want a structured easy day that leaves them fresher rather than sitting still.",
    ["Once or twice a week on rest days.",
     "Easy effort throughout - talk-test pace on the walk or bike.",
     "Foam roll slowly; pause on tender spots but keep it below 6/10 discomfort.",
     "Finish with the breathing - it's part of the session."],
    "Easy cardio, foam rolling, a mobility circuit and a short breathing finish.",
    [E("Easy walk, bike or swim", 1, "10 min"), E("Foam Roll: calves, quads, glutes, upper back", 1, "5 min"),
     E("Cat-Cow", 1, "8"), E("World's Greatest Stretch", 1, "4/side"), E("90/90 Hip Switches", 1, "6/side"),
     E("Thread the Needle", 1, "5/side"), E("Downward Dog with pedalling", 1, "6 breaths"),
     E("Supine Twist", 1, "45s/side"), E("Box Breathing (4-4-4-4)", 1, "2 min")],
    [NHS_POST, SUN, EMORY])

add("yoga-travel-mobility-12", "Somax Travel Mobility 12", "other", "intermediate", "yoga-mobility",
    ["mobility", "general-fitness"], 12, 3, ["bodyweight"], ["travel", "busy", "time-efficient", "minimal-equipment"],
    "Frequent travellers who want to undo long flights, drives and hotel beds with no equipment at all.",
    ["On arrival and each morning of the trip.",
     "Seated moves can be done on the plane or in the car (as a passenger).",
     "Hold standing stretches 30 seconds; keep moving between them.",
     "Long-haul flight? Do the ankle and calf moves every hour as well."],
    "Seated ankle pumps and twists, then standing hip-flexor, hamstring, chest and spine moves in a hotel room.",
    [E("Seated Ankle Pumps", 1, "20"), E("Seated Knee Lifts", 1, "10/side"), E("Seated Twist", 1, "20s/side"),
     E("Standing Hip Flexor Stretch", 1, "30s/side"), E("Standing Hamstring Stretch (heel on bed edge)", 1, "30s/side"),
     E("Doorway Chest Stretch", 1, "30s"), E("Standing Cat-Cow (hands on thighs)", 1, "8"),
     E("Deep Squat Hold (hold door frame)", 1, "30s"), E("Wall Calf Stretch", 1, "30s/side")],
    [LIVELIGHTER, NHS_SIT, NHS_POST])

add("yoga-yin-long-holds-45", "Somax Yin-Style Long Holds 45", "other", "intermediate", "yoga-mobility",
    ["mobility"], 45, 2, ["mat", "bolster or pillows", "yoga blocks"], ["home"],
    "People who want deep, quiet flexibility work with long passive holds, on rest days or evenings.",
    ["Once or twice a week, ideally in the evening and not right before hard training.",
     "Hold each shape 3-4 minutes at a gentle stretch, using props so you can stay relaxed.",
     "Come out slowly and pause between poses.",
     "Hypermobile joints? Keep holds shorter and avoid hanging at end range."],
    "Long-held floor poses for hips, spine and legs: butterfly, dragon, sphinx, caterpillar, twisted roots, shoelace and savasana.",
    [E("Butterfly", 1, "3 min"), E("Dragon (low lunge)", 1, "3 min/side"), E("Sphinx", 1, "3 min"),
     E("Caterpillar (seated forward fold)", 1, "4 min"), E("Shoelace or Figure-4", 1, "3 min/side"),
     E("Twisted Roots (supine twist)", 1, "3 min/side"), E("Savasana", 1, "5 min")],
    [SUN, EMORY])

add("yoga-power-vinyasa-45", "Somax Power Vinyasa 45", "other", "advanced", "yoga-mobility",
    ["strength", "mobility", "endurance"], 45, 3, ["mat", "yoga blocks"], ["home", "minimal-equipment"],
    "Experienced yoga practitioners who want a vigorous, heat-building flow with arm balances and strong standing work.",
    ["Two or three times a week; not on the same day as heavy lower-body lifting.",
     "Continuous breath-led flow - aim to rest only in down dog.",
     "Arm balances are optional; build them on the Arm Balance & Inversion Prep day first.",
     "Hydrate and finish with a full savasana."],
    "Sun Salutation B rounds, a long standing sequence with half moon and revolved poses, crow pose, wheel and a cool-down.",
    [E("Sun Salutation A", 3, "1 round"), E("Sun Salutation B", 5, "1 round"),
     E("Warrior 2 to Reverse Warrior flow", 2, "5 breaths/side"), E("Half Moon", 1, "5 breaths/side"),
     E("Revolved Triangle", 1, "5 breaths/side"), E("Revolved Chair", 1, "5 breaths/side"),
     E("Crow Pose", 3, "5 breaths"), E("Side Plank with top-leg lift", 1, "5 breaths/side"),
     E("Wheel or Bridge", 3, "5 breaths"), E("Seated Forward Fold", 1, "10 breaths"), E("Savasana", 1, "5 min")],
    [SUN])

add("yoga-arm-balance-inversion-prep-30", "Somax Arm Balance & Inversion Prep", "other", "advanced", "yoga-mobility",
    ["strength", "mobility"], 30, 2, ["mat", "yoga blocks", "wall"], ["home"],
    "Strong yoga practitioners who want a structured path to crow, side crow, forearm stand and handstand against a wall.",
    ["Twice a week, fresh, at the start of a practice.",
     "Wrist warm-ups every time; stop if wrists ache.",
     "Wall work only until you can hold the wall drills for 30 seconds with control.",
     "Not for anyone with uncontrolled high blood pressure, glaucoma or recent neck or shoulder injury."],
    "Wrist prep, hollow body and pike compressions, crow and side-crow drills, dolphin and wall walks for inversions.",
    [E("Wrist Warm-up Circuit", 1, "2 min"), E("Hollow Body Hold", 3, "20s"), E("Seated Pike Compression Lifts", 3, "8"),
     E("Crow Pose (blocks under feet)", 4, "10s"), E("Side Crow Prep (twisted squat)", 2, "5 breaths/side"),
     E("Dolphin Pose with walk-ins", 3, "6 breaths"), E("Wall Walk", 3, "3"),
     E("Chest-to-wall Handstand Hold", 3, "15-30s"), E("Child's Pose", 1, "1 min")],
    [SUN])

add("yoga-advanced-mobility-cars-30", "Somax Advanced Joint Control (CARs & End-Range)", "other", "advanced", "yoga-mobility",
    ["mobility", "strength"], 30, 3, ["mat", "yoga blocks", "light dumbbells"], ["home", "minimal-equipment", "full-gym"],
    "Experienced trainees who already stretch regularly and want to own their end range with strength - complementing the Somax Deep Flexibility Flow.",
    ["Three times a week, at least one day apart.",
     "CARs: the slowest, biggest circle you can make with zero compensation elsewhere.",
     "End-range lifts: 5-second holds; if the limb can't lift, keep the isometric effort.",
     "Pair with Somax Deep Flexibility Flow on alternate days for passive range."],
    "Controlled articular rotations for spine, hips and shoulders, end-range lift-offs, Cossack and Jefferson curls and loaded pigeon.",
    [E("Spine CARs (cat-cow segmental)", 1, "3 slow"), E("Hip CARs (quadruped)", 2, "3 each way/side"),
     E("Shoulder CARs (standing)", 2, "3 each way/side"), E("90/90 Hip Lift-offs (5s hold)", 3, "5/side"),
     E("Seated Pancake Leg Lifts", 3, "8/side"), E("Cossack Squat", 3, "6/side", weight="light"),
     E("Jefferson Curl", 3, "6", weight="2-8kg"), E("Prone Y-T-W", 2, "6 each"),
     E("Pigeon with active lifts", 2, "6/side")],
    [SUN, EMORY])

with open(OUT, "w") as f:
    json.dump(P, f, indent=2, ensure_ascii=False)
print(OUT, len(P))
